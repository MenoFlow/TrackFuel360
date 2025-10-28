// Données de trajets et traces GPS réalistes
import { Trajet, TraceGPSPoint } from '@/types';

export const mockTrajets: Trajet[] = [
  { 
    id: 't1', 
    vehicule_id: 'CGO-123-AA', 
    chauffeur_id: 'u3', 
    date_debut: '2025-10-07T08:00:00Z', 
    date_fin: '2025-10-07T12:15:00Z', 
    distance_km: 118.1, 
    type_saisie: 'auto'
  },
  {
    id: 't2', 
    vehicule_id: 'CGO-123-AA', 
    chauffeur_id: 'u3', 
    date_debut: '2025-09-20T06:00:00Z', 
    date_fin: '2025-09-20T18:30:00Z', 
    distance_km: 285, 
    type_saisie: 'auto' 
  },
  { 
    id: 't3', 
    vehicule_id: 'CGO-456-BB', 
    chauffeur_id: 'u4', 
    date_debut: '2025-09-22T07:00:00Z', 
    date_fin: '2025-09-22T19:00:00Z', 
    distance_km: 297, 
    type_saisie: 'auto' 
  },
  { 
    id: 't4', 
    vehicule_id: 'CGO-789-CC', 
    chauffeur_id: 'u5', 
    date_debut: '2025-09-21T05:30:00Z', 
    date_fin: '2025-09-21T20:15:00Z', 
    distance_km: 620, 
    type_saisie: 'manuelle' 
  },
  { 
    id: 't6', 
    vehicule_id: 'CGO-654-EE', 
    chauffeur_id: 'u7', 
    date_debut: '2025-09-28T10:00:00Z', 
    date_fin: '2025-09-28T18:00:00Z', 
    distance_km: 320, 
    type_saisie: 'auto' 
  }
];

