const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { createTripSchema, updateTripSchema } = require('../validators/trajet.validator');

/**
 * GET /trips
 * Fetch all trips, optionally filtered by vehicule_id
 * Query params: ?vehicule_id=CGO-123-AA
 */
router.get('/', async (req, res) => {
  try {
    const { vehicule_id } = req.query;
    let sql = 'SELECT * FROM trips';
    const params = [];

    if (vehicule_id) {
      sql += ' WHERE vehicule_id = ?';
      params.push(vehicule_id);
    }

    sql += ' ORDER BY date_debut DESC';
    const [trips] = await db.execute(sql, params);

    // Pour chaque trip, on ajoute ses points GPS
    for (const trip of trips) {
      const [points] = await db.execute(
        'SELECT id, sequence, latitude, longitude, timestamp FROM traceGps WHERE trajet_id = ? ORDER BY sequence ASC',
        [trip.id]
      );
      trip.traceGps = points;
    }

    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      error: 'Failed to fetch trips',
      message: error.message
    });
  }
});

/**
 * GET /trips/:id
 * Fetch a single trip by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [trips] = await db.execute('SELECT * FROM trips WHERE id = ?', [id]);
    if (trips.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = trips[0];

    const [gpsPoints] = await db.execute(
      'SELECT id, sequence, latitude, longitude, timestamp FROM traceGps WHERE trajet_id = ? ORDER BY sequence ASC',
      [id]
    );
    trip.traceGps = gpsPoints;

    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      error: 'Failed to fetch trip',
      message: error.message
    });
  }
});

/**
 * POST /trips
 * Create a new trip
 * Body:
 * {
 *   vehicule_id, chauffeur_id, date_debut, date_fin,
 *   distance_km, type_saisie, traceGps: [{latitude, longitude, timestamp}]
 * }
 */
router.post('/', async (req, res) => {
  try {
    const {
      vehicule_id,
      chauffeur_id,
      date_debut,
      date_fin,
      distance_km,
      type_saisie = 'manuelle',
      traceGps = []
    } = await createTripSchema.validateAsync(req.body);

    // Vérification des champs requis
    if (!vehicule_id || !chauffeur_id || !date_debut || !date_fin) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['vehicule_id', 'chauffeur_id', 'date_debut', 'date_fin']
      });
    }

    // Vérifier que le véhicule existe
    const [vehiculeRows] = await db.execute('SELECT id FROM vehicules WHERE id = ?', [vehicule_id]);
    if (vehiculeRows.length === 0) {
      return res.status(400).json({
        error: 'Invalid vehicule_id',
        message: `Le véhicule avec l’id "${vehicule_id}" n’existe pas.`
      });
    }

    // Vérifier que le chauffeur existe
    const [chauffeurRows] = await db.execute('SELECT matricule FROM users WHERE matricule = ?', [chauffeur_id]);
    if (chauffeurRows.length === 0) {
      return res.status(400).json({
        error: 'Invalid chauffeur_id',
        message: `Le chauffeur avec le matricule "${chauffeur_id}" n’existe pas.`
      });
    }



    // Insertion du trajet (created_at = NOW())
    const sqlTrip = `
    INSERT INTO trips 
    (vehicule_id, chauffeur_id, date_debut, date_fin, distance_km, type_saisie, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.execute(sqlTrip, [
      vehicule_id,
      chauffeur_id,
      date_debut,
      date_fin,
      distance_km,
      type_saisie
    ]);
    const id = result.insertId;
  

    // Insertion des points GPS
    if (traceGps.length > 0) {
      const gpsSql = `
        INSERT INTO traceGps (trajet_id, sequence, latitude, longitude, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `;
      for (let i = 0; i < traceGps.length; i++) {
        const p = traceGps[i];
        await db.execute(gpsSql, [
          id,
          i + 1,
          p.latitude,
          p.longitude,
          p.timestamp
        ]);
      }
    }

    res.status(201).json({
      message: 'Trip created successfully',
      id,
      vehicule_id,
      chauffeur_id,
      date_debut,
      date_fin,
      distance_km,
      type_saisie
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({
      error: 'Failed to create trip',
      message: error.message
    });
  }
});

/**
 * PUT /trips/:id
 * Update an existing trip
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicule_id,
      chauffeur_id,
      date_debut,
      date_fin,
      distance_km,
      type_saisie,
      traceGps = []
    } = await updateTripSchema.validateAsync(req.body);

    const [existing] = await db.execute('SELECT id FROM trips WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const sql = `
      UPDATE trips 
      SET vehicule_id = ?, chauffeur_id = ?, date_debut = ?, date_fin = ?, 
          distance_km = ?, type_saisie = ?
      WHERE id = ?
    `;
    await db.execute(sql, [
      vehicule_id,
      chauffeur_id,
      date_debut,
      date_fin,
      distance_km,
      type_saisie,
      id
    ]);

    // Supprimer anciens points GPS et réinsérer si fournis
    await db.execute('DELETE FROM traceGps WHERE trajet_id = ?', [id]);
    if (traceGps.length > 0) {
      const gpsSql = `
        INSERT INTO traceGps (trajet_id, sequence, latitude, longitude, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `;
      for (let i = 0; i < traceGps.length; i++) {
        const p = traceGps[i];
        await db.execute(gpsSql, [
          
          id,
          i + 1,
          p.latitude,
          p.longitude,
          p.timestamp
        ]);
      }
    }

    res.json({ message: 'Trip updated successfully', id });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({
      error: 'Failed to update trip',
      message: error.message
    });
  }
});

/**
 * DELETE /trips/:id
 * Delete a trip by ID (and its GPS points)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.execute('SELECT id FROM trips WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await db.execute('DELETE FROM traceGps WHERE trajet_id = ?', [id]);
    await db.execute('DELETE FROM trips WHERE id = ?', [id]);

    res.json({ message: 'Trip and GPS points deleted successfully', id });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      error: 'Failed to delete trip',
      message: error.message
    });
  }
});

module.exports = router;
