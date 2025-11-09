// hooks/useAggregatedData.ts
import { useUsers } from '@/hooks/useUsers';
import { useVehicules } from '@/hooks/useVehicules';
import { useSites } from '@/hooks/useSites';
import { useAffectations } from '@/hooks/useAffectations';
import { useCorrections } from '@/hooks/useCorrections';
import { useParametres } from '@/hooks/useParameter';

import { useTrajets } from '@/hooks/useTrajets';
import { useTraceGps } from '@/hooks/useTraceGPSPoints';
import { usePleins } from '@/hooks/usePleins';
import { useNiveauxCarburant } from '@/hooks/useNiveauxCarburant';
import { usePleinMetadata } from '@/hooks/usePleinMetadata';
import { useGeofences } from '@/hooks/useGeofences';

export const useAggregatedData = () => {
  const usersQuery = useUsers();
  const vehiculesQuery = useVehicules();
  const sitesQuery = useSites();
  const affectationsQuery = useAffectations();
  const correctionsQuery = useCorrections();
  const {parametres} = useParametres();

  const trajetsQuery = useTrajets();
  const traceGPSQuery = useTraceGps();
  const pleinsQuery = usePleins();
  const niveauxCarburantQuery = useNiveauxCarburant();
  const pleinExifQuery = usePleinMetadata();
  const {geofences} = useGeofences();
  
  const params: ParametresDetection = {
    seuil_surconsommation_pct: Number(parametres?.find(p => p.id === 'seuil_surconsommation_pct')?.valeur ?? 20),
    seuil_ecart_gps_pct: Number(parametres?.find(p => p.id === 'seuil_ecart_gps_pct')?.valeur ?? 15),
    seuil_carburant_disparu_litres: Number(parametres?.find(p => p.id === 'seuil_carburant_disparu_litres')?.valeur ?? 5),
    seuil_exif_heures: Number(parametres?.find(p => p.id === 'seuil_exif_heures')?.valeur ?? 2),
    seuil_exif_distance_km: Number(parametres?.find(p => p.id === 'seuil_exif_distance_km')?.valeur ?? 0.5), // 500m
    seuil_immobilisation_heures: Number(parametres?.find(p => p.id === 'seuil_immobilisation_heures')?.valeur ?? 8),
    periode_consommation_jours: Number(parametres?.find(p => p.id === 'periode_consommation_jours')?.valeur ?? 30),
  };

  return {
    users: usersQuery.data ?? [],
    vehicules: vehiculesQuery.data ?? [],
    sites: sitesQuery.data ?? [],
    affectations: affectationsQuery.data ?? [],
    corrections: correctionsQuery.data ?? [],
    params,
    trajets: trajetsQuery.data ?? [],
    traceGPSPoints: traceGPSQuery.data ?? [],
    pleins: pleinsQuery.data ?? [],
    niveauxCarburant: niveauxCarburantQuery.data ?? [],
    pleinExifMetadata: pleinExifQuery.data ?? [],
    geofences: geofences ?? [],
  };
};


// Point d'entrée principal pour toutes les données mock
// Ce fichier agrège les données de différents modules
import { 
  ParametresDetection
} from '@/types';

// Import des services
import { generateAlertes } from './services/alerteService';

//----------------------------------------------------------------------------------------

// Import des données pour les calculs
import { mockVehicules, mockSites, mockUsers, mockAffectations } from './data/mockData.base';

import { mockTrajets, mockTraceGPSPoints } from './data/mockData.trajectories';
import { mockPleins, mockNiveauxCarburant, mockPleinExifMetadata } from './data/mockData.fuel';
import { mockGeofences } from './data/mockData.geofences';
import { mockCorrections, mockParametresDetection } from './data/mockData.corrections';

//------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------
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

//-----------------------------------------------------------------



export interface Parametre {
  id: string;
  label: string;
  description: string;
  valeur: number;
  unite: string;
  min: number;
  max: number;
}
