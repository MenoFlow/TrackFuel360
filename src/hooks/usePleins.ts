import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plein } from '@/types';
import { mockPleins } from '@/lib/mockData';
import { OfflineService } from '@/lib/services/offlineService';
import { useOnlineStatus } from './useOnlineStatus';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePleins = (vehiculeId?: string) => {
  const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: vehiculeId ? ['pleins', vehiculeId] : ['pleins'],
    queryFn: async (): Promise<Plein[]> => {
      // Combiner les données du backend (mockées) avec les données locales
      await delay(300);
      const serverPleins = vehiculeId 
        ? mockPleins.filter(p => p.vehicule_id === vehiculeId)
        : mockPleins;
      
      // Ajouter les pleins stockés localement (hors-ligne)
      const offlinePleins = OfflineService.getPleinsOffline();
      const filteredOfflinePleins = vehiculeId
        ? offlinePleins.filter(p => p.vehicule_id === vehiculeId)
        : offlinePleins;
      
      return [...serverPleins, ...filteredOfflinePleins];
    },
  });
};

export const useCreatePlein = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  return useMutation({
    mutationFn: async (newPlein: Omit<Plein, 'id'>): Promise<Plein> => {
      if (!isOnline) {
        // Mode hors-ligne : sauvegarder localement
        console.log('📴 Offline mode: saving plein locally');
        const tempId = OfflineService.savePleinOffline(newPlein);
        return { ...newPlein, id: tempId } as Plein;
      }

      // Mode en ligne : envoyer au backend (simulé pour l'instant)
      await delay(500);
      const plein = { ...newPlein, id: `p${Date.now()}` };
      
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch('/api/pleins', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newPlein),
      // });
      // return await response.json();
      
      return plein;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pleins'] });
    },
  });
};