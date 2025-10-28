# TrackFuel360 - Backend API

## 📋 Structure de l'API

Ce dossier contient la structure backend préparée pour TrackFuel360. Les fichiers de routes sont prêts à être intégrés dans un serveur Express.

### Routes disponibles

| Ressource | Base URL | Fichier |
|-----------|----------|---------|
| Véhicules | `/api/vehicules` | `routes/vehicules.routes.js` |
| Pleins | `/api/pleins` | `routes/pleins.routes.js` |
| Alertes | `/api/alertes` | `routes/alertes.routes.js` |
| Corrections | `/api/corrections` | `routes/corrections.routes.js` |
| Utilisateurs | `/api/users` | `routes/users.routes.js` |
| Sites | `/api/sites` | `routes/sites.routes.js` |
| Geofences | `/api/geofences` | `routes/geofences.routes.js` |
| Trajets | `/api/trajets` | `routes/trajets.routes.js` |

## 🚀 Démarrage rapide

### Prérequis
```bash
npm install express cors helmet morgan
```

### Lancer le serveur
```bash
node src/server/index.js
```

Le serveur démarre sur `http://localhost:3001`

## 📡 Endpoints par ressource

### Véhicules (`/api/vehicules`)
- `GET /` - Liste tous les véhicules
- `GET /:id` - Récupère un véhicule
- `POST /` - Crée un véhicule
- `PUT /:id` - Met à jour un véhicule
- `DELETE /:id` - Supprime un véhicule

### Pleins (`/api/pleins`)
- `GET /` - Liste tous les pleins
- `GET /:id` - Récupère un plein
- `POST /` - Crée un plein
- `PUT /:id` - Met à jour un plein
- `DELETE /:id` - Supprime un plein

### Alertes (`/api/alertes`)
- `GET /` - Liste toutes les alertes
- `GET /:id` - Récupère une alerte
- `POST /` - Crée une alerte
- `PATCH /:id/status` - Met à jour le statut
- `DELETE /:id` - Supprime une alerte

### Corrections (`/api/corrections`)
- `GET /` - Liste toutes les corrections
- `GET /:id` - Récupère une correction
- `POST /` - Crée une demande de correction
- `PATCH /:id/validate` - Valide une correction
- `PATCH /:id/reject` - Rejette une correction
- `DELETE /:id` - Supprime une correction

### Utilisateurs (`/api/users`)
- `GET /` - Liste tous les utilisateurs
- `GET /:id` - Récupère un utilisateur
- `POST /` - Crée un utilisateur
- `PUT /:id` - Met à jour un utilisateur
- `DELETE /:id` - Supprime un utilisateur
- `POST /login` - Authentification
- `POST /logout` - Déconnexion

### Sites (`/api/sites`)
- `GET /` - Liste tous les sites
- `GET /:id` - Récupère un site
- `POST /` - Crée un site
- `PUT /:id` - Met à jour un site
- `DELETE /:id` - Supprime un site

### Geofences (`/api/geofences`)
- `GET /` - Liste toutes les geofences
- `GET /:id` - Récupère une geofence
- `POST /` - Crée une geofence
- `PUT /:id` - Met à jour une geofence
- `DELETE /:id` - Supprime une geofence
- `POST /check` - Vérifie si un point est dans une geofence

### Trajets (`/api/trajets`)
- `GET /` - Liste tous les trajets
- `GET /:id` - Récupère un trajet avec points GPS
- `POST /` - Crée un trajet
- `PUT /:id` - Met à jour un trajet
- `DELETE /:id` - Supprime un trajet

## 🔒 Sécurité

- Helmet.js pour les headers de sécurité
- CORS configuré
- Validation des données à implémenter
- Authentification JWT à implémenter
- RLS (Row Level Security) à configurer en base de données

## 📝 Prochaines étapes

1. **Connexion à la base de données**
   - Configurer PostgreSQL/Supabase
   - Créer les modèles Sequelize ou Prisma

2. **Authentification**
   - Implémenter JWT
   - Middleware d'authentification
   - Gestion des permissions par rôle

3. **Validation**
   - Ajouter Joi ou Zod pour validation des requêtes
   - Middleware de validation

4. **Tests**
   - Tests unitaires (Jest)
   - Tests d'intégration (Supertest)

5. **Documentation**
   - Générer documentation Swagger/OpenAPI

## 🔄 Migration frontend → backend

Les hooks React Query dans `src/hooks/` sont déjà préparés avec des commentaires indiquant les appels API à effectuer. Pour activer les vrais appels :

1. Décommenter les appels `fetch()` dans chaque hook
2. Supprimer les `mockData` une fois les endpoints fonctionnels
3. Gérer les erreurs et le loading correctement

## 📦 Variables d'environnement

Créer un fichier `.env` :
```env
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=votre_secret_jwt
NODE_ENV=development
```

## 🛠️ Technologies recommandées

- **Express** - Framework web
- **PostgreSQL** - Base de données
- **Sequelize/Prisma** - ORM
- **JWT** - Authentification
- **Bcrypt** - Hash des mots de passe
- **Joi/Zod** - Validation
- **Jest** - Tests
- **Winston** - Logging avancé

## 📞 Support

Pour toute question sur l'architecture API, consulter les commentaires dans chaque fichier de route.
