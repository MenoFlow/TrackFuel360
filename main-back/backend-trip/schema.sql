-- Database schema for Trip Management System
-- MySQL/MariaDB compatible

-- Create database (optional, adjust as needed)
-- CREATE DATABASE IF NOT EXISTS trip_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE trip_management;

-- Trips table
-- Stores all trip information including GPS traces
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(50) PRIMARY KEY,
  vehicule_id VARCHAR(50) NOT NULL,
  chauffeur_id VARCHAR(50) NOT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  distance_km FLOAT NOT NULL,
  odometre_debut INT NULL,
  odometre_fin INT NULL,
  type_saisie VARCHAR(50) NOT NULL DEFAULT 'manuelle',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_vehicule_id (vehicule_id),
  INDEX idx_chauffeur_id (chauffeur_id),
  INDEX idx_date_debut (date_debut),
  INDEX idx_date_fin (date_fin), 
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO trips (id, vehicule_id, chauffeur_id, date_debut, date_fin, distance_km, odometre_debut, odometre_fin, type_saisie, created_at) VALUES
('t1', '2', 'u3', '2025-10-07 08:00:00', '2025-10-07 12:15:00', 118.1, 120332, 120450, 'auto', '2025-10-07 12:20:00'),
('t2', '3', 'u2', '2025-10-06 13:00:00', '2025-10-06 15:30:00', 45.3, 120250, 120295, 'manuelle', '2025-10-06 15:35:00');

-- Insert GPS points
INSERT INTO gps_points (id, trajet_id, sequence, latitude, longitude, timestamp) VALUES
('gps1', 't1', 1, -15.716, 46.317, '2025-10-07 08:00:00'),
('gps2', 't1', 2, -15.800, 46.500, '2025-10-07 08:30:00'),
('gps3', 't1', 3, -15.900, 46.650, '2025-10-07 09:00:00'),
('gps4', 't2', 1, -16.200, 46.800, '2025-10-06 13:00:00'),
('gps5', 't2', 2, -16.300, 46.900, '2025-10-06 14:00:00');
