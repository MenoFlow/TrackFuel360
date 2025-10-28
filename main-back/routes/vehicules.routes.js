/**
 * Routes API pour la gestion des véhicules
 * Base URL: /api/vehicules
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { createVehiculeSchema, updateVehiculeSchema } = require('../validators/vehicule.validator');

/**
 * GET /api/vehicules
 * Description: Récupère la liste de tous les véhicules
 * Query params:
 *   - site_id (optional): Filtrer par site
 *   - statut (optional): Filtrer par statut
 * Response: Array<Vehicule>
 */
router.get('/', async (req, res, next) => {
  try {    
    let query = `
      SELECT v.*
      FROM vehicules v
      ORDER BY v.immatriculation
    `;
    
    const [vehicules] = await db.execute(query);
    res.json(vehicules);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vehicules/:immatriculation
 * Description: Récupère un véhicule spécifique par son ID
 * Params: immatriculation (string)
 * Response: Vehicule
 */
router.get('/:immatriculation', async (req, res, next) => {
  try {
    const { immatriculation } = req.params;
    
    const [vehicules] = await db.execute(`
      SELECT v.*
      WHERE v.immatriculation = ?
    `, [immatriculation]);
    
    if (vehicules.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    
    res.json(vehicules[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/vehicules
 * Description: Crée un nouveau véhicule
 * Body: {
 *   immatriculation: string,
 *   marque: string,
 *   modele: string,
 *   type: string,
 *   capacite_reservoir: number,
 *   consommation_nominale: number,
 *   site_id?: string,
 *   actif: boolean,
 *   carburant_initial?: number
 * }
 * Response: Vehicule
 */
router.post('/', async (req, res, next) => {
  try {
    const vehiculeData = await createVehiculeSchema.validateAsync(req.body);
    
    const [existing] = await db.execute(
      'SELECT immatriculation FROM vehicules WHERE immatriculation = ?',
      [vehiculeData.immatriculation]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Cette immatriculation existe déjà' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO vehicules (
        immatriculation, marque, modele, type,
        capacite_reservoir, consommation_nominale, carburant_initial,
        site_id, actif
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      vehiculeData.immatriculation,
      vehiculeData.marque,
      vehiculeData.modele,
      vehiculeData.type,
      vehiculeData.capacite_reservoir,
      vehiculeData.consommation_nominale,
      vehiculeData.carburant_initial,
      vehiculeData.site_id || null,
      vehiculeData.actif || 'actif'
    ]);
    const [newVehicule] = await db.execute(
      'SELECT * FROM vehicules WHERE immatriculation = ?',
      [vehiculeData.immatriculation]
    );
    
    res.status(201).json(newVehicule[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/vehicules/:immatriculation
 * Description: Met à jour un véhicule existant
 * Params: immatriculation (string)
 * Body: Partial<Vehicule>
 * Response: Vehicule
 */
router.put('/:immatriculation', async (req, res, next) => {
  try {
    const { immatriculation } = req.params;
    const updateData = await updateVehiculeSchema.validateAsync(req.body);
    
    const [existing] = await db.execute('SELECT immatriculation FROM vehicules WHERE immatriculation = ?', [immatriculation]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    
    if (updateData.immatriculation) {
      const [duplicate] = await db.execute(
        'SELECT immatriculation FROM vehicules WHERE immatriculation = ? AND immatriculation != ?',
        [updateData.immatriculation, immatriculation]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({ error: 'Cette immatriculation existe déjà' });
      }
    }
    
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    await db.execute(
      `UPDATE vehicules SET ${setClause} WHERE immatriculation = ?`,
      [...values, immatriculation]
    );
    
    const [updated] = await db.execute('SELECT * FROM vehicules WHERE immatriculation = ?', [immatriculation]);
    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/vehicules/:immatriculation
 * Description: Supprime un véhicule
 * Params: immatriculation (string)
 * Response: { success: boolean }
 */
router.delete('/:immatriculation', async (req, res, next) => {
  try {
    const { immatriculation } = req.params;

    const [existing] = await db.execute('SELECT immatriculation FROM vehicules WHERE immatriculation = ?', [immatriculation]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    await db.execute('DELETE FROM vehicules WHERE immatriculation = ?', [immatriculation]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
