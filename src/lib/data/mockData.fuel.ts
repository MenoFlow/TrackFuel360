// Données de carburant (pleins et niveaux)
import { Plein, NiveauCarburant, PleinExifMetadata } from '@/types';

export const mockPleins: Plein[] = [
  { 
    id: 'p1', 
    vehicule_id: 'v1', 
    chauffeur_id: 'u3', 
    date: '2025-10-07T10:30:00Z', 
    litres: 45, 
    prix_unitaire: 1.35, 
    odometre: 120450, 
    station: 'Station Total Gombe', 
    type_saisie: 'manuelle',
    photo_bon: 'receipt_p1.jpg',
    latitude: -4.3276,
    longitude: 15.3136
  },
  { 
    id: 'p2', 
    vehicule_id: 'v1', 
    chauffeur_id: 'u3', 
    date: '2025-09-22T14:15:00Z', 
    litres: 68, 
    prix_unitaire: 2.5, 
    odometre: 120332, 
    station: 'Shell Limete', 
    type_saisie: 'auto',
    photo_bon: 'receipt_p2.jpg',
    latitude: -4.3797,
    longitude: 15.2993
  },
  { 
    id: 'p3', 
    vehicule_id: 'v2', 
    chauffeur_id: 'u4', 
    date: '2025-09-21T10:00:00Z', 
    litres: 105, 
    prix_unitaire: 2.4, 
    odometre: 78450, 
    station: 'Engen Matadi', 
    type_saisie: 'manuelle',
    photo_bon: 'receipt_p3.jpg',
    latitude: -5.8167,
    longitude: 13.4500
  },
  { 
    id: 'p4', 
    vehicule_id: 'v3', 
    chauffeur_id: 'u4', 
    date: '2025-09-19T16:45:00Z', 
    litres: 72, 
    prix_unitaire: 2.6, 
    odometre: 23100, 
    station: 'Total Lubumbashi', 
    type_saisie: 'auto',
    latitude: -11.6792,
    longitude: 27.4794
  },
];

export const mockPleinExifMetadata: PleinExifMetadata[] = [
  {
    id: 'exif1',
    plein_id: 'p1',
    date: '2025-10-07',
    heure: '10:30:00',
    latitude: -4.3276,
    longitude: 15.3136,
    modele_telephone: 'Samsung Galaxy S21'
  },
  {
    id: 'exif2',
    plein_id: 'p2',
    date: '2025-09-22',
    heure: '14:15:00',
    latitude: -4.3797,
    longitude: 15.2993,
    modele_telephone: 'iPhone 13'
  },
  {
    id: 'exif3',
    plein_id: 'p3',
    date: '2025-09-21',
    heure: '10:00:00',
    latitude: -5.8167,
    longitude: 13.4500,
    modele_telephone: 'Samsung Galaxy A52'
  },
  {
    id: 'exif4',
    plein_id: 'p4',
    date: '2025-09-19',
    heure: '16:45:00',
    latitude: -11.6792,
    longitude: 27.4794,
    modele_telephone: 'Xiaomi Redmi Note 10'
  }
];

// Niveaux de carburant corrigés pour être cohérents avec les capacités des réservoirs
export const mockNiveauxCarburant: NiveauCarburant[] = [
  // Scénario de vol détecté pour v1 le 07/10/2025
  { id: 'nc1', vehicule_id: 'v1', timestamp: '2025-10-07T08:00:00Z', niveau: 50, type: 'avant_trajet', trajet_id: 't1' },
  { id: 'nc2', vehicule_id: 'v1', timestamp: '2025-10-07T10:30:00Z', niveau: 41.2, type: 'avant_plein', plein_id: 'p1' },
  { id: 'nc3', vehicule_id: 'v1', timestamp: '2025-10-07T10:31:00Z', niveau: 86.2, type: 'apres_plein', plein_id: 'p1' }, // 41.2 + 45 = 86.2L < 90L capacité
  { id: 'nc4', vehicule_id: 'v1', timestamp: '2025-10-07T12:15:00Z', niveau: 38.5, type: 'apres_trajet', trajet_id: 't1' },
  
  // Trajets normaux v2 (capacité 120L)
  { id: 'nc5', vehicule_id: 'v2', timestamp: '2025-09-21T05:30:00Z', niveau: 80, type: 'avant_trajet', trajet_id: 't4' },
  { id: 'nc6', vehicule_id: 'v2', timestamp: '2025-09-21T10:00:00Z', niveau: 68.4, type: 'avant_plein', plein_id: 'p3' },
  { id: 'nc7', vehicule_id: 'v2', timestamp: '2025-09-21T10:01:00Z', niveau: 120, type: 'apres_plein', plein_id: 'p3' }, // Plein complet: 68.4 + 105 = 173.4 -> limité à 120L
  { id: 'nc8', vehicule_id: 'v2', timestamp: '2025-09-21T20:15:00Z', niveau: 62, type: 'apres_trajet', trajet_id: 't4' },
  
  // Trajets v1 - autres (capacité 90L)
  { id: 'nc9', vehicule_id: 'v1', timestamp: '2025-09-20T06:00:00Z', niveau: 55, type: 'avant_trajet', trajet_id: 't2' },
  { id: 'nc10', vehicule_id: 'v1', timestamp: '2025-09-20T18:30:00Z', niveau: 18, type: 'apres_trajet', trajet_id: 't2' },
  
  { id: 'nc11', vehicule_id: 'v1', timestamp: '2025-09-22T07:00:00Z', niveau: 18, type: 'avant_trajet', trajet_id: 't3' },
  { id: 'nc12', vehicule_id: 'v1', timestamp: '2025-09-22T14:15:00Z', niveau: 12, type: 'avant_plein', plein_id: 'p2' },
  { id: 'nc13', vehicule_id: 'v1', timestamp: '2025-09-22T14:16:00Z', niveau: 80, type: 'apres_plein', plein_id: 'p2' }, // 12 + 68 = 80L < 90L
  { id: 'nc14', vehicule_id: 'v1', timestamp: '2025-09-22T19:00:00Z', niveau: 11, type: 'apres_trajet', trajet_id: 't3' },
];