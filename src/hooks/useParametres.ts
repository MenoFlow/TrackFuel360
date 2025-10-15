import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ParametresDetection } from '@/types';
import { mockParametresDetection } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useParametresDetection = () => {
  return useQuery({
    queryKey: ['parametres-detection'],
    queryFn: async (): Promise<ParametresDetection> => {
      await delay(300);
      return mockParametresDetection;
    },
  });
};

export const useUpdateParametresDetection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newParams: Partial<ParametresDetection>): Promise<ParametresDetection> => {
      await delay(500);
      const updatedParams = { ...mockParametresDetection, ...newParams };
      return updatedParams;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametres-detection'] });
      // Invalidate alertes as parameters affect alert generation
      queryClient.invalidateQueries({ queryKey: ['alertes'] });
    },
  });
};
