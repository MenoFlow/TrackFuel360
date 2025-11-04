import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Affectation } from '@/types';
import { mockAffectations } from '@/lib/data/mockData.base';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAffectations = (chauffeurId?: number, vehiculeId?: number) => {
  return useQuery({
    queryKey: chauffeurId 
      ? ['affectations', 'chauffeur', chauffeurId]
      : vehiculeId
      ? ['affectations', 'vehicule', vehiculeId]
      : ['affectations'],
    queryFn: async (): Promise<Affectation[]> => {
      await delay(300);
      if (chauffeurId) {
        return mockAffectations.filter(a => a.chauffeur_id === chauffeurId);
      }
      if (vehiculeId) {
        return mockAffectations.filter(a => a.vehicule_id === vehiculeId);
      }
      return mockAffectations;
    },
  });
};

export const useAffectation = (id: number) => {
  return useQuery({
    queryKey: ['affectations', id],
    queryFn: async (): Promise<Affectation | undefined> => {
      await delay(200);
      return mockAffectations.find(a => a.id === id);
    },
    enabled: !!id,
  });
};

export const useCreateAffectation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAffectation: Omit<Affectation, 'id'>): Promise<Affectation> => {
      await delay(500);
      const affectation = { ...newAffectation, id: Date.now() };
      return affectation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affectations'] });
    },
  });
};

export const useUpdateAffectation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Affectation> }): Promise<Affectation> => {
      await delay(500);
      const affectation = mockAffectations.find(a => a.id === id);
      if (!affectation) throw new Error('Affectation non trouvée');
      return { ...affectation, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affectations'] });
    },
  });
};

export const useDeleteAffectation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await delay(500);
      const index = mockAffectations.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Affectation non trouvée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affectations'] });
    },
  });
};
