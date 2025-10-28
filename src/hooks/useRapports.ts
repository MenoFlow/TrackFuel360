import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RapportType, RapportFilters, RapportData, RapportMetadata } from '@/types';
import { genererRapport } from '@/lib/services/rapportService';
import { mockVehicules, mockSites, mockUsers } from '@/lib/data/mockData.base';
import { mockTrajets } from '@/lib/data/mockData.trajectories';
import { mockPleins } from '@/lib/data/mockData.fuel';
import { mockAlertes } from '@/lib/mockData';
import { mockCorrections } from '@/lib/data/mockData.corrections';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Stockage local des rapports générés avec données complètes
let rapportsGeneres: RapportData[] = [];

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
      await delay(800); // Simulation génération
      
      const rapport = genererRapport(
        type,
        filtres,
        mockVehicules,
        mockTrajets,
        mockPleins,
        mockAlertes,
        mockCorrections,
        mockSites,
        currentUser
      );
      
      // Stocker le rapport complet (avec données) pour l'historique
      rapportsGeneres = [rapport, ...rapportsGeneres].slice(0, 50); // Max 50 rapports
      
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
      await delay(300);
      return rapportsGeneres.map(r => r.metadata);
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
      await delay(200);
      return rapportsGeneres.find(r => r.metadata.id === rapportId) || null;
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
      await delay(200);
      rapportsGeneres = rapportsGeneres.filter(r => r.metadata.id !== rapportId);
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
      await delay(200);
      rapportsGeneres = [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports-historique'] });
    }
  });
};
