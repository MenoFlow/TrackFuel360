// Données de trajets et traces GPS
import { Trajet, TraceGPSPoint } from '@/types';

export const mockTrajets: Trajet[] = [
  { 
    id: 't1', 
    vehicule_id: 'v1', 
    chauffeur_id: 'u3', 
    date_debut: '2025-10-07T08:00:00Z', 
    date_fin: '2025-10-07T12:15:00Z', 
    distance_km: 118.1, 
    odometre_debut: 120332, 
    odometre_fin: 120450, 
    type_saisie: 'auto'
  },
  { 
    id: 't2', 
    vehicule_id: 'v1', 
    chauffeur_id: 'u3', 
    date_debut: '2025-09-20T06:00:00Z', 
    date_fin: '2025-09-20T18:30:00Z', 
    distance_km: 285, 
    odometre_debut: 119750, 
    odometre_fin: 120035, 
    type_saisie: 'auto' 
  },
  { 
    id: 't3', 
    vehicule_id: 'v4', 
    chauffeur_id: 'u3', 
    date_debut: '2025-09-22T07:00:00Z', 
    date_fin: '2025-09-22T19:00:00Z', 
    distance_km: 297, 
    odometre_debut: 120035, 
    odometre_fin: 120332, 
    type_saisie: 'auto' 
  },
  { 
    id: 't4', 
    vehicule_id: 'v2', 
    chauffeur_id: 'u4', 
    date_debut: '2025-09-21T05:30:00Z', 
    date_fin: '2025-09-21T20:15:00Z', 
    distance_km: 620, 
    odometre_debut: 77830, 
    odometre_fin: 78450, 
    type_saisie: 'manuelle' 
  },
];

export const mockTraceGPSPoints: TraceGPSPoint[] = [
  // Trajet t1
  { id: 'gps1', trajet_id: 't1', sequence: 1, latitude: -17.9578, longitude: 44.9176, timestamp: '2025-10-07T08:00:00Z' },
  { id: 'gps2', trajet_id: 't1', sequence: 2, latitude: -17.6754, longitude: 48.1696, timestamp: '2025-10-07T12:15:00Z' },
  

  { id: 'gps3', trajet_id: 't1', sequence: 3, latitude: -17.6754, longitude: 48.1696, timestamp: '2025-10-07T08:00:00Z' },
  { id: 'gps4', trajet_id: 't1', sequence: 4, latitude: -19.4458, longitude: 45.6372, timestamp: '2025-10-07T12:15:00Z' },

  // Trajet t2
  { id: 'gps5', trajet_id: 't2', sequence: 5, latitude: -19.4458, longitude: 45.6372, timestamp: '2025-10-07T12:15:00Z' },
  { id: 'gps6', trajet_id: 't2', sequence: 6, latitude: -17.4031, longitude: 45.1758, timestamp: '2025-10-07T12:15:00Z' },


  
  // Trajet t3
  // { id: 'gps5', trajet_id: 't3', sequence: 1, latitude: -19.3681, longitude: 45.6262, timestamp: '2025-10-07T08:00:00Z' },
  // { id: 'gps6', trajet_id: 't3', sequence: 2, latitude: -17.4031, longitude: 45.1758, timestamp: '2025-10-07T12:15:00Z' },
  
  
  // // // Trajet t4
  // { id: 'gps7', trajet_id: 't4', sequence: 1, latitude: -17.3926, longitude: 45.4669, timestamp: '2025-10-07T08:00:00Z' },
  // { id: 'gps8', trajet_id: 't4', sequence: 2, latitude: -20.5709, longitude: 46.9226, timestamp: '2025-10-07T12:15:00Z' },
  
];