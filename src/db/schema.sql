-- Schéma de base de données MySQL pour TrackFuel360
-- Version: 1.0
-- Date: 2025-10-08

-- ============================================
-- TABLES DE RÉFÉRENCE
-- ============================================

-- Table Sites
CREATE TABLE sites (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    ville VARCHAR(255) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'supervisor', 'driver', 'auditor') NOT NULL,
    site_id VARCHAR(36),
    password_hash VARCHAR(255) NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    INDEX idx_role (role),
    INDEX idx_site (site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Véhicules
CREATE TABLE vehicules (
    id VARCHAR(36) PRIMARY KEY,
    immatriculation VARCHAR(50) UNIQUE NOT NULL,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacite_reservoir DECIMAL(8,2) NOT NULL,
    consommation_nominale DECIMAL(8,2) NOT NULL COMMENT 'L/100km',
    site_id VARCHAR(36),
    actif BOOLEAN DEFAULT TRUE,
    carburant_initial DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    INDEX idx_immatriculation (immatriculation),
    INDEX idx_actif (actif),
    INDEX idx_site (site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES OPÉRATIONNELLES
-- ============================================

-- Table Affectations
CREATE TABLE affectations (
    id VARCHAR(36) PRIMARY KEY,
    vehicule_id VARCHAR(36) NOT NULL,
    chauffeur_id VARCHAR(36) NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (chauffeur_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_chauffeur (chauffeur_id),
    INDEX idx_date_debut (date_debut),
    INDEX idx_date_fin (date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Trajets
CREATE TABLE trajets (
    id VARCHAR(36) PRIMARY KEY,
    vehicule_id VARCHAR(36) NOT NULL,
    chauffeur_id VARCHAR(36) NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    distance_km DECIMAL(10,2) NOT NULL,
    odometre_debut DECIMAL(12,2),
    odometre_fin DECIMAL(12,2),
    type_saisie ENUM('auto', 'manuelle') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (chauffeur_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_chauffeur (chauffeur_id),
    INDEX idx_date_debut (date_debut),
    INDEX idx_date_fin (date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Trace GPS Points (normalized)
CREATE TABLE trace_gps_points (
    id VARCHAR(36) PRIMARY KEY,
    trajet_id VARCHAR(36) NOT NULL,
    sequence INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trajet_id) REFERENCES trajets(id) ON DELETE CASCADE,
    INDEX idx_trajet (trajet_id),
    INDEX idx_sequence (trajet_id, sequence),
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Pleins
CREATE TABLE pleins (
    id VARCHAR(36) PRIMARY KEY,
    vehicule_id VARCHAR(36) NOT NULL,
    chauffeur_id VARCHAR(36) NOT NULL,
    date DATETIME NOT NULL,
    litres DECIMAL(10,2) NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    odometre DECIMAL(12,2) NOT NULL,
    station VARCHAR(255),
    photo_bon VARCHAR(500),
    ocr_data TEXT,
    hash_bon VARCHAR(255),
    type_saisie ENUM('auto', 'manuelle') NOT NULL,
    geofence_id VARCHAR(36),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (chauffeur_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_chauffeur (chauffeur_id),
    INDEX idx_date (date),
    INDEX idx_hash_bon (hash_bon),
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table EXIF Metadata (normalized)
CREATE TABLE plein_exif_metadata (
    id VARCHAR(36) PRIMARY KEY,
    plein_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    modele_telephone VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plein_id) REFERENCES pleins(id) ON DELETE CASCADE,
    INDEX idx_plein (plein_id),
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Niveau Carburant
CREATE TABLE niveaux_carburant (
    id VARCHAR(36) PRIMARY KEY,
    vehicule_id VARCHAR(36) NOT NULL,
    timestamp DATETIME NOT NULL,
    niveau DECIMAL(10,2) NOT NULL COMMENT 'Litres',
    type ENUM('avant_trajet', 'apres_trajet', 'apres_plein') NOT NULL,
    trajet_id VARCHAR(36),
    plein_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (trajet_id) REFERENCES trajets(id) ON DELETE SET NULL,
    FOREIGN KEY (plein_id) REFERENCES pleins(id) ON DELETE SET NULL,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_type (type),
    INDEX idx_trajet (trajet_id),
    INDEX idx_plein (plein_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GEOFENCING
-- ============================================

-- Table Geofences
CREATE TABLE geofences (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type ENUM('depot', 'station', 'zone_risque') NOT NULL,
    lat DECIMAL(10,8) NOT NULL COMMENT 'Latitude du centre',
    lon DECIMAL(11,8) NOT NULL COMMENT 'Longitude du centre',
    rayon_metres INT NOT NULL,
    site_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    INDEX idx_type (type),
    INDEX idx_site (site_id),
    INDEX idx_coordinates (lat, lon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Geofence Points (pour polygones complexes)
CREATE TABLE geofence_points (
    id VARCHAR(36) PRIMARY KEY,
    geofence_id VARCHAR(36) NOT NULL,
    sequence INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (geofence_id) REFERENCES geofences(id) ON DELETE CASCADE,
    INDEX idx_geofence (geofence_id),
    INDEX idx_sequence (geofence_id, sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ALERTES ET ANOMALIES
-- ============================================

-- Table Alertes
CREATE TABLE alertes (
    id VARCHAR(36) PRIMARY KEY,
    vehicule_id VARCHAR(36) NOT NULL,
    chauffeur_id VARCHAR(36),
    type ENUM(
        'consommation_elevee', 
        'plein_hors_zone', 
        'doublon_bon', 
        'distance_gps_ecart',
        'immobilisation_anormale',
        'carburant_disparu',
        'plein_suspect'
    ) NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    score INT NOT NULL COMMENT '0-100',
    severity ENUM('low', 'medium', 'high') NOT NULL,
    status ENUM('new', 'in_progress', 'resolved', 'dismissed') NOT NULL DEFAULT 'new',
    date_detection DATETIME NOT NULL,
    justification TEXT,
    resolved_by VARCHAR(36),
    resolved_at DATETIME,
    deviation_percent DECIMAL(10,2),
    litres_manquants DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (chauffeur_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vehicule (vehicule_id),
    INDEX idx_chauffeur (chauffeur_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_date_detection (date_detection),
    INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Alerte Metadata (normalized)
CREATE TABLE alerte_metadata (
    id VARCHAR(36) PRIMARY KEY,
    alerte_id VARCHAR(36) NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    value_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alerte_id) REFERENCES alertes(id) ON DELETE CASCADE,
    INDEX idx_alerte (alerte_id),
    INDEX idx_key (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CORRECTIONS ET AUDIT
-- ============================================

-- Table Corrections
CREATE TABLE corrections (
    id VARCHAR(36) PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(36) NOT NULL,
    champ VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    status ENUM('pending', 'validated', 'rejected') NOT NULL DEFAULT 'pending',
    comment TEXT,
    requested_by VARCHAR(36) NOT NULL,
    requested_at DATETIME NOT NULL,
    validated_by VARCHAR(36),
    validated_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_requested_by (requested_by),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PARAMÈTRES SYSTÈME
-- ============================================

-- Table Paramètres Détection
CREATE TABLE parametres_detection (
    id VARCHAR(36) PRIMARY KEY,
    seuil_surconsommation_pct INT NOT NULL DEFAULT 30 COMMENT 'Pourcentage au-dessus de la nominale',
    seuil_ecart_gps_pct INT NOT NULL DEFAULT 20 COMMENT 'Pourcentage écart GPS vs odomètre',
    seuil_carburant_disparu_litres DECIMAL(10,2) NOT NULL DEFAULT 5.00 COMMENT 'Litres manquants minimum',
    seuil_exif_heures INT NOT NULL DEFAULT 2 COMMENT 'Heures écart EXIF max',
    seuil_exif_distance_km DECIMAL(10,2) NOT NULL DEFAULT 1.00 COMMENT 'Distance EXIF max en km',
    seuil_immobilisation_heures INT NOT NULL DEFAULT 12 COMMENT 'Heures immobilisation hors dépôt',
    periode_consommation_jours INT NOT NULL DEFAULT 7 COMMENT 'Période pour calcul consommation moyenne',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les paramètres par défaut
INSERT INTO parametres_detection (id, seuil_surconsommation_pct, seuil_ecart_gps_pct, seuil_carburant_disparu_litres, 
    seuil_exif_heures, seuil_exif_distance_km, seuil_immobilisation_heures, periode_consommation_jours)
VALUES ('default', 30, 20, 5.00, 2, 1.00, 12, 7);

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue statistiques consommation par véhicule
CREATE VIEW v_stats_consommation AS
SELECT 
    v.id AS vehicule_id,
    v.immatriculation,
    COUNT(DISTINCT p.id) AS nb_pleins,
    SUM(p.litres) AS total_litres,
    SUM(t.distance_km) AS total_distance_km,
    CASE 
        WHEN SUM(t.distance_km) > 0 
        THEN (SUM(p.litres) / SUM(t.distance_km)) * 100 
        ELSE 0 
    END AS consommation_moyenne,
    v.consommation_nominale,
    SUM(p.litres * p.prix_unitaire) AS cout_total
FROM vehicules v
LEFT JOIN pleins p ON v.id = p.vehicule_id
LEFT JOIN trajets t ON v.id = t.vehicule_id
WHERE v.actif = TRUE
GROUP BY v.id, v.immatriculation, v.consommation_nominale;

-- Vue alertes actives avec détails
CREATE VIEW v_alertes_actives AS
SELECT 
    a.*,
    v.immatriculation,
    v.marque,
    v.modele,
    u.nom AS chauffeur_nom,
    u.prenom AS chauffeur_prenom
FROM alertes a
JOIN vehicules v ON a.vehicule_id = v.id
LEFT JOIN users u ON a.chauffeur_id = u.id
WHERE a.status IN ('new', 'in_progress')
ORDER BY a.score DESC, a.date_detection DESC;

-- Vue trajets avec infos complètes
CREATE VIEW v_trajets_details AS
SELECT 
    t.*,
    v.immatriculation,
    v.marque,
    v.modele,
    u.nom AS chauffeur_nom,
    u.prenom AS chauffeur_prenom,
    COUNT(gps.id) AS nb_points_gps
FROM trajets t
JOIN vehicules v ON t.vehicule_id = v.id
JOIN users u ON t.chauffeur_id = u.id
LEFT JOIN trace_gps_points gps ON t.id = gps.trajet_id
GROUP BY t.id, v.immatriculation, v.marque, v.modele, u.nom, u.prenom;


-- Je veux que tu modifies ou ajoutes toutes les donnees de l'application react comme suis, sans exception, que ca soit dans la partie logique ou dans l'interface. Attention je ne veux pas de backend au cas où l'on s'est mal compris.
