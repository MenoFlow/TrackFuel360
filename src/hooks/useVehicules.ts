import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vehicule } from '@/types';
import { mockVehicules } from '@/lib/mockData';

// Simulation d'API avec délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useVehicules = () => {
  return useQuery({
    queryKey: ['vehicules'],
    queryFn: async (): Promise<Vehicule[]> => {
      await delay(300);
      return mockVehicules;
    },
  });
};

export const useVehicule = (id: string) => {
  return useQuery({
    queryKey: ['vehicules', id],
    queryFn: async (): Promise<Vehicule | undefined> => {
      await delay(200);
      return mockVehicules.find(v => v.id === id);
    },
    enabled: !!id,
  });
};

export const useCreateVehicule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newVehicule: Omit<Vehicule, 'id'>): Promise<Vehicule> => {
      await delay(500);
      const vehicule = { ...newVehicule, id: `v${Date.now()}` };
      return vehicule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
    },
  });
};

export const useUpdateVehicule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehicule> }): Promise<Vehicule> => {
      await delay(500);
      const vehicule = mockVehicules.find(v => v.id === id);
      if (!vehicule) throw new Error('Véhicule non trouvé');
      return { ...vehicule, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
    },
  });
};