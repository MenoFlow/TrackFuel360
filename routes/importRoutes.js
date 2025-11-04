/**
 * Routes d'importation de données TrackFuel360
 * Endpoint POST /import pour recevoir et traiter les fichiers Excel
 */

const express = require('express');
const multer = require('multer');
const {
  parseExcelFile,
  insertEntitiesInOrder,
} = require('../services/importService');

const router = express.Router();

// Configuration de multer pour upload de fichiers en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les fichiers Excel
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier invalide. Seuls les fichiers Excel (.xlsx, .xls) sont acceptés.'));
    }
  },
});

/**
 * POST /import
 * Reçoit un fichier Excel, le parse, valide et insère les données en base
 */
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      });
    }

    // Parser le fichier Excel
    let parsedData;
    try {
      parsedData = parseExcelFile(req.file.buffer);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Erreur lors de la lecture du fichier: ${error.message}`,
      });
    }

    // Vérifier que le fichier contient des données
    const totalRows = Object.values(parsedData).reduce((sum, rows) => sum + rows.length, 0);
    if (totalRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est vide ou ne contient pas de données valides',
      });
    }

    // TODO: Récupérer l'instance de base de données
    // const db = req.app.get('db'); // Exemple avec Express
    const db = null; // Placeholder

    // Insérer les données dans l'ordre
    const result = await insertEntitiesInOrder(db, parsedData);

    // Réponse selon le résultat
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `${result.inserted} ligne(s) importée(s) avec succès`,
        inserted: result.inserted,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Import partiel: ${result.inserted} ligne(s) importée(s), ${result.errors.length} erreur(s)`,
        inserted: result.inserted,
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'import',
      error: error.message,
    });
  }
});

/**
 * GET /import/template
 * Retourne un fichier Excel template vierge pour l'import
 */
router.get('/import/template', (req, res) => {
  // TODO: Générer et retourner un fichier Excel template
  // const XLSX = require('xlsx');
  // const workbook = XLSX.utils.book_new();
  // ... créer les onglets avec les en-têtes
  // const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  // res.setHeader('Content-Disposition', 'attachment; filename=template_import.xlsx');
  // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  // res.send(buffer);
  
  res.status(501).json({
    message: 'Endpoint de téléchargement de template non implémenté',
  });
});

module.exports = router;
