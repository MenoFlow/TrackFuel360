import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plein } from '@/types';
import { mockPleins } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePleins = (vehiculeId?: string) => {
  return useQuery({
    queryKey: vehiculeId ? ['pleins', vehiculeId] : ['pleins'],
    queryFn: async (): Promise<Plein[]> => {
      await delay(300);
      return vehiculeId 
        ? mockPleins.filter(p => p.vehicule_id === vehiculeId)
        : mockPleins;
    },
  });
};

export const useCreatePlein = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPlein: Omit<Plein, 'id'>): Promise<Plein> => {
      await delay(500);
      const plein = { ...newPlein, id: `p${Date.now()}` };
      return plein;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pleins'] });
    },
  });
};