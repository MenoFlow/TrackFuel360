// Données de base (entités principales)
import { User, Vehicule, Site, Affectation } from '@/types';

export const mockSites: Site[] = [
  { id: 's1', nom: 'Dépôt Central', ville: 'Kinshasa', pays: 'RDC' },
  { id: 's2', nom: 'Dépôt Nord', ville: 'Lubumbashi', pays: 'RDC' },
  { id: 's3', nom: 'Dépôt Sud', ville: 'Goma', pays: 'RDC' },
];

export const mockUsers: User[] = [
  { id: 'u1', email: 'admin@trackfuel.cd', matricule: 'ADM001', nom: 'Mukendi', prenom: 'Jean', role: 'admin' },
  { id: 'u2', email: 'manager@trackfuel.cd', matricule: 'MGR001', nom: 'Kabila', prenom: 'Marie', role: 'manager', site_id: 's1' },
  { id: 'u3', email: 'driver1@trackfuel.cdr', matricule: 'DRV001', nom: 'Tshisekedi', prenom: 'Paul', role: 'driver', site_id: 's1' },
  { id: 'u4', email: 'driver2@trackfuel.cd', matricule: 'DRV002', nom: 'Mulamba', prenom: 'Joseph', role: 'driver', site_id: 's1' },
  { id: 'u5', email: 'supervisor@trackfuel.cd', matricule: 'SUP001', nom: 'Ngoy', prenom: 'Sarah', role: 'supervisor', site_id: 's2' },
  { id: 'u6', email: 'audit@trackfuel.cd', matricule: 'AUD001', nom: 'Mbuyi', prenom: 'Patrick', role: 'auditor' },
];

export const mockVehicules: Vehicule[] = [
  { id: 'v1', immatriculation: 'CGO-123-AA', marque: 'Toyota', modele: 'Land Cruiser', type: 'SUV', capacite_reservoir: 90, consommation_nominale: 13, site_id: 's1', actif: true, carburant_initial: 50 },
  { id: 'v2', immatriculation: 'CGO-456-BB', marque: 'Mitsubishi', modele: 'Canter', type: 'Camion', capacite_reservoir: 120, consommation_nominale: 18, site_id: 's1', actif: true, carburant_initial: 80 },
  { id: 'v3', immatriculation: 'CGO-789-CC', marque: 'Isuzu', modele: 'D-Max', type: 'Pick-up', capacite_reservoir: 80, consommation_nominale: 10, site_id: 's2', actif: true, carburant_initial: 60 },
  { id: 'v4', immatriculation: 'CGO-321-DD', marque: 'Nissan', modele: 'Patrol', type: 'SUV', capacite_reservoir: 95, consommation_nominale: 14, site_id: 's1', actif: false, carburant_initial: 45 },
  { id: 'v5', immatriculation: 'CGO-654-EE', marque: 'Toyota', modele: 'Hilux', type: 'Pick-up', capacite_reservoir: 80, consommation_nominale: 11, site_id: 's3', actif: true, carburant_initial: 55 },
];

export const mockAffectations: Affectation[] = [
  { id: 'af1', vehicule_id: 'v1', chauffeur_id: 'u3', date_debut: '2025-10-07T06:00:00Z', date_fin: '2025-12-12T00:00:01Z' },
  { id: 'af2', vehicule_id: 'v2', chauffeur_id: 'u4', date_debut: '2025-09-21T05:00:00Z', date_fin: '2025-10-12T00:18:30Z' },
  { id: 'af3', vehicule_id: 'v1', chauffeur_id: 'u3', date_debut: '2025-09-20T06:00:00Z', date_fin: '2025-12-12T18:30:00Z' },
  { id: 'af4', vehicule_id: 'v1', chauffeur_id: 'u3', date_debut: '2025-09-22T07:00:00Z', date_fin: '2025-12-12T19:00:00Z' },
];