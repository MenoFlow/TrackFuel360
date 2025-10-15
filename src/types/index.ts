// Types pour TrackFuel360
export type AppRole = 'admin' | 'manager' | 'supervisor' | 'driver' | 'auditor';

export type SaisieType = 'auto' | 'manuelle';

export type CorrectionStatus = 'pending' | 'validated' | 'rejected';

export type AlerteType = 
  | 'consommation_elevee' 
  | 'plein_hors_zone' 
  | 'doublon_bon' 
  | 'distance_gps_ecart'
  | 'immobilisation_anormale'
  | 'carburant_disparu'
  | 'plein_suspect';

export type AlerteStatus = 'new' | 'in_progress' | 'resolved' | 'dismissed';

// Types de rapports
export type RapportType = 
  | 'mensuel_site' 
  | 'top_ecarts' 
  | 'anomalies' 
  | 'corrections' 
  | 'comparaison' 
  | 'kpi_global';

export type FormatExport = 'pdf' | 'excel' | 'csv' | 'json';

export interface RapportFilters {
  date_debut?: string;
  date_fin?: string;
  site_id?: string;
  vehicule_id?: string;
  chauffeur_id?: string;
  type_anomalie?: AlerteType;
  score_minimum?: number;
  statut_correction?: CorrectionStatus;
  type_saisie?: SaisieType;
}

export interface RapportMetadata {
  id: string;
  type: RapportType;
  titre: string;
  description: string;
  date_generation: string;
  utilisateur_id: string;
  utilisateur_nom: string;
  filtres: RapportFilters;
  nb_lignes: number;
  format?: FormatExport;
}

export interface RapportData {
  metadata: RapportMetadata;
  donnees: any[];
  statistiques?: {
    total_vehicules?: number;
    total_litres?: number;
    total_cout?: number;
    consommation_moyenne?: number;
    nb_anomalies?: number;
    nb_corrections?: number;
    [key: string]: any;
  };
}


export interface User {
  id: string;
  email: string;
  matricule: string;
  nom: string;
  prenom: string;
  role: AppRole;
  site_id?: string;
}

export interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  type: string;
  capacite_reservoir: number;
  consommation_nominale: number; // L/100km
  site_id?: string;
  actif: boolean;
  carburant_initial?: number; // Litres
}

export interface Site {
  id: string;
  nom: string;
  ville: string;
  pays: string;
}

export interface Affectation {
  id: string;
  vehicule_id: string;
  chauffeur_id: string;
  date_debut: string;
  date_fin: string;
}

export interface TraceGPSPoint {
  id: string;
  trajet_id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export interface Trajet {
  id: string;
  vehicule_id: string;
  chauffeur_id: string;
  date_debut: string;
  date_fin: string;
  distance_km: number;
  odometre_debut?: number;
  odometre_fin?: number;
  type_saisie: SaisieType;
  traceGps?: any;
}

export interface PleinExifMetadata {
  id: string;
  plein_id: string;
  date: string;
  heure: string;
  latitude: number;
  longitude: number;
  modele_telephone: string;
}

export interface Plein {
  id: string;
  vehicule_id: string;
  chauffeur_id: string;
  date: string;
  litres: number;
  prix_unitaire: number;
  odometre: number;
  station?: string;
  photo_bon?: string;
  ocr_data?: any;
  hash_bon?: string;
  type_saisie: SaisieType;
  geofence_id?: string;
  latitude?: number;
  longitude?: number;
}

export interface NiveauCarburant {
  id: string;
  vehicule_id: string;
  timestamp: string;
  niveau: number; // Litres
  type: 'avant_trajet' | 'apres_trajet' | 'avant_plein' | 'apres_plein';
  trajet_id?: string; // Référence au trajet concerné
  plein_id?: string; // Référence au plein concerné
}

export interface ParametresDetection {
  seuil_surconsommation_pct: number; // % au-dessus de la nominale
  seuil_ecart_gps_pct: number; // % écart GPS vs odomètre
  seuil_carburant_disparu_litres: number; // Litres manquants minimum
  seuil_exif_heures: number; // Heures d'écart EXIF max
  seuil_exif_distance_km: number; // Distance EXIF max en km
  seuil_immobilisation_heures: number; // Heures d'immobilisation hors dépôt
  periode_consommation_jours: number; // Période pour calcul consommation moyenne
}

export interface AlerteMetadata {
  id: string;
  alerte_id: string;
  key: string;
  value: string;
}

export interface Alerte {
  id: string;
  vehicule_id: string;
  type: AlerteType;
  titre: string;
  description: string;
  score: number; // 0-100
  status: AlerteStatus;
  date_detection: string;
  justification?: string;
  resolved_by?: string;
  resolved_at?: string;
  chauffeur_id?: string;
  deviation_percent?: number;
  litres_manquants?: number;
  severity?: 'low' | 'medium' | 'high';
}

export interface Correction {
  id: string;
  table: string;
  record_id: string;
  champ: string;
  old_value: any;
  new_value: any;
  status: CorrectionStatus;
  // reason: string;
  comment?: string;
  requested_by: string;
  requested_at: string;
  validated_by?: string;
  validated_at?: string;
}

export interface GeofencePoint {
  id: string;
  geofence_id: string;
  sequence: number;
  latitude: number;
  longitude: number;
}

export interface Geofence {
  id: string;
  nom: string;
  type: 'depot' | 'station' | 'zone_risque';
  lat: number; // Latitude du centre
  lon: number; // Longitude du centre
  rayon_metres: number; // Rayon en mètres
  site_id?: string;
}

export interface ConsommationStats {
  vehicule_id: string;
  periode: string;
  litres_total: number;
  distance_total_km: number;
  consommation_moyenne: number; // L/100km
  cout_total: number;
  cout_par_km: number;
  nb_pleins: number;
}

export interface DashboardStats {
  total_vehicules: number;
  vehicules_actifs: number;
  alertes_actives: number;
  cout_carburant_mois: number;
  litres_mois: number;
  distance_mois_km: number;
  consommation_moyenne_flotte: number;
  top_vehicules_consommation: Array<{
    vehicule_id: string;
    immatriculation: string;
    consommation: number;
    ecart_pourcentage: number;
  }>;
}
