import { useState, useEffect } from 'react';
import { User } from '@/types';

export const useChauffeurAccess = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('Erreur de parsing user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const isAuthenticated = !!currentUser;
  const isDriver = currentUser?.role === 'driver';
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isAuditor = currentUser?.role === 'auditor';

  // Filtre les données pour ne retourner que celles du chauffeur
  const filterDataForDriver = <T extends { chauffeur_id?: string }>(data: T[]): T[] => {
    if (!isDriver || !currentUser) return data;
    return data.filter(item => item.chauffeur_id === currentUser.id);
  };

  const isTodayBetween = (dateDebut: string, dateFin: string): boolean => {
    const today = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
  
    return today >= debut && today <= fin;
  };
  

  // Filtre les véhicules assignés au chauffeur
  const filterVehiculesForDriver = <T extends { id: string }>(
    vehicules: T[],
    affectations: Array<{ vehicule_id: string; chauffeur_id: string; date_debut: string; date_fin: string }>
  ): T[] => {
    if (!isDriver || !currentUser) return vehicules;
    
    const assignedVehicleIds = affectations
    .filter(a =>
      a.chauffeur_id === currentUser.id &&
      isTodayBetween(a.date_debut, a.date_fin)
    )
    .map(a => a.vehicule_id);
    return vehicules.filter(v => assignedVehicleIds.includes(v.id));
  };

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    isDriver,
    isAdmin,
    isManager,
    isSupervisor,
    isAuditor,
    logout,
    filterDataForDriver,
    filterVehiculesForDriver,
  };
};
