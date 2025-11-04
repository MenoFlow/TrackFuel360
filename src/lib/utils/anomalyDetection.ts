// Système de détection d'anomalies et génération d'alertes
import { Vehicule, Plein, Trajet, NiveauCarburant, Geofence, Alerte, AlerteType, PleinExifMetadata } from '@/types';
import { haversineDistance, isPointInGeofence } from './geolocation';

/**
 * Détecte si un plein est effectué hors zone autorisée
 */
export function detectPleinHorsZone(
  plein: Plein,
  stationsAutorisees: Array<{ id: number; nom: string; lat: number; lon: number; rayon_metres: number }>,
  vehicule: Vehicule
): Alerte | null {
  if (!plein.latitude || !plein.longitude) return null;
  
  const lat = plein.latitude;
  const lon = plein.longitude;
  
  // Vérifier si le plein est dans une station autorisée
  const dansZoneAutorisee = stationsAutorisees.some(station =>
    isPointInGeofence(lat, lon, station.lat, station.lon, station.rayon_metres)
  );
  
  if (!dansZoneAutorisee) {
    // Trouver la station la plus proche pour contexte
    let distanceMin = Infinity;
    let stationProche = '';
    
    stationsAutorisees.forEach(station => {
      const dist = haversineDistance(lat, lon, station.lat, station.lon);
      if (dist < distanceMin) {
        distanceMin = dist;
        stationProche = station.nom;
      }
    });
    
    return {
      id: `alert_hz_${plein.id}`,
      vehicule_id: vehicule.id,
      chauffeur_id: plein.chauffeur_id,
      type: 'plein_hors_zone',
      titre: 'Plein effectué hors zone autorisée',
      description: `Plein à "${plein.station}" situé à ${distanceMin.toFixed(1)}km de la station autorisée la plus proche (${stationProche})`,
      score: Math.min(95, 60 + distanceMin * 2),
      severity: distanceMin > 50 ? 'high' : distanceMin > 20 ? 'medium' : 'low',
      status: 'new',
      date_detection: new Date(plein.date).toISOString(),
    };
  }
  
  return null;
}

/**
 * Détecte une surconsommation par rapport à la consommation nominale
 */
export function detectSurconsommation(
  vehicule: Vehicule,
  consommationMoyenne: number,
  periodeJours: number = 7
): Alerte | null {
  const seuil = vehicule.consommation_nominale * 1.3; // 30% au-dessus de la nominale
  
  if (consommationMoyenne > seuil) {
    const deviationPercent = ((consommationMoyenne - vehicule.consommation_nominale) / vehicule.consommation_nominale) * 100;
    
    return {
      id: `alert_conso_${vehicule.immatriculation}`,
      vehicule_id: vehicule.id,
      type: 'consommation_elevee',
      titre: 'Surconsommation détectée',
      description: `Consommation moyenne de ${consommationMoyenne.toFixed(1)} L/100km vs nominale ${vehicule.consommation_nominale} L/100km (+${deviationPercent.toFixed(0)}%)`,
      score: Math.min(95, 50 + deviationPercent),
      severity: deviationPercent > 40 ? 'high' : deviationPercent > 25 ? 'medium' : 'low',
      status: 'new',
      date_detection: new Date().toISOString(),
      deviation_percent: deviationPercent,
    };
  }
  
  return null;
}

/**
 * Détecte du carburant disparu après un plein
 */
export function detectCarburantDisparu(
  plein: Plein,
  niveauAvantPlein: number,
  niveauApresTrajet: number,
  consommationTheorique: number,
  distanceKm: number
): Alerte | null {
  const niveauAttendu = niveauAvantPlein + plein.litres;
  const niveauFinalAttendu = niveauAttendu - consommationTheorique;
  const litresManquants = niveauFinalAttendu - niveauApresTrajet;
  
  // Seuil de 5L pour tenir compte des imprécisions
  if (litresManquants > 5) {
    const deviationPercent = (litresManquants / niveauAttendu) * 100;
    
    return {
      id: `alert_vol_${plein.id}`,
      vehicule_id: plein.vehicule_id,
      chauffeur_id: plein.chauffeur_id,
      type: 'carburant_disparu',
      titre: 'Carburant disparu après plein',
      description: `Plein de ${plein.litres}L effectué mais niveau final incohérent. Attendu: ${niveauFinalAttendu.toFixed(1)}L, Mesuré: ${niveauApresTrajet.toFixed(1)}L`,
      score: Math.min(98, 70 + deviationPercent),
      severity: litresManquants > 30 ? 'high' : litresManquants > 15 ? 'medium' : 'low',
      status: 'new',
      date_detection: new Date(plein.date).toISOString(),
      litres_manquants: litresManquants,
      deviation_percent: deviationPercent,
    };
  }
  
  return null;
}

/**
 * Détecte les métadonnées EXIF suspectes
 */
export function detectExifSuspect(
  plein: Plein,
  exifMetadata: PleinExifMetadata | undefined,
  seuilHeures: number = 2
): Alerte | null {
  if (!exifMetadata || !plein.latitude || !plein.longitude) return null;
  
  const datePlein = new Date(plein.date);
  const dateExif = new Date(`${exifMetadata.date}T${exifMetadata.heure}`);
  
  const ecartHeures = Math.abs(datePlein.getTime() - dateExif.getTime()) / (1000 * 60 * 60);
  
  // Vérifier écart de localisation
  const latPlein = plein.latitude;
  const lonPlein = plein.longitude;
  const latExif = exifMetadata.latitude;
  const lonExif = exifMetadata.longitude;
  const ecartDistanceKm = haversineDistance(latPlein, lonPlein, latExif, lonExif);
  
  if (ecartHeures > seuilHeures || ecartDistanceKm > 1) {
    let suspicionReason = '';
    if (ecartHeures > seuilHeures) {
      suspicionReason = `Photo prise ${ecartHeures.toFixed(1)}h ${ecartHeures > 0 ? 'avant' : 'après'} le plein déclaré`;
    }
    if (ecartDistanceKm > 1) {
      suspicionReason += (suspicionReason ? ' et ' : '') + `Localisation photo à ${ecartDistanceKm.toFixed(1)}km du plein`;
    }
    
    return {
      id: `alert_exif_${plein.id}`,
      vehicule_id: plein.vehicule_id,
      chauffeur_id: plein.chauffeur_id,
      type: 'plein_suspect',
      titre: 'Validation EXIF suspecte',
      description: `Les métadonnées EXIF de la photo ne correspondent pas aux données déclarées`,
      score: Math.min(95, 70 + ecartHeures * 5 + ecartDistanceKm * 10),
      severity: (ecartHeures > 4 || ecartDistanceKm > 5) ? 'high' : 'medium',
      status: 'new',
      date_detection: new Date(plein.date).toISOString(),
    };
  }
  
  return null;
}

/**
 * Détecte une immobilisation anormale hors dépôt
 */
export function detectImmobilisationAnormale(
  vehicule: Vehicule,
  position: [number, number],
  dureeHeures: number,
  depots: Array<{ id: number; nom: string; lat: number; lon: number; rayon_metres: number }>,
  seuilHeures: number = 12
): Alerte | null {
  if (dureeHeures < seuilHeures) return null;
  
  const [lat, lon] = position;
  const dansDepot = depots.some(depot =>
    isPointInGeofence(lat, lon, depot.lat, depot.lon, depot.rayon_metres)
  );
  
  if (!dansDepot) {
    return {
      id: `alert_immob_${vehicule.immatriculation}_${Date.now()}`,
      vehicule_id: vehicule.id,
      type: 'immobilisation_anormale',
      titre: 'Immobilisation prolongée hors dépôt',
      description: `Véhicule immobilisé ${dureeHeures.toFixed(1)}h en dehors d'un dépôt autorisé`,
      score: Math.min(90, 50 + dureeHeures * 2),
      severity: dureeHeures > 48 ? 'high' : dureeHeures > 24 ? 'medium' : 'low',
      status: 'new',
      date_detection: new Date().toISOString(),
    };
  }
  
  return null;
}
