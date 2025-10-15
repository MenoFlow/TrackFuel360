import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alerte, AlerteStatus } from '@/types';
import { mockAlertes } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAlertes = (status?: AlerteStatus) => {
  return useQuery({
    queryKey: status ? ['alertes', status] : ['alertes'],
    queryFn: async (): Promise<Alerte[]> => {
      await delay(300);
      return status 
        ? mockAlertes.filter(a => a.status === status)
        : mockAlertes;
    },
  });
};

export const useUpdateAlerteStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, justification }: { 
      id: string; 
      status: AlerteStatus; 
      justification?: string;
    }): Promise<Alerte> => {
      await delay(500);
      const alerte = mockAlertes.find(a => a.id === id);
      if (!alerte) throw new Error('Alerte non trouvée');
      return { 
        ...alerte, 
        status, 
        justification,
        resolved_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertes'] });
    },
  });
};