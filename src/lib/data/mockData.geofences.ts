// Données de géolocalisation (geofences et points)
import { Geofence, GeofencePoint } from '@/types';

export const mockGeofences: Geofence[] = [
  { id: 'g1', nom: 'Dépôt Central Kinshasa', type: 'depot', lat: -4.3276, lon: 15.3136, rayon_metres: 500, site_id: 's1' },
  { id: 'g2', nom: 'Station Total Gombe', type: 'station', lat: -4.3276, lon: 15.3136, rayon_metres: 150 },
  { id: 'g3', nom: 'Station Shell Limete', type: 'station', lat: -4.3797, lon: 15.2993, rayon_metres: 150 },
  { id: 'g4', nom: 'Station Total Lubumbashi', type: 'station', lat: -11.6792, lon: 27.4794, rayon_metres: 150 },
  { id: 'g5', nom: 'Dépôt Nord Lubumbashi', type: 'depot', lat: -11.6792, lon: 27.4794, rayon_metres: 500, site_id: 's2' },
  { id: 'g6', nom: 'Zone risque Nord', type: 'zone_risque', lat: -4.2, lon: 15.4, rayon_metres: 2000 },
];

export const mockGeofencePoints: GeofencePoint[] = [
  // Points de polygone pour le dépôt central (optionnel, pour les geofences complexes)
  { id: 'gp1', geofence_id: 'g1', sequence: 1, latitude: -4.3276, longitude: 15.3136 },
  { id: 'gp2', geofence_id: 'g1', sequence: 2, latitude: -4.3280, longitude: 15.3140 },
  { id: 'gp3', geofence_id: 'g1', sequence: 3, latitude: -4.3270, longitude: 15.3145 },
];