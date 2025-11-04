import { useQuery } from '@tanstack/react-query';
import { PleinExifMetadata } from '@/types';
import { mockPleinExifMetadata } from '@/lib/data/mockData.fuel';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePleinMetadata = (pleinId?: number) => {
  return useQuery({
    queryKey: pleinId ? ['plein-metadata', pleinId] : ['plein-metadata'],
    queryFn: async (): Promise<PleinExifMetadata | PleinExifMetadata[] | null> => {
      await delay(200);
      if (pleinId) {
        return mockPleinExifMetadata.find(m => m.plein_id === pleinId) || null;
      }
      return mockPleinExifMetadata;
    },
    enabled: pleinId !== undefined,
  });
};

export const useAllPleinMetadata = () => {
  return useQuery({
    queryKey: ['plein-metadata'],
    queryFn: async (): Promise<PleinExifMetadata[]> => {
      await delay(200);
      return mockPleinExifMetadata;
    },
  });
};
