import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trajet } from '@/types';
import { mockTrajets } from '@/lib/mockData';
import { OfflineService } from '@/lib/services/offlineService';
import { useOnlineStatus } from './useOnlineStatus';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useTrajets = (vehiculeId?: number) => {
  const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: vehiculeId ? ['trajets', vehiculeId] : ['trajets'],
    queryFn: async (): Promise<Trajet[]> => {
      // Combiner les données du backend (mockées) avec les données locales
      await delay(300);
      const serverTrajets = vehiculeId 
        ? mockTrajets.filter(t => t.vehicule_id === vehiculeId)
        : mockTrajets;
      
      // Ajouter les trajets stockés localement (hors-ligne)
      const offlineTrajets = OfflineService.getTrajetsOffline();
      const filteredOfflineTrajets = vehiculeId
        ? offlineTrajets.filter(t => t.vehicule_id === vehiculeId)
        : offlineTrajets;
      
      return [...serverTrajets, ...filteredOfflineTrajets];
    },
  });
};

export const useCreateTrajet = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  return useMutation({
    mutationFn: async (newTrajet: Omit<Trajet, 'id'>): Promise<Trajet> => {
      if (!isOnline) {
        // Mode hors-ligne : sauvegarder localement
        console.log('📴 Offline mode: saving trajet locally');
        const tempId = OfflineService.saveTrajetOffline(newTrajet);
        return { ...newTrajet, id: tempId } as Trajet;
      }

      // Mode en ligne : envoyer au backend (simulé pour l'instant)
      await delay(500);
      const trajet = { ...newTrajet, id: Date.now() };
      
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch('/api/trajets', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTrajet),
      // });
      // return await response.json();
      
      return trajet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trajets'] });
    },
  });
};
