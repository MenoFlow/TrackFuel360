// Point d'entrée principal pour toutes les données mock
// Ce fichier agrège les données de différents modules
import { 
  Vehicule, Trajet, Plein,
  RapportMetadata
} from '@/types';

// Import des services
import { calculerDashboardStats } from './services/dashboardService';
import { generateAlertes } from './services/alerteService';

//----------------------------------------------------------------------------------------

// Import des données pour les calculs
import { mockVehicules, mockSites, mockUsers, mockAffectations } from './data/mockData.base';

import { mockTrajets, mockTraceGPSPoints } from './data/mockData.trajectories';
import { mockPleins, mockNiveauxCarburant, mockPleinExifMetadata } from './data/mockData.fuel';
import { mockGeofences } from './data/mockData.geofences';
import { mockCorrections, mockParametresDetection } from './data/mockData.corrections';

//------------------------------------------------------------------------------------------

// Export des données de base
export { mockSites, mockUsers, mockVehicules, mockAffectations } from './data/mockData.base';

// Export des données de trajets
export { mockTrajets, mockTraceGPSPoints } from './data/mockData.trajectories';

// Export des données de carburant
export { mockPleins, mockPleinExifMetadata, mockNiveauxCarburant } from './data/mockData.fuel';

// Export des données de géolocalisation
export { mockGeofences, mockGeofencePoints } from './data/mockData.geofences';

// Export des corrections et paramètres
export { mockCorrections, mockParametresDetection } from './data/mockData.corrections';


// Générer les alertes dynamiquement
export const mockAlertes = generateAlertes(
  mockVehicules,
  mockTrajets,
  mockPleins,
  mockNiveauxCarburant,
  mockGeofences,
  mockPleinExifMetadata,
  mockTraceGPSPoints,
  mockParametresDetection
);

// ---------------------------------- Not a mockData-----------------------------


export function consolidateTripsWithTraceGps(
  // trajets: Trajet[],
  // tracePoints: TraceGPSPoint[]
): Trajet[] {
  return mockTrajets.map((trajet) => {
    const relatedPoints = mockTraceGPSPoints
      .filter((point) => point.trajet_id === trajet.id)
      .sort((a, b) => a.sequence - b.sequence); // Optionnel : trier par séquence

    return {
      ...trajet,
      traceGps: relatedPoints,
    };
  });
}

// Calculer les stats du dashboard dynamiquement
export const mockDashboardStats = calculerDashboardStats(
  mockVehicules,
  mockTrajets,
  mockPleins,
  mockNiveauxCarburant,
  mockAlertes
);

export const getVehiculeById = (id: number): Vehicule | undefined => {
  return mockVehicules.find(v => v.id === id);
};

export const getVehiculesBySite = (site: number): Vehicule[] => {
  return mockVehicules.filter(v => v.site_id === site);
};

export const getPleinsByVehiculeId = (vehicule_id: number): Plein[] => {
  return mockPleins.filter(p => p.vehicule_id === vehicule_id);
};

export const getRefuelsByVehicleId = getPleinsByVehiculeId;

export const getTripsByVehicleId = (vehicule_id: number): Trajet[] => {
  return consolidateTripsWithTraceGps().filter(trajet => trajet.vehicule_id === vehicule_id);
};

export const addTrip = (trip: Omit<Trajet, 'id'>): Trajet => {
  const newTrip: Trajet = {
    id: (mockTrajets.length + 1),
    ...trip
  };
  mockTrajets.push(newTrip);
  return newTrip;
};



// Rapports
export const mockRapportsMetadata: RapportMetadata[] = [
  { id: "rapp-1", type: "mensuel_site", titre: "Rapport mensuel Paris Nord", description: "Consommation janvier 2025", date_generation: "2025-02-01T10:00:00Z", utilisateur_id: 2, utilisateur_nom: "Marie Martin", nb_lignes: 156, format: "pdf" },
  { id: "rapp-2", type: "top_ecarts", titre: "Top 10 écarts janvier", description: "Véhicules avec plus grands écarts", date_generation: "2025-02-01T11:00:00Z", utilisateur_id: 2, utilisateur_nom: "Marie Martin", nb_lignes: 10, format: "excel" },
];

// Objet contenant toutes les données mockées par type
export const mockDataByType: Record<string, any[]> = {
  Site: mockSites,
  Geofence: mockGeofences,
  User: mockUsers,
  Vehicule: mockVehicules,
  Affectation: mockAffectations,
  Trip: mockTrajets,
  TraceGps: mockTraceGPSPoints,
  Plein: mockPleins,
  PleinExifMetadata: mockPleinExifMetadata,
  NiveauCarburant: mockNiveauxCarburant,
  Parametre: [mockParametresDetection],
  Correction: mockCorrections,
};


export interface Parametre {
  id: string;
  label: string;
  description: string;
  valeur: number;
  unite: string;
  min: number;
  max: number;
}

export const parametresData: Parametre[] = [
  {
    id: "seuil_surconsommation_pct",
    label: "Seuil de surconsommation",
    description: "Pourcentage au-dessus de la consommation nominale",
    valeur: 30,
    unite: "%",
    min: 0,
    max: 100,
  },
  {
    id: "seuil_ecart_gps_pct",
    label: "Écart GPS vs odomètre",
    description: "Écart maximal entre GPS et odomètre",
    valeur: 20,
    unite: "%",
    min: 0,
    max: 100,
  },
  {
    id: "seuil_carburant_disparu_litres",
    label: "Carburant disparu",
    description: "Seuil minimal de carburant manquant",
    valeur: 5,
    unite: "L",
    min: 0,
    max: 1000,
  },
  {
    id: "seuil_exif_heures",
    label: "Écart EXIF temporel",
    description: "Écart maximal entre heure EXIF et heure réelle",
    valeur: 2,
    unite: "h",
    min: 0,
    max: 48,
  },
  {
    id: "seuil_exif_distance_km",
    label: "Écart EXIF géographique",
    description: "Écart maximal entre position EXIF et position réelle",
    valeur: 1,
    unite: "km",
    min: 0,
    max: 100,
  },
  {
    id: "seuil_immobilisation_heures",
    label: "Durée d'immobilisation",
    description: "Temps d'immobilisation hors dépôt déclenchant une alerte",
    valeur: 12,
    unite: "h",
    min: 0,
    max: 168,
  },
  {
    id: "periode_consommation_jours",
    label: "Période d'analyse",
    description: "Durée d'analyse de la consommation moyenne",
    valeur: 7,
    unite: "jours",
    min: 1,
    max: 365,
  },
];
