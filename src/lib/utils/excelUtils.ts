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

// Validation des champs requis par type de données
const requiredFieldsByType: Record<string, string[]> = {
  Site: ['nom', 'ville', 'pays'],
  Geofence: ['nom', 'type', 'lat', 'lon', 'rayon_metres'],
  User: ['email', 'matricule', 'nom', 'prenom', 'role', 'password_hash'],
  Vehicule: ['immatriculation', 'marque', 'modele', 'type', 'capacite_reservoir', 'consommation_nominale'],
  Affectation: ['vehicule_id', 'chauffeur_id', 'date_debut', 'date_fin'],
  Trip: ['vehicule_id', 'chauffeur_id', 'date_debut', 'date_fin', 'distance_km', 'type_saisie'],
  TraceGps: ['trajet_id', 'sequence', 'latitude', 'longitude', 'timestamp'],
  Plein: ['vehicule_id', 'chauffeur_id', 'date', 'litres', 'prix_unitaire', 'odometre', 'station', 'type_saisie'],
  PleinExifMetadata: ['plein_id'],
  NiveauCarburant: ['vehicule_id', 'timestamp', 'niveau', 'type'],
  Parametre: ['id', 'label', 'description', 'valeur', 'unite', 'min', 'max'],
  Correction: ['table', 'record_id', 'champ', 'old_value', 'new_value', 'status', 'requested_by', 'requested_at'],
};

// Validation des formats de champs spécifiques
const fieldFormatsByType: Record<string, Record<string, 'number' | 'date' | 'boolean'>> = {
  Site: {},
  Geofence: { lat: 'number', lon: 'number', rayon_metres: 'number' },
  User: { site_id: 'number' },
  Vehicule: { site_id: 'number', capacite_reservoir: 'number', consommation_nominale: 'number', carburant_initial: 'number', actif: 'boolean' },
  Affectation: { vehicule_id: 'number', chauffeur_id: 'number', date_debut: 'date', date_fin: 'date' },
  Trip: { vehicule_id: 'number', chauffeur_id: 'number', date_debut: 'date', date_fin: 'date', distance_km: 'number' },
  TraceGps: { trajet_id: 'number', sequence: 'number', latitude: 'number', longitude: 'number', timestamp: 'date' },
  Plein: { vehicule_id: 'number', chauffeur_id: 'number', date: 'date', litres: 'number', prix_unitaire: 'number', montant_total: 'number', odometre: 'number', latitude: 'number', longitude: 'number' },
  PleinExifMetadata: { plein_id: 'number', date: 'date', latitude: 'number', longitude: 'number' },
  NiveauCarburant: { vehicule_id: 'number', plein_id: 'number', timestamp: 'date', niveau: 'number' },
  Parametre: { valeur: 'number', min: 'number', max: 'number' },
  Correction: { validated_by: 'number', requested_at: 'date', validated_at: 'date' },
};

// Champs qui acceptent les valeurs négatives (coordonnées géographiques)
const allowNegativeFields = ['lat', 'lon', 'latitude', 'longitude'];

// Valide le format des valeurs (nombres, dates, booléens)
export const validateFieldFormats = (type: string, data: Record<string, any>): { valid: boolean; message?: string } => {
  const formats = fieldFormatsByType[type] || {};
  
  for (const [field, format] of Object.entries(formats)) {
    const value = data[field];
    
    if (value === undefined || value === null) continue;
    
    if (format === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        return {
          valid: false,
          message: `Le champ "${field}" doit être un nombre (valeur reçue: ${value})`,
        };
      }
      // Vérifier si le champ accepte les valeurs négatives
      if (num < 0 && !allowNegativeFields.includes(field) && (field !== "lat" || "long")) {
        return {
          valid: false,
          message: `Le champ "${field}" doit être un nombre positif (valeur reçue: ${value})`,
        };
      }
    } else if (format === 'date') {
      if (isNaN(Date.parse(value))) {
        return {
          valid: false,
          message: `Le champ "${field}" doit être une date valide (valeur reçue: ${value})`,
        };
      }
    } else if (format === 'boolean') {
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 0 && value !== 1) {
        return {
          valid: false,
          message: `Le champ "${field}" doit être un booléen (valeur reçue: ${value})`,
        };
      }
    }
  }

  return { valid: true };
};

// Valide les champs requis
export const validateRequiredFields = (type: string, data: Record<string, any>): { valid: boolean; message?: string } => {
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
