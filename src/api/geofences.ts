import { Geofence, GeofenceType } from '@/types';
import { mockGeofences } from '@/lib/mockData';

/**
 * ============================================
 * API GEOFENCES - FONCTIONS MOCKÉES
 * ============================================
 * 
 * Ce fichier contient toutes les fonctions d'API pour la gestion des geofences.
 * Actuellement mockées avec localStorage, prêtes pour l'intégration backend.
 * 
 * BACKEND ATTENDU:
 * - Base de données: MySQL
 * - Schéma table `geofences`:
 *   CREATE TABLE geofences (
 *     id VARCHAR(36) PRIMARY KEY,
 *     nom VARCHAR(255) NOT NULL,
 *     type ENUM('depot', 'station', 'zone_risque') NOT NULL,
 *     lat DECIMAL(10, 8) NOT NULL,
 *     lon DECIMAL(11, 8) NOT NULL,
 *     rayon_metres INT NOT NULL,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 *   );
 */

const STORAGE_KEY = 'geofences_data';

/**
 * Récupère toutes les geofences depuis le localStorage (mock)
 * 
 * BACKEND RÉEL:
 * - Method: GET
 * - URL: /api/geofences
 * - Response: { data: Geofence[], total: number }
 * - SQL: SELECT * FROM geofences ORDER BY created_at DESC
 */
export async function fetchGeofences(): Promise<Geofence[]> {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialiser avec les données mockées si aucune donnée n'existe
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGeofences));
    return mockGeofences;
  } catch (error) {
    console.error('Erreur lors du chargement des geofences:', error);
    return mockGeofences;
  }
}

/**
 * Crée une nouvelle geofence
 * 
 * BACKEND RÉEL:
 * - Method: POST
 * - URL: /api/geofences
 * - Body: { nom: string, type: GeofenceType, lat: number, lon: number, rayon_metres: number }
 * - Response: { data: Geofence, message: string }
 * - SQL: INSERT INTO geofences (id, nom, type, lat, lon, rayon_metres) VALUES (?, ?, ?, ?, ?, ?)
 */
export async function createGeofence(geofence: Omit<Geofence, 'id'>): Promise<Geofence> {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newGeofence: Geofence = {
    ...geofence,
    id: Date.now(),
  };
  
  const geofences = await fetchGeofences();
  const updated = [...geofences, newGeofence];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  return newGeofence;
}

/**
 * Met à jour une geofence existante
 * 
 * BACKEND RÉEL:
 * - Method: PUT
 * - URL: /api/geofences/:id
 * - Params: { id: string }
 * - Body: Partial<{ nom: string, type: GeofenceType, lat: number, lon: number, rayon_metres: number }>
 * - Response: { data: Geofence, message: string }
 * - SQL: UPDATE geofences SET nom = ?, type = ?, lat = ?, lon = ?, rayon_metres = ? WHERE id = ?
 */
export async function updateGeofence(id: number, updates: Partial<Geofence>): Promise<Geofence> {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const geofences = await fetchGeofences();
  const index = geofences.findIndex(g => g.id === id);
  
  if (index === -1) {
    throw new Error(`Geofence avec l'id ${id} introuvable`);
  }
  
  const updatedGeofence = { ...geofences[index], ...updates };
  geofences[index] = updatedGeofence;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(geofences));
  
  return updatedGeofence;
}

/**
 * Supprime une geofence
 * 
 * BACKEND RÉEL:
 * - Method: DELETE
 * - URL: /api/geofences/:id
 * - Params: { id: string }
 * - Response: { success: boolean, message: string }
 * - SQL: DELETE FROM geofences WHERE id = ?
 */
export async function deleteGeofence(id: number): Promise<void> {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const geofences = await fetchGeofences();
  const filtered = geofences.filter(g => g.id !== id);
  
  if (filtered.length === geofences.length) {
    throw new Error(`Geofence avec l'id ${id} introuvable`);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * EXEMPLES DE REQUÊTES BACKEND (Node.js + Express + MySQL)
 * 
 * // routes/geofences.routes.js
 * const express = require('express');
 * const router = express.Router();
 * const { pool } = require('../config/database');
 * 
 * // GET /api/geofences
 * router.get('/', async (req, res) => {
 *   try {
 *     const [rows] = await pool.query('SELECT * FROM geofences ORDER BY created_at DESC');
 *     res.json({ data: rows, total: rows.length });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * // POST /api/geofences
 * router.post('/', async (req, res) => {
 *   const { nom, type, lat, lon, rayon_metres } = req.body;
 *   try {
 *     const id = `geo-${Date.now()}`;
 *     await pool.query(
 *       'INSERT INTO geofences (id, nom, type, lat, lon, rayon_metres) VALUES (?, ?, ?, ?, ?, ?)',
 *       [id, nom, type, lat, lon, rayon_metres]
 *     );
 *     const [rows] = await pool.query('SELECT * FROM geofences WHERE id = ?', [id]);
 *     res.status(201).json({ data: rows[0], message: 'Geofence créée avec succès' });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * // PUT /api/geofences/:id
 * router.put('/:id', async (req, res) => {
 *   const { id } = req.params;
 *   const updates = req.body;
 *   try {
 *     const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
 *     const values = [...Object.values(updates), id];
 *     await pool.query(`UPDATE geofences SET ${fields} WHERE id = ?`, values);
 *     const [rows] = await pool.query('SELECT * FROM geofences WHERE id = ?', [id]);
 *     res.json({ data: rows[0], message: 'Geofence mise à jour avec succès' });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * // DELETE /api/geofences/:id
 * router.delete('/:id', async (req, res) => {
 *   const { id } = req.params;
 *   try {
 *     await pool.query('DELETE FROM geofences WHERE id = ?', [id]);
 *     res.json({ success: true, message: 'Geofence supprimée avec succès' });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * module.exports = router;
 */
