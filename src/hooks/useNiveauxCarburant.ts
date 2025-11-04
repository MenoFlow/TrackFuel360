import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NiveauCarburant } from '@/types';
import { mockNiveauxCarburant } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useNiveauxCarburant = (vehiculeId?: number) => {
  return useQuery({
    queryKey: vehiculeId ? ['niveaux-carburant', vehiculeId] : ['niveaux-carburant'],
    queryFn: async (): Promise<NiveauCarburant[]> => {
      await delay(300);
      return vehiculeId 
        ? mockNiveauxCarburant.filter(n => n.vehicule_id === vehiculeId)
        : mockNiveauxCarburant;
    },
  });
};

export const useCreateNiveauCarburant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newNiveau: Omit<NiveauCarburant, 'id'>): Promise<NiveauCarburant> => {
      await delay(500);
      const niveau = { ...newNiveau, id: Date.now() };
      return niveau;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['niveaux-carburant'] });
    },
  });
};

export const useNiveauxCarburantByTrajet = (trajetId: number) => {
  return useQuery({
    queryKey: ['niveaux-carburant', 'trajet', trajetId],
    queryFn: async (): Promise<NiveauCarburant[]> => {
      await delay(300);
      return mockNiveauxCarburant.filter(n => n.trajet_id === trajetId);
    },
  });
};

export const useNiveauxCarburantByPlein = (pleinId: number) => {
  return useQuery({
    queryKey: ['niveaux-carburant', 'plein', pleinId],
    queryFn: async (): Promise<NiveauCarburant[]> => {
      await delay(300);
      return mockNiveauxCarburant.filter(n => n.plein_id === pleinId);
    },
  });
};
