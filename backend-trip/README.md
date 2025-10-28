# Backend API - Trip Management

Backend Node.js + Express + MySQL pour la gestion des trajets.

## Installation

```bash
cd backend
npm install express cors mysql2 dotenv
```

## Configuration

1. Créer la base de données MySQL :
```bash
mysql -u root -p < schema.sql
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos informations de connexion
```

## Démarrage

```bash
node server.js
```

Le serveur démarre sur `http://localhost:3001`

## Endpoints API

### GET /api/trips
Récupère tous les trajets, avec filtre optionnel par véhicule.
```
GET /api/trips?vehicule_id=V123
```

### GET /api/trips/:id
Récupère un trajet spécifique.

### POST /api/trips
Crée un nouveau trajet.
```json
{
  "vehicule_id": "V123",
  "t_start": "2025-10-17T08:00:00",
  "t_end": "2025-10-17T09:00:00",
  "distance_km": 25.4,
  "trace_gps": [
    { "lat": -18.8792, "lon": 47.5079 },
    { "lat": -18.9400, "lon": 47.5200 }
  ],
  "type_saisie": "Manuelle",
  "motif": "Livraison",
  "author": "admin"
}
```

### PUT /api/trips/:id
Met à jour un trajet existant.

### DELETE /api/trips/:id
Supprime un trajet.

## Structure de la base de données

Voir `schema.sql` pour le schéma complet de la base de données.

Table principale : `trips`
- id (VARCHAR) - Identifiant unique
- vehicule_id (VARCHAR) - ID du véhicule
- t_start (DATETIME) - Heure de départ
- t_end (DATETIME) - Heure d'arrivée
- distance_km (FLOAT) - Distance en km
- trace_gps (JSON) - Trace GPS
- type_saisie (VARCHAR) - Type de saisie
- motif (VARCHAR) - Motif du trajet
- author (VARCHAR) - Auteur
- created_at (DATETIME) - Date de création
