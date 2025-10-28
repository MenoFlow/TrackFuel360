import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Site } from '@/types';
import { mockSites } from '@/lib/data/mockData.base';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSites = () => {
  return useQuery({
    queryKey: ['sites'],
    queryFn: async (): Promise<Site[]> => {
      await delay(300);
      return mockSites;
    },
  });
};

export const useSite = (id: string) => {
  return useQuery({
    queryKey: ['sites', id],
    queryFn: async (): Promise<Site | undefined> => {
      await delay(200);
      return mockSites.find(s => s.id === id);
    },
    enabled: !!id,
  });
};

export const useCreateSite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSite: Omit<Site, 'id'>): Promise<Site> => {
      await delay(500);
      const site = { ...newSite, id: `s${Date.now()}` };
      return site;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
};

export const useUpdateSite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Site> }): Promise<Site> => {
      await delay(500);
      const site = mockSites.find(s => s.id === id);
      if (!site) throw new Error('Site non trouvé');
      return { ...site, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
};

export const useDeleteSite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await delay(500);
      const index = mockSites.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Site non trouvé');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
};
