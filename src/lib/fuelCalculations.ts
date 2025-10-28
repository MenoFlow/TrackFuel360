import { Vehicule, FuelStatus } from '@/types';

import { getTripsByVehicleId } from "./mockData";
import { getPleinsByVehiculeId } from "./mockData";

// Structure pour combiner toutes les données d'un véhicule
export interface VehicleWithData extends Vehicule {
  trajets: Array<{
    id: string;
    date_debut: string;
    date_fin: string;
    distance_km: number;
  }>;
  pleins?: Array<{
    id: string;
    date: string;
    litres: number;
  }>;
}

// Calcul du carburant restant en tenant compte des trajets ET des ravitaillements
export const calculateFuelRemaining = (vehicle: Vehicule): number => {
  const trajets = getTripsByVehicleId(vehicle.immatriculation);
  const pleins = getPleinsByVehiculeId(vehicle.immatriculation);
  
  // Carburant de départ
  let fuelRemaining = vehicle.carburant_initial || 0;
  
  // Soustraire la consommation des trajets
  const totalDistance = trajets.reduce((sum, trip) => sum + trip.distance_km, 0);
  const fuelConsumed = (vehicle.consommation_nominale / 100) * totalDistance;
  fuelRemaining -= fuelConsumed;
  
  // Ajouter les ravitaillements
  const totalRefueled = pleins.reduce((sum, plein) => sum + plein.litres, 0);
  fuelRemaining += totalRefueled;
  
  // Ne peut pas être négatif ou dépasser la capacité du réservoir
  return Math.max(0, Math.min(fuelRemaining, vehicle.capacite_reservoir));
};

export const calculateAutonomy = (vehicle: Vehicule): number => {
  const fuelRemaining = calculateFuelRemaining(vehicle);
  return (fuelRemaining / vehicle.consommation_nominale) * 100;
};

export const getFuelLevel = (vehicle: Vehicule): number => {
  const fuelRemaining = calculateFuelRemaining(vehicle);
  return (fuelRemaining / vehicle.capacite_reservoir) * 100;
};

export const getFuelStatus = (vehicle: Vehicule): 'critical' | 'low' | 'medium' | 'high' => {
  const fuelLevel = getFuelLevel(vehicle);
  const fuelRemaining = calculateFuelRemaining(vehicle);
  
  if (fuelRemaining < 10 || fuelLevel < 15) return 'critical';
  if (fuelLevel < 30) return 'low';
  if (fuelLevel < 60) return 'medium';
  return 'high';
};

// Convertir un véhicule en VehicleWithData pour compatibilité
export const vehicleToVehicleWithData = (vehicle: Vehicule): VehicleWithData => {
  const trajets = getTripsByVehicleId(vehicle.immatriculation);
  const pleins = getPleinsByVehiculeId(vehicle.immatriculation);
  
  return {
    ...vehicle,
    trajets: trajets.map(t => ({
      id: t.id,
      date_debut: t.date_debut,
      date_fin: t.date_fin,
      distance_km: t.distance_km
    })),
    pleins: pleins.map(p => ({
      id: p.id,
      date: p.date,
      litres: p.litres
    }))
  };
};

// Obtenir tous les véhicules avec leurs données
export const getAllVehiclesWithData = (vehicles: Vehicule[]): VehicleWithData[] => {
  return vehicles.map(vehicleToVehicleWithData);
};

// export function calculateFuelPercentage(vehicle: Vehicule): number {
//   return (vehicle.niveau_carburant_actuel / vehicle.capacite_reservoir) * 100;
// }

export function getFuelStatusColor(status: FuelStatus): string {
  switch (status) {
    case 'critical': return '#ef4444';
    case 'low': return '#f97316';
    case 'medium': return '#eab308';
    case 'high': return '#22c55e';
    default: return '#6b7280';
  }
}

export function getFuelStatusLabel(status: FuelStatus): string {
  switch (status) {
    case 'critical': return 'Critique';
    case 'low': return 'Faible';
    case 'medium': return 'Moyen';
    case 'high': return 'Normal';
    default: return 'Inconnu';
  }
}
