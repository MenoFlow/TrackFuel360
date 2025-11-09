import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RapportType, RapportFilters, RapportData, RapportMetadata } from '@/types';
import { genererRapport } from '@/lib/services/rapportService';
import { mockVehicules, mockSites, mockUsers } from '@/lib/data/mockData.base';
import { mockTrajets } from '@/lib/data/mockData.trajectories';
import { mockPleins } from '@/lib/data/mockData.fuel';
// import { allAlertes } from '@/lib/mockData';
import { mockCorrections } from '@/lib/data/mockData.corrections';
import * as rapportStorage from '@/lib/services/rapportStorage';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hook pour générer un rapport
 */
export const useGenererRapport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      type, 
      filtres, 
      currentUser 
    }: { 
      type: RapportType; 
      filtres: RapportFilters;
      currentUser: any;
    }): Promise<RapportData> => {
      console.log('[useRapports] Début génération rapport:', { type, filtres });
      await delay(800); // Simulation génération
      
      const rapport = genererRapport(
        type,
        filtres,
        mockVehicules,
        mockTrajets,
        mockPleins,
        // allAlertes,
        mockCorrections,
        mockSites,
        currentUser
      );
      
      console.log('[useRapports] Rapport généré:', rapport.metadata.id);
      
      // Nettoyer les rapports expirés avant d'ajouter le nouveau
      await rapportStorage.cleanupExpiredRapports();
      
      // Stocker le rapport dans IndexedDB
      await rapportStorage.storeRapport(rapport);
      
      return rapport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports-historique'] });
    }
  });
};

/**
 * Hook pour récupérer l'historique des rapports générés
 */
export const useHistoriqueRapports = () => {
  return useQuery({
    queryKey: ['rapports-historique'],
    queryFn: async (): Promise<RapportMetadata[]> => {
      console.log('[useRapports] Récupération historique rapports');
      await delay(300);
      const rapports = await rapportStorage.getAllRapports();
      return rapports.map(r => r.metadata);
    },
  });
};

/**
 * Hook pour récupérer un rapport spécifique par ID
 */
export const useRapport = (rapportId: string) => {
  return useQuery({
    queryKey: ['rapport', rapportId],
    queryFn: async (): Promise<RapportData | null> => {
      console.log('[useRapports] Recherche rapport:', rapportId);
      await delay(200);
      const entry = await rapportStorage.getRapport(rapportId);
      
      if (entry) {
        console.log('[useRapports] Rapport trouvé:', entry.rapport.metadata.titre);
        return entry.rapport;
      } else {
        console.warn('[useRapports] Rapport introuvable:', rapportId);
        return null;
      }
    },
    enabled: !!rapportId
  });
};

/**
 * Hook pour supprimer un rapport de l'historique
 */
export const useSupprimerRapport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rapportId: string): Promise<void> => {
      console.log('[useRapports] Suppression rapport:', rapportId);
      await delay(200);
      await rapportStorage.deleteRapport(rapportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports-historique'] });
    }
  });
};

/**
 * Hook pour vider l'historique
 */
export const useViderHistorique = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      console.log('[useRapports] Vidage historique');
      await delay(200);
      await rapportStorage.clearAllRapports();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports-historique'] });
    }
  });
};
