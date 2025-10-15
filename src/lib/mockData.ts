// Mock data pour le développement sans backend
import { 
  Vehicule, Trajet, Plein, TraceGPSPoint
} from '@/types';

// Point d'entrée principal pour toutes les données mock
// Ce fichier agrège les données de différents modules

// Import des données de base
export { mockSites, mockUsers, mockVehicules, mockAffectations } from './data/mockData.base';

// Import des données de trajets
export { mockTrajets, mockTraceGPSPoints } from './data/mockData.trajectories';

// Import des données de carburant
export { mockPleins, mockPleinExifMetadata, mockNiveauxCarburant } from './data/mockData.fuel';

// Import des données de géolocalisation
export { mockGeofences, mockGeofencePoints } from './data/mockData.geofences';

// Import des corrections et paramètres
export { mockCorrections, mockParametresDetection } from './data/mockData.corrections';

// Import des services
import { calculerDashboardStats } from './services/dashboardService';
import { generateAlertes } from './services/alerteService';

// Import des données pour les calculs
import { mockVehicules } from './data/mockData.base';
import { mockTrajets, mockTraceGPSPoints } from './data/mockData.trajectories';
import { mockPleins, mockNiveauxCarburant, mockPleinExifMetadata } from './data/mockData.fuel';
import { mockGeofences } from './data/mockData.geofences';
import { mockParametresDetection } from './data/mockData.corrections';

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

// Calculer les stats du dashboard dynamiquement
export const mockDashboardStats = calculerDashboardStats(
  mockVehicules,
  mockTrajets,
  mockPleins,
  mockNiveauxCarburant,
  mockAlertes
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

export const getVehiculeById = (id: string): Vehicule | undefined => {
  return mockVehicules.find(v => v.id === id);
};

export const getVehiculesBySite = (site: string): Vehicule[] => {
  return mockVehicules.filter(v => v.site_id === site);
};

export const getPleinsByVehiculeId = (vehicule_id: string): Plein[] => {
  return mockPleins.filter(p => p.vehicule_id === vehicule_id);
};

export const getRefuelsByVehicleId = getPleinsByVehiculeId;

export const getTripsByVehicleId = (vehicule_id: string): Trajet[] => {
  return consolidateTripsWithTraceGps().filter(trajet => trajet.vehicule_id === vehicule_id);
};

export const addTrip = (trip: Omit<Trajet, 'id'>): Trajet => {
  const newTrip: Trajet = {
    id: String(mockTrajets.length + 1),
    ...trip
  };
  mockTrajets.push(newTrip);
  return newTrip;
};

// Pour les administrateurs, il faut mettre le bouton "Ajouter un trajet" dans "Gestion des véhicules" juste a cote du bouton "Voir details"

// Pour les chauffeurs, mettre le bouton "Ajouter un trajet" a droite du bouton "Demande de correction"
