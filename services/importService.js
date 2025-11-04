/**
 * Service d'importation de données TrackFuel360
 * Gère le parsing Excel, la validation et l'insertion ordonnée en base de données
 */

const XLSX = require('xlsx');

/**
 * Parse un fichier Excel et retourne les données structurées par onglet
 * @param {Buffer} fileBuffer - Buffer du fichier Excel
 * @returns {Object} Données parsées par type (clé = nom de l'onglet)
 */
const parseExcelFile = (fileBuffer) => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const result = {};

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Normaliser les clés (trim, toLowerCase, espaces → _)
      const normalizedData = jsonData.map((row) => {
        const normalized = {};
        for (const [key, value] of Object.entries(row)) {
          const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
          normalized[normalizedKey] = value;
        }
        return normalized;
      });

      // Normaliser le nom du type (capitalize)
      const typeName = sheetName.charAt(0).toUpperCase() + sheetName.slice(1).toLowerCase();
      result[typeName] = normalizedData;
    });

    return result;
  } catch (error) {
    throw new Error(`Erreur lors du parsing du fichier Excel: ${error.message}`);
  }
};

// Champs requis par type de données
const requiredFieldsByType = {
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

/**
 * Valide les champs requis pour un type de données
 * @param {string} type - Type de données (Site, User, Vehicule, etc.)
 * @param {Object} data - Ligne de données à valider
 * @returns {Object} { valid: boolean, message?: string }
 */
const validateRequiredFields = (type, data) => {
  const requiredFields = requiredFieldsByType[type] || [];
  const missingFields = requiredFields.filter(
    (field) => !data[field] && data[field] !== false && data[field] !== 0
  );

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Champs requis manquants: ${missingFields.join(', ')}`,
    };
  }

  return { valid: true };
};

// Formats de champs par type
const fieldFormatsByType = {
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

/**
 * Valide le format des données (nombres, dates, booléens)
 * @param {string} type - Type de données
 * @param {Object} data - Ligne de données à valider
 * @returns {Object} { valid: boolean, message?: string }
 */
const validateFieldFormats = (type, data) => {
  const formats = fieldFormatsByType[type] || {};
  
  for (const [field, format] of Object.entries(formats)) {
    const value = data[field];
    
    if (value === undefined || value === null) continue;
    
    if (format === 'number') {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
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

// Dépendances entre types de données
const dependenciesByType = {
  Site: [],
  Geofence: [],
  User: ['Site'],
  Vehicule: ['Site'],
  Affectation: ['Vehicule', 'User'],
  Trip: ['Vehicule', 'User'],
  TraceGps: ['Trip'],
  Plein: ['Vehicule', 'User'],
  PleinExifMetadata: ['Plein'],
  NiveauCarburant: ['Vehicule', 'Plein'],
  Parametre: [],
  Correction: ['User'],
};

/**
 * Valide les dépendances entre entités
 * @param {string} type - Type de données
 * @param {Object} data - Ligne de données à valider
 * @param {Object} existingData - Données déjà existantes en base (par type)
 * @returns {Object} { valid: boolean, message?: string }
 */
const validateDependencies = (type, data, existingData) => {
  const deps = dependenciesByType[type] || [];

  for (const dep of deps) {
    const depField = `${dep.toLowerCase()}_id`;
    const depId = data[depField];

    if (!depId) continue;

    const depData = existingData[dep] || [];
    const exists = depData.some((item) => item.id === depId);

    if (!exists) {
      return {
        valid: false,
        message: `Dépendance manquante: ${dep} avec ID "${depId}" introuvable`,
      };
    }
  }

  return { valid: true };
};

/**
 * Insère les données dans l'ordre correct en respectant les dépendances
 * @param {Object} db - Instance de connexion à la base de données
 * @param {Object} data - Données parsées par type
 * @returns {Promise<Object>} Résultat de l'insertion { success: boolean, inserted: number, errors: Array }
 */
async function insertEntitiesInOrder(db, data) {
  // Ordre d'insertion respectant les dépendances
  const insertionOrder = [
    'Site',
    'Geofence',
    'User',
    'Vehicule',
    'Affectation',
    'Trip',
    'TraceGps',
    'Plein',
    'PleinExifMetadata',
    'NiveauCarburant',
    'Parametre',
    'Correction',
  ];

  const result = {
    success: true,
    inserted: 0,
    errors: [],
  };

  // Charger les données existantes pour la validation des dépendances
  const existingData = {};
  for (const type of insertionOrder) {
    try {
      // TODO: Adapter selon votre ORM (Sequelize, Prisma, raw SQL, etc.)
      // existingData[type] = await db.query(`SELECT * FROM ${type.toLowerCase()}s`);
      existingData[type] = []; // Placeholder
    } catch (error) {
      console.error(`Erreur lors du chargement de ${type}:`, error);
    }
  }

  // Insertion dans l'ordre
  for (const type of insertionOrder) {
    const rows = data[type] || [];

    for (const row of rows) {
      try {
        // Validation des champs requis
        const requiredValidation = validateRequiredFields(type, row);
        if (!requiredValidation.valid) {
          result.errors.push({ type, row, error: requiredValidation.message });
          continue;
        }

        // Validation des formats
        const formatValidation = validateFieldFormats(type, row);
        if (!formatValidation.valid) {
          result.errors.push({ type, row, error: formatValidation.message });
          continue;
        }

        // Validation des dépendances
        const depValidation = validateDependencies(type, row, existingData);
        if (!depValidation.valid) {
          result.errors.push({ type, row, error: depValidation.message });
          continue;
        }

        // TODO: Insertion en base
        // await db.query(`INSERT INTO ${type.toLowerCase()}s (columns...) VALUES (...)`, row);
        
        result.inserted++;
        
        // Ajouter aux données existantes pour les prochaines validations
        existingData[type] = existingData[type] || [];
        existingData[type].push(row);
      } catch (error) {
        result.errors.push({ type, row, error: error.message });
      }
    }
  }

  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
}

module.exports = {
  parseExcelFile,
  validateRequiredFields,
  validateFieldFormats,
  validateDependencies,
  insertEntitiesInOrder,
};