export const mockTraceGPSPoints: TraceGPSPoint[] = [
  // === Trajet t1 (Mahajanga → Ambondromamy)
  { id: 'gps1', trajet_id: 't1', sequence: 1, latitude: -15.716, longitude: 46.317, timestamp: '2025-10-07T08:00:00Z' },
  { id: 'gps2', trajet_id: 't1', sequence: 2, latitude: -15.800, longitude: 46.500, timestamp: '2025-10-07T08:30:00Z' },
  { id: 'gps3', trajet_id: 't1', sequence: 3, latitude: -15.900, longitude: 46.680, timestamp: '2025-10-07T09:00:00Z' },
  { id: 'gps4', trajet_id: 't1', sequence: 4, latitude: -16.000, longitude: 46.880, timestamp: '2025-10-07T09:30:00Z' },
  { id: 'gps5', trajet_id: 't1', sequence: 5, latitude: -16.150, longitude: 47.050, timestamp: '2025-10-07T10:30:00Z' },
  { id: 'gps6', trajet_id: 't1', sequence: 6, latitude: -16.300, longitude: 47.250, timestamp: '2025-10-07T11:00:00Z' },
  { id: 'gps7', trajet_id: 't1', sequence: 7, latitude: -16.400, longitude: 47.350, timestamp: '2025-10-07T11:45:00Z' },
  { id: 'gps8', trajet_id: 't1', sequence: 8, latitude: -16.500, longitude: 47.400, timestamp: '2025-10-07T12:15:00Z' },

  // === Trajet t2 (Ambondromamy → Tana)
  { id: 'gps9', trajet_id: 't2', sequence: 1, latitude: -16.500, longitude: 47.400, timestamp: '2025-09-20T06:00:00Z' },
  { id: 'gps10', trajet_id: 't2', sequence: 2, latitude: -17.000, longitude: 47.600, timestamp: '2025-09-20T07:30:00Z' },
  { id: 'gps11', trajet_id: 't2', sequence: 3, latitude: -17.300, longitude: 47.700, timestamp: '2025-09-20T09:00:00Z' },
  { id: 'gps12', trajet_id: 't2', sequence: 4, latitude: -17.600, longitude: 47.800, timestamp: '2025-09-20T11:00:00Z' },
  { id: 'gps13', trajet_id: 't2', sequence: 5, latitude: -18.000, longitude: 47.900, timestamp: '2025-09-20T13:00:00Z' },
  { id: 'gps14', trajet_id: 't2', sequence: 6, latitude: -18.500, longitude: 47.900, timestamp: '2025-09-20T15:30:00Z' },
  { id: 'gps15', trajet_id: 't2', sequence: 7, latitude: -18.870, longitude: 47.530, timestamp: '2025-09-20T18:30:00Z' },

  // === Trajet t3 (Tana → Antsirabe)
  { id: 'gps16', trajet_id: 't3', sequence: 1, latitude: -18.870, longitude: 47.530, timestamp: '2025-09-22T07:00:00Z' },
  { id: 'gps17', trajet_id: 't3', sequence: 2, latitude: -19.000, longitude: 47.400, timestamp: '2025-09-22T08:30:00Z' },
  { id: 'gps18', trajet_id: 't3', sequence: 3, latitude: -19.150, longitude: 47.250, timestamp: '2025-09-22T09:45:00Z' },
  { id: 'gps19', trajet_id: 't3', sequence: 4, latitude: -19.250, longitude: 47.100, timestamp: '2025-09-22T10:30:00Z' },
  { id: 'gps20', trajet_id: 't3', sequence: 5, latitude: -19.450, longitude: 47.000, timestamp: '2025-09-22T11:45:00Z' },
  { id: 'gps21', trajet_id: 't3', sequence: 6, latitude: -19.680, longitude: 47.030, timestamp: '2025-09-22T13:30:00Z' },

  // === Trajet t4 (Tulear → Morondava)
  { id: 'gps22', trajet_id: 't4', sequence: 1, latitude: -23.350, longitude: 43.670, timestamp: '2025-09-21T05:30:00Z' },
  { id: 'gps23', trajet_id: 't4', sequence: 2, latitude: -22.900, longitude: 44.100, timestamp: '2025-09-21T07:00:00Z' },
  { id: 'gps24', trajet_id: 't4', sequence: 3, latitude: -22.300, longitude: 44.450, timestamp: '2025-09-21T09:30:00Z' },
  { id: 'gps25', trajet_id: 't4', sequence: 4, latitude: -21.800, longitude: 44.750, timestamp: '2025-09-21T11:45:00Z' },
  { id: 'gps26', trajet_id: 't4', sequence: 5, latitude: -21.400, longitude: 44.900, timestamp: '2025-09-21T13:30:00Z' },
  { id: 'gps27', trajet_id: 't4', sequence: 6, latitude: -20.900, longitude: 44.920, timestamp: '2025-09-21T16:00:00Z' },
  { id: 'gps28', trajet_id: 't4', sequence: 7, latitude: -20.300, longitude: 44.980, timestamp: '2025-09-21T18:30:00Z' },

  // === Trajet t5 (Tamatave → Foulpointe)
  { id: 'gps29', trajet_id: 't5', sequence: 1, latitude: -18.149, longitude: 49.402, timestamp: '2025-09-25T09:00:00Z' },
  { id: 'gps30', trajet_id: 't5', sequence: 2, latitude: -18.050, longitude: 49.450, timestamp: '2025-09-25T09:45:00Z' },
  { id: 'gps31', trajet_id: 't5', sequence: 3, latitude: -17.950, longitude: 49.500, timestamp: '2025-09-25T10:30:00Z' },
  { id: 'gps32', trajet_id: 't5', sequence: 4, latitude: -17.850, longitude: 49.550, timestamp: '2025-09-25T11:15:00Z' },
  { id: 'gps33', trajet_id: 't5', sequence: 5, latitude: -17.750, longitude: 49.600, timestamp: '2025-09-25T12:00:00Z' },
  { id: 'gps34', trajet_id: 't5', sequence: 6, latitude: -17.650, longitude: 49.650, timestamp: '2025-09-25T13:00:00Z' },

  // === Trajet t6 (Fianarantsoa → Manakara)
  { id: 'gps35', trajet_id: 't6', sequence: 1, latitude: -21.450, longitude: 47.100, timestamp: '2025-09-28T10:00:00Z' },
  { id: 'gps36', trajet_id: 't6', sequence: 2, latitude: -21.600, longitude: 47.300, timestamp: '2025-09-28T11:30:00Z' },
  { id: 'gps37', trajet_id: 't6', sequence: 3, latitude: -21.700, longitude: 47.450, timestamp: '2025-09-28T13:00:00Z' },
  { id: 'gps38', trajet_id: 't6', sequence: 4, latitude: -21.850, longitude: 47.600, timestamp: '2025-09-28T14:30:00Z' },
  { id: 'gps39', trajet_id: 't6', sequence: 5, latitude: -22.050, longitude: 47.700, timestamp: '2025-09-28T16:00:00Z' },
  { id: 'gps40', trajet_id: 't6', sequence: 6, latitude: -22.150, longitude: 47.870, timestamp: '2025-09-28T18:00:00Z' },

  // === Trajet t7 (Antsirabe → Ambositra)
  { id: 'gps41', trajet_id: 't7', sequence: 1, latitude: -19.680, longitude: 47.030, timestamp: '2025-09-30T06:30:00Z' },
  { id: 'gps42', trajet_id: 't7', sequence: 2, latitude: -19.850, longitude: 47.100, timestamp: '2025-09-30T07:30:00Z' },
  { id: 'gps43', trajet_id: 't7', sequence: 3, latitude: -20.050, longitude: 47.150, timestamp: '2025-09-30T08:30:00Z' },
  { id: 'gps44', trajet_id: 't7', sequence: 4, latitude: -20.250, longitude: 47.200, timestamp: '2025-09-30T09:30:00Z' },
  { id: 'gps45', trajet_id: 't7', sequence: 5, latitude: -20.450, longitude: 47.250, timestamp: '2025-09-30T10:30:00Z' },
  { id: 'gps46', trajet_id: 't7', sequence: 6, latitude: -20.650, longitude: 47.300, timestamp: '2025-09-30T11:30:00Z' },
];
