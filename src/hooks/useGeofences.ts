import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Geofence } from '@/types';
import { mockGeofences } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useGeofences = (type?: 'depot' | 'station' | 'zone_risque') => {
  return useQuery({
    queryKey: type ? ['geofences', type] : ['geofences'],
    queryFn: async (): Promise<Geofence[]> => {
      await delay(300);
      return type 
        ? mockGeofences.filter(g => g.type === type)
        : mockGeofences;
    },
  });
};

export const useCreateGeofence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newGeofence: Omit<Geofence, 'id'>): Promise<Geofence> => {
      await delay(500);
      const geofence = { ...newGeofence, id: `g${Date.now()}` };
      return geofence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
    },
  });
};

export const useUpdateGeofence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<Geofence>;
    }): Promise<Geofence> => {
      await delay(500);
      const geofence = mockGeofences.find(g => g.id === id);
      if (!geofence) throw new Error('Geofence non trouvée');
      return { ...geofence, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
    },
  });
};

export const useDeleteGeofence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await delay(500);
      const index = mockGeofences.findIndex(g => g.id === id);
      if (index === -1) throw new Error('Geofence non trouvée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
    },
  });
};
