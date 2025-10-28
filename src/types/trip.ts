/**
 * Type definitions for Trip management
 * These types will be shared between frontend and backend
 */

export interface TripGPSPoint {
  id: string;
  trajet_id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  timestamp: string; // ISO datetime string
}

export interface Trip {
  id: string;
  vehicule_id: string;
  chauffeur_id: string;
  date_debut: string; // ISO datetime string
  date_fin: string; // ISO datetime string
  distance_km: number;
  type_saisie: "auto" | "manuelle";
  traceGps?: TripGPSPoint[];
  created_at?: string; // ISO datetime string
}

export interface TripInput {
  vehicule_id: string;
  chauffeur_id: string;
  date_debut: string;
  date_fin: string;
  distance_km: number;
  type_saisie: "auto" | "manuelle";
  traceGps: TripGPSPoint[];
}

export interface TripFilters {
  vehicule_id?: string;
  start_date?: string;
  end_date?: string;
}
