import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plein } from '@/types';
import { OfflineService } from '@/lib/services/offlineService';
import { useOnlineStatus } from './useOnlineStatus';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const API_BASE_URL = '/api/pleins';

export const usePleins = (vehiculeId?: number) => {
  // const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: vehiculeId ? ['pleins', vehiculeId] : ['pleins'],
    queryFn: async (): Promise<Plein[]> => {
      // Combiner les données du backend (mockées) avec les données locales
      // await delay(300);
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');

      const data = await response.json();
      const serverPleins = vehiculeId 
        ? data.filter(p => p.vehicule_id === vehiculeId)
        : data;
      
      // Ajouter les pleins stockés localement (hors-ligne)
      const offlinePleins = OfflineService.getPleinsOffline();
      const filteredOfflinePleins = vehiculeId
        ? offlinePleins.filter(p => p.vehicule_id === vehiculeId)
        : offlinePleins;
      
      return [...serverPleins, ...filteredOfflinePleins];
    },
  });
};

// src/hooks/usePleins.ts
export const useCreatePlein = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (newPlein: Omit<Plein, 'id'>): Promise<Plein> => {
      if (!isOnline) {
        const tempId = OfflineService.savePleinOffline(newPlein);
        return { ...newPlein, id: tempId } as Plein;
      }

      const formData = new FormData();
      Object.entries(newPlein).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      if (newPlein.photo_bon instanceof File) {
        formData.append('photo_bon', newPlein.photo_bon);
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const err = new Error(error.error || 'Erreur serveur');
        (err as any).details = error; // On garde les détails
        throw err;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pleins'] });
    },
  });
};