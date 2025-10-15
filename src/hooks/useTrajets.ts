import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trajet } from '@/types';
import { mockTrajets } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useTrajets = (vehiculeId?: string) => {
  return useQuery({
    queryKey: vehiculeId ? ['trajets', vehiculeId] : ['trajets'],
    queryFn: async (): Promise<Trajet[]> => {
      await delay(300);
      return vehiculeId 
        ? mockTrajets.filter(t => t.vehicule_id === vehiculeId)
        : mockTrajets;
    },
  });
};

export const useCreateTrajet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTrajet: Omit<Trajet, 'id'>): Promise<Trajet> => {
      await delay(500);
      const trajet = { ...newTrajet, id: `t${Date.now()}` };
      return trajet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trajets'] });
    },
  });
};
