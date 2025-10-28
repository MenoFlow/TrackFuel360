import { Parametre, parametresData } from "@/lib/data/mockData.parametres";

// Simule un délai réseau pour les tests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// URL de base de l'API - À configurer selon l'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Service API pour la gestion des paramètres
 * 
 * BACKEND INTEGRATION:
 * Ces fonctions utilisent actuellement des données mockées.
 * Pour connecter au backend Node.js/Express, il suffit de:
 * 1. Décommenter les appels fetch()
 * 2. Commenter les sections "MOCK DATA"
 * 3. Configurer VITE_API_URL dans .env
 */

/**
 * Récupère tous les paramètres
 * 
 * FUTURE API CALL:
 * GET /api/params
 * Response: { data: Parametre[] }
 */
export const fetchParametres = async (): Promise<Parametre[]> => {
  // MOCK DATA - Remplacer par l'appel API réel
  await delay(500);
  return parametresData;

  /* BACKEND INTEGRATION - Décommenter pour utiliser le vrai backend:
  
  try {
    const response = await fetch(`${API_BASE_URL}/params`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter token d'authentification si nécessaire:
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    throw error;
  }
  */
};

/**
 * Met à jour un paramètre individuel
 * 
 * FUTURE API CALL:
 * PUT /api/params/:id
 * Body: { valeur: number }
 * Response: { data: Parametre, message: string }
 */
export const updateParametre = async (id: string, valeur: number): Promise<Parametre> => {
  // MOCK DATA - Remplacer par l'appel API réel
  await delay(500);
  
  // Simulation de la mise à jour d'un seul paramètre
  const param = parametresData.find(p => p.id === id);
  if (!param) {
    throw new Error(`Paramètre ${id} introuvable`);
  }
  
  return { ...param, valeur };

  /* BACKEND INTEGRATION - Décommenter pour utiliser le vrai backend:
  
  try {
    const response = await fetch(`${API_BASE_URL}/params/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter token d'authentification si nécessaire:
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ valeur }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre:', error);
    throw error;
  }
  */
};

/**
 * Sauvegarde tous les paramètres modifiés (mise à jour en masse)
 * 
 * FUTURE API CALL:
 * PUT /api/params
 * Body: { parametres: Parametre[] }
 * Response: { data: Parametre[], message: string }
 */
export const saveParametres = async (parametres: Parametre[]): Promise<Parametre[]> => {
  // MOCK DATA - Remplacer par l'appel API réel
  await delay(800);
  return parametres;

  /* BACKEND INTEGRATION - Décommenter pour utiliser le vrai backend:
  
  try {
    const response = await fetch(`${API_BASE_URL}/params`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter token d'authentification si nécessaire:
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ parametres }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
    throw error;
  }
  */
};

/**
 * Réinitialise les paramètres aux valeurs par défaut
 * 
 * FUTURE API CALL:
 * POST /api/params/reset
 * Response: { data: Parametre[], message: string }
 */
export const resetParametres = async (): Promise<Parametre[]> => {
  // MOCK DATA - Remplacer par l'appel API réel
  await delay(500);
  return parametresData;

  /* BACKEND INTEGRATION - Décommenter pour utiliser le vrai backend:
  
  try {
    const response = await fetch(`${API_BASE_URL}/params/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter token d'authentification si nécessaire:
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error);
    throw error;
  }
  */
};
