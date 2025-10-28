/**
 * API functions for Trip management
 * Currently mocked, will be replaced with real API calls to backend
 * 
 * Future endpoints:
 * - GET /api/trips?vehicule_id={vehiculeId}
 * - POST /api/trips
 * - PUT /api/trips/:id
 * - DELETE /api/trips/:id
 */

import { consolidateTripsWithTraceGps } from "@/lib/mockData";
import { Trip, TripInput } from "@/types/trip";

// Mock data
const MOCK_TRIPS: Trip[] = consolidateTripsWithTraceGps();

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all trips for a specific vehicle
 * Future: GET /api/trips?vehicule_id={vehiculeId}
 */
export async function fetchTrips(vehiculeId: string): Promise<Trip[]> {
  await delay(500); // Simulate network latency
  
  // TODO: Replace with real API call
  // const response = await fetch(`/api/trips?vehicule_id=${vehiculeId}`);
  // if (!response.ok) throw new Error('Failed to fetch trips');
  // return response.json();
  
  return MOCK_TRIPS.filter(trip => trip.vehicule_id === vehiculeId);
}

/**
 * Create a new trip
 * Future: POST /api/trips
 */
export async function createTrip(data: TripInput): Promise<Trip> {
  await delay(800); // Simulate network latency
  
  // TODO: Replace with real API call
  // const response = await fetch('/api/trips', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error('Failed to create trip');
  // return response.json();
  
  const newTrip: Trip = {
    ...data,
    id: `T-${Date.now()}`,
    created_at: new Date().toISOString().split(".")[0],
  };
  
  MOCK_TRIPS.unshift(newTrip);
  return newTrip;
}

/**
 * Update an existing trip
 * Future: PUT /api/trips/:id
 */
export async function updateTrip(id: string, data: TripInput): Promise<Trip> {
  await delay(800); // Simulate network latency
  
  // TODO: Replace with real API call
  // const response = await fetch(`/api/trips/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error('Failed to update trip');
  // return response.json();
  
  const index = MOCK_TRIPS.findIndex(trip => trip.id === id);
  if (index === -1) throw new Error('Trip not found');
  
  const updatedTrip: Trip = {
    ...data,
    id,
    created_at: MOCK_TRIPS[index].created_at,
  };
  
  MOCK_TRIPS[index] = updatedTrip;
  return updatedTrip;
}

/**
 * Delete a trip
 * Future: DELETE /api/trips/:id
 */
export async function deleteTrip(id: string): Promise<void> {
  await delay(500); // Simulate network latency
  
  // TODO: Replace with real API call
  // const response = await fetch(`/api/trips/${id}`, {
  //   method: 'DELETE',
  // });
  // if (!response.ok) throw new Error('Failed to delete trip');
  
  const index = MOCK_TRIPS.findIndex(trip => trip.id === id);
  if (index === -1) throw new Error('Trip not found');
  
  MOCK_TRIPS.splice(index, 1);
}
