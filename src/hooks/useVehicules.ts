import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vehicule } from '@/types';
import { mockVehicules } from '@/lib/mockData';

// Simulation d'API avec délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Configuration
const API_BASE_URL = '/api/vehicules';

/**
 * Hook: useVehicules
 * API Endpoint: GET /api/vehicules
 * Description: Récupère la liste de tous les véhicules
 * Params: Aucun
 * Response: Vehicule[]
 */
export const useVehicules = () => {
  return useQuery({
    queryKey: ['vehicules'],
    queryFn: async (): Promise<Vehicule[]> => {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}`);
      // if (!response.ok) throw new Error('Erreur lors de la récupération des véhicules');
      // return response.json();
      
      await delay(300);
      return mockVehicules;
    },
  });
};

/**
 * Hook: useVehicule
 * API Endpoint: GET /api/vehicules/:id
 * Description: Récupère un véhicule spécifique par son ID
 * Params: id (string)
 * Response: Vehicule | undefined
 */
export const useVehicule = (id: string) => {
  return useQuery({
    queryKey: ['vehicules', id],
    queryFn: async (): Promise<Vehicule | undefined> => {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/${id}`);
      // if (!response.ok) throw new Error('Véhicule non trouvé');
      // return response.json();
      
      await delay(200);
      return mockVehicules.find(v => v.immatriculation === id);
    },
    enabled: !!id,
  });
};

/**
 * Hook: useCreateVehicule
 * API Endpoint: POST /api/vehicules
 * Description: Crée un nouveau véhicule
 * Body: Omit<Vehicule, 'id'>
 * Response: Vehicule
 */
export const useCreateVehicule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newVehicule: Omit<Vehicule, 'id'>): Promise<Vehicule> => {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newVehicule),
      // });
      // if (!response.ok) throw new Error('Erreur lors de la création du véhicule');
      // return response.json();
      
      await delay(500);
      const vehicule = { ...newVehicule, id: `v${Date.now()}` };
      return vehicule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
    },
  });
};

/**
 * Hook: useUpdateVehicule
 * API Endpoint: PUT /api/vehicules/:id
 * Description: Met à jour un véhicule existant
 * Params: id (string)
 * Body: Partial<Vehicule>
 * Response: Vehicule
 */
export const useUpdateVehicule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehicule> }): Promise<Vehicule> => {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('Erreur lors de la mise à jour du véhicule');
      // return response.json();
      
      await delay(500);
      const vehicule = mockVehicules.find(v => v.immatriculation === id);
      if (!vehicule) throw new Error('Véhicule non trouvé');
      return { ...vehicule, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
    },
  });
};