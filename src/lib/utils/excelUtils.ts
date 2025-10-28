import * as XLSX from 'xlsx';
import { DATA_TYPES } from '@/types';
import { mockDataByType } from '../mockData';

export interface ExportHistory {
  id: string;
  types: string[];
  format: string;
  date: string;
  filename: string;
  rowCount: number;
}

// Normalise les noms de colonnes Excel (trim, toLowerCase, espaces → _)
export const normalizeKey = (key: string): string => {
  return key.trim().toLowerCase().replace(/\s+/g, '_');
};

// Normalise les noms de types (capitalize first letter)
export const normalizeTypeName = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

// Mapping des clés Excel vers les clés attendues
export const normalizeRowKeys = (row: Record<string, any>): Record<string, any> => {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeKey(key)] = value;
  }
  return normalized;
};

// Génère un fichier Excel stylisé
export const generateStyledExcelFile = (selectedTypes: string[], format: string): Blob => {
  const workbook = XLSX.utils.book_new();

  selectedTypes.forEach((type) => {
    const data = mockDataByType[type as keyof typeof mockDataByType] || [];
    const worksheet = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);

    // Style des en-têtes
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // Largeur des colonnes
    const cols = Object.keys(Array.isArray(data) && data[0] ? data[0] : {}).map(() => ({ wch: 20 }));
    worksheet['!cols'] = cols;

    XLSX.utils.book_append_sheet(workbook, worksheet, type);
  });

  if (format === 'excel') {
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } else if (format === 'csv') {
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(firstSheet);
    return new Blob([csv], { type: 'text/csv' });
  } else {
    const json = selectedTypes.reduce((acc, type) => {
      acc[type] = mockDataByType[type as keyof typeof mockDataByType];
      return acc;
    }, {} as Record<string, any>);
    return new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  }
};

// Télécharge un fichier
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Parse un fichier Excel avec normalisation des clés
export const parseExcelFile = async (file: File): Promise<Record<string, any[]>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const result: Record<string, any[]> = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          // Normaliser les clés de chaque ligne
          const normalizedData = jsonData.map((row: any) => normalizeRowKeys(row));
          result[normalizeTypeName(sheetName)] = normalizedData;
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
};

// Valide les dépendances
export const validateDependencies = (
  type: string, 
  data: Record<string, any>,
  existingData: Record<string, any[]>
): { valid: boolean; message?: string } => {
  const typeConfig = DATA_TYPES.find((t) => t.value === type);
  if (!typeConfig) return { valid: true };

  for (const dep of typeConfig.dependencies) {
    const depField = `${dep.toLowerCase()}_id`;
    const depId = data[depField];
    
    if (!depId) continue;

    const depData = existingData[dep] || [];
    const exists = depData.some((item: any) => item.id === depId);

    if (!exists) {
      return {
        valid: false,
        message: `Dépendance manquante: ${dep} avec ID "${depId}" introuvable`,
      };
    }
  }

  return { valid: true };
};

// Valide le format des valeurs (nombres, dates, booléens)
export const validateFieldFormats = (type: string, data: Record<string, any>): { valid: boolean; message?: string } => {
  // Validation des nombres positifs
  const numberFields: Record<string, string[]> = {
    Vehicule: ['capacite_reservoir', 'consommation_nominale'],
    Trajet: ['distance_km'],
    Plein: ['litres', 'prix_unitaire', 'odometre'],
    Geofence: ['lat', 'lon', 'rayon_metres'],
    Alerte: ['score'],
  };

  const numFields = numberFields[type] || [];
  for (const field of numFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const num = Number(data[field]);
      if (isNaN(num) || num < 0) {
        return {
          valid: false,
          message: `Le champ "${field}" doit être un nombre positif (valeur reçue: ${data[field]})`,
        };
      }
    }
  }

  // Validation des dates
  const dateFields: Record<string, string[]> = {
    Affectation: ['date_debut', 'date_fin'],
    Trajet: ['date_debut', 'date_fin'],
    Plein: ['date'],
    Alerte: ['date_detection'],
  };

  const dtFields = dateFields[type] || [];
  for (const field of dtFields) {
    if (data[field] && isNaN(Date.parse(data[field]))) {
      return {
        valid: false,
        message: `Le champ "${field}" doit être une date valide (valeur reçue: ${data[field]})`,
      };
    }
  }

  // Validation des booléens
  if (type === 'Vehicule' && data['actif'] !== undefined) {
    const val = data['actif'];
    if (typeof val !== 'boolean' && val !== 'true' && val !== 'false' && val !== 0 && val !== 1) {
      return {
        valid: false,
        message: `Le champ "actif" doit être un booléen (valeur reçue: ${val})`,
      };
    }
  }

  return { valid: true };
};

// Valide les champs requis
export const validateRequiredFields = (type: string, data: Record<string, any>): { valid: boolean; message?: string } => {
  const requiredFieldsByType: Record<string, string[]> = {
    Site: ['nom', 'ville', 'pays'],
    User: ['email', 'matricule', 'nom', 'prenom', 'role'],
    Vehicule: ['immatriculation', 'marque', 'modele', 'type', 'capacite_reservoir', 'consommation_nominale', 'actif'],
    Affectation: ['vehicule_id', 'chauffeur_id', 'date_debut', 'date_fin'],
    Trajet: ['vehicule_id', 'chauffeur_id', 'date_debut', 'date_fin', 'distance_km', 'type_saisie'],
    Plein: ['vehicule_id', 'chauffeur_id', 'date', 'litres', 'prix_unitaire', 'odometre', 'type_saisie'],
    Geofence: ['nom', 'type', 'lat', 'lon', 'rayon_metres'],
    Alerte: ['vehicule_id', 'type', 'titre', 'description', 'score', 'status', 'date_detection'],
  };

  const requiredFields = requiredFieldsByType[type] || [];
  const missingFields = requiredFields.filter(field => !data[field] && data[field] !== false && data[field] !== 0);

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Champs requis manquants: ${missingFields.join(', ')}`,
    };
  }

  return { valid: true };
};
