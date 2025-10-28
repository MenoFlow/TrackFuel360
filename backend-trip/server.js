/**
 * Express backend server for Trip Management API
 * Handles CRUD operations for trips
 * 
 * Installation required:
 * npm install express cors mysql2 dotenv
 * 
 * Run: node server.js
 */

const express = require('express');
const cors = require('cors');
const { query, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * GET /api/trips
 * Fetch all trips, optionally filtered by vehicule_id
 * Query params: ?vehicule_id=V123
 */
app.get('/api/trips', async (req, res) => {
  try {
    const { vehicule_id } = req.query;
    
    let sql = 'SELECT * FROM trips';
    const params = [];
    
    if (vehicule_id) {
      sql += ' WHERE vehicule_id = ?';
      params.push(vehicule_id);
    }
    
    sql += ' ORDER BY t_start DESC';
    
    const trips = await query(sql, params);
    
    // Parse JSON fields
    const tripsWithParsedGPS = trips.map(trip => ({
      ...trip,
      trace_gps: typeof trip.trace_gps === 'string' 
        ? JSON.parse(trip.trace_gps) 
        : trip.trace_gps,
      // Convert datetime to ISO string
      t_start: trip.t_start.toISOString().slice(0, 19),
      t_end: trip.t_end.toISOString().slice(0, 19),
      created_at: trip.created_at.toISOString().slice(0, 19),
    }));
    
    res.json(tripsWithParsedGPS);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trips',
      message: error.message 
    });
  }
});

/**
 * GET /api/trips/:id
 * Fetch a single trip by ID
 */
app.get('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const trips = await query('SELECT * FROM trips WHERE id = ?', [id]);
    
    if (trips.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const trip = trips[0];
    trip.trace_gps = typeof trip.trace_gps === 'string' 
      ? JSON.parse(trip.trace_gps) 
      : trip.trace_gps;
    
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
 * POST /api/trips
 * Create a new trip
 * Body: { vehicule_id, t_start, t_end, distance_km, trace_gps, type_saisie, motif, author }
 */
app.post('/api/trips', async (req, res) => {
  try {
    const {
      vehicule_id,
      t_start,
      t_end,
      distance_km,
      trace_gps,
      type_saisie = 'Manuelle',
      motif,
      author
    } = req.body;
    
    // Validation
    if (!vehicule_id || !t_start || !t_end || !distance_km || !trace_gps || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['vehicule_id', 't_start', 't_end', 'distance_km', 'trace_gps', 'author']
      });
    }
    
    // Generate unique ID
    const id = `T-${Date.now()}`;
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Insert into database
    const sql = `
      INSERT INTO trips 
      (id, vehicule_id, t_start, t_end, distance_km, trace_gps, type_saisie, motif, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(sql, [
      id,
      vehicule_id,
      t_start,
      t_end,
      distance_km,
      JSON.stringify(trace_gps),
      type_saisie,
      motif,
      author,
      created_at
    ]);
    
    // Return created trip
    const newTrip = {
      id,
      vehicule_id,
      t_start,
      t_end,
      distance_km,
      trace_gps,
      type_saisie,
      motif,
      author,
      created_at
    };
    
    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ 
      error: 'Failed to create trip',
      message: error.message 
    });
  }
});

/**
 * PUT /api/trips/:id
 * Update an existing trip
 * Body: { vehicule_id, t_start, t_end, distance_km, trace_gps, type_saisie, motif, author }
 */
app.put('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicule_id,
      t_start,
      t_end,
      distance_km,
      trace_gps,
      type_saisie,
      motif,
      author
    } = req.body;
    
    // Check if trip exists
    const existing = await query('SELECT id FROM trips WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Update trip
    const sql = `
      UPDATE trips 
      SET vehicule_id = ?, t_start = ?, t_end = ?, distance_km = ?, 
          trace_gps = ?, type_saisie = ?, motif = ?, author = ?
      WHERE id = ?
    `;
    
    await query(sql, [
      vehicule_id,
      t_start,
      t_end,
      distance_km,
      JSON.stringify(trace_gps),
      type_saisie,
      motif,
      author,
      id
    ]);
    
    // Return updated trip
    const updatedTrip = {
      id,
      vehicule_id,
      t_start,
      t_end,
      distance_km,
      trace_gps,
      type_saisie,
      motif,
      author
    };
    
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ 
      error: 'Failed to update trip',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/trips/:id
 * Delete a trip by ID
 */
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if trip exists
    const existing = await query('SELECT id FROM trips WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Delete trip
    await query('DELETE FROM trips WHERE id = ?', [id]);
    
    res.json({ message: 'Trip deleted successfully', id });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ 
      error: 'Failed to delete trip',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️  Server running but database connection failed');
    console.warn('   Check your database configuration in backend/db.js');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});
