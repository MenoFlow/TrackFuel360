import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Correction, CorrectionStatus } from '@/types';
import { mockCorrections } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCorrections = (status?: CorrectionStatus) => {
  return useQuery({
    queryKey: status ? ['corrections', status] : ['corrections'],
    queryFn: async (): Promise<Correction[]> => {
      await delay(300);
      return status 
        ? mockCorrections.filter(c => c.status === status)
        : mockCorrections;
    },
  });
};

export const useCreateCorrection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCorrection: Omit<Correction, 'id' | 'requested_at'>): Promise<Correction> => {
      await delay(500);
      const correction = { 
        ...newCorrection, 
        id: Date.now(),
        requested_at: new Date().toISOString()
      };
      return correction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });
};

export const useValidateCorrection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, validated_by }: { 
      id: number; 
      validated_by: number;
    }): Promise<Correction> => {
      await delay(500);
      const correction = mockCorrections.find(c => c.id === id);
      if (!correction) throw new Error('Correction non trouvée');
      return { 
        ...correction, 
        status: 'validated',
        validated_by,
        validated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });
};

export const useRejectCorrection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, validated_by }: { 
      id: number; 
      validated_by: number;
    }): Promise<Correction> => {
      await delay(500);
      const correction = mockCorrections.find(c => c.id === id);
      if (!correction) throw new Error('Correction non trouvée');
      return { 
        ...correction, 
        status: 'rejected',
        validated_by,
        validated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });
};
