/**
 * React Query hooks for Trip management
 * These hooks manage the state and caching of trip data
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTrips, createTrip, updateTrip, deleteTrip } from "@/api/tripsApi";
import { Trip, TripInput } from "@/types/trip";
import { toast } from "sonner";
import i18n from "@/i18n/config";

/**
 * Hook to fetch trips for a specific vehicle
 * Automatically refetches when vehiculeId changes
 */
export function useTrips(vehiculeId: string) {
  return useQuery({
    queryKey: ["trips", vehiculeId],
    queryFn: () => fetchTrips(vehiculeId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

/**
 * Hook to create a new trip
 * Automatically invalidates the trips cache on success
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TripInput) => createTrip(data),
    onSuccess: (newTrip) => {
      // Invalidate and refetch trips for this vehicle
      queryClient.invalidateQueries({ queryKey: ["trips", newTrip.vehicule_id] });
      
      toast.success(i18n.t('trips.created'), {
        description: `${i18n.t('trips.trip')} ${newTrip.id} - ${newTrip.distance_km} ${i18n.t('trips.km')}`,
      });
    },
    onError: (error: Error) => {
      toast.error(i18n.t('trips.errorCreate'), {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing trip
 * Automatically invalidates the trips cache on success
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TripInput }) => 
      updateTrip(id, data),
    onSuccess: (updatedTrip) => {
      // Invalidate and refetch trips for this vehicle
      queryClient.invalidateQueries({ queryKey: ["trips", updatedTrip.vehicule_id] });
      
      toast.success(i18n.t('trips.updated'), {
        description: `${i18n.t('trips.trip')} ${updatedTrip.id} - ${updatedTrip.distance_km} ${i18n.t('trips.km')}`,
      });
    },
    onError: (error: Error) => {
      toast.error(i18n.t('trips.errorUpdate'), {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a trip
 * Automatically invalidates the trips cache on success
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vehiculeId }: { id: string; vehiculeId: string }) => 
      deleteTrip(id),
    onSuccess: (_, variables) => {
      // Invalidate and refetch trips for this vehicle
      queryClient.invalidateQueries({ queryKey: ["trips", variables.vehiculeId] });
      
      toast.success(i18n.t('trips.deleted'));
    },
    onError: (error: Error) => {
      toast.error(i18n.t('trips.errorDelete'), {
        description: error.message,
      });
    },
  });
}
