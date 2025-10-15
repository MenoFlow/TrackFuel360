// Données de corrections et paramètres
import { Correction, ParametresDetection } from '@/types';

export const mockCorrections: Correction[] = [
  {
    id: 'c1',
    table: 'plein',
    record_id: 'p3',
    champ: 'litres',
    old_value: 95,
    new_value: 105,
    status: 'pending',
    comment: 'Erreur de saisie initiale - bon papier indique 105L',
    requested_by: 'u4',
    requested_at: '2025-09-21T11:00:00Z',
  },
  {
    id: 'c2',
    table: 'plein',
    record_id: 'p1',
    champ: 'odometre',
    old_value: 120400,
    new_value: 120450,
    status: 'validated',
    comment: 'Correction odomètre après vérification photo',
    requested_by: 'u3',
    requested_at: '2025-10-07T11:00:00Z',
    validated_by: 'u2',
    validated_at: '2025-10-07T14:30:00Z',
  },
];

export const mockParametresDetection: ParametresDetection = {
  seuil_surconsommation_pct: 30, // 30% au-dessus de la nominale
  seuil_ecart_gps_pct: 20, // 20% d'écart GPS vs odomètre
  seuil_carburant_disparu_litres: 5, // 5L manquants minimum
  seuil_exif_heures: 2, // 2h d'écart EXIF max
  seuil_exif_distance_km: 1, // 1km d'écart EXIF max
  seuil_immobilisation_heures: 12, // 12h d'immobilisation hors dépôt
  periode_consommation_jours: 7, // 7 jours pour calcul consommation moyenne
};