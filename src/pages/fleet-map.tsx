import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { divIcon, LatLng } from "leaflet";
import { Vehicule, Trajet } from "@/types";
import { getFuelStatus, calculateFuelRemaining } from "@/lib/fuelCalculations";
import { getTripsByVehicleId } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Navigation, Route, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";


interface FleetMapProps {
  vehicles: Vehicule[];
  onVehicleSelect?: (vehicle: Vehicule) => void;
}

interface VehicleWithPosition extends Vehicule {
  position: [number, number];
}

// Fonction pour obtenir une position aléatoire à Madagascar (pour la démo)
const getRandomMadagascarPosition = (): [number, number] => {
  const latitude = -18.766947 + (Math.random() - 0.5) * 10;
  const lng = 46.869107 + (Math.random() - 0.5) * 8;
  return [latitude, lng];
};

// Générer des points GPS pour simuler un trajet
const generateGpsTrace = (startPos: [number, number], distance_km: number): Array<{latitude: number, longitude: number}> => {
  const points: Array<{latitude: number, longitude: number}> = [];
  const numPoints = Math.max(5, Math.floor(distance_km / 5)); // Un point tous les 5km
  
  points.push({ latitude: startPos[0], longitude: startPos[1] });
  
  let currentLat = startPos[0];
  let currentLon = startPos[1];
  
  for (let i = 1; i < numPoints; i++) {
    // Petits déplacements aléatoires
    currentLat += (Math.random() - 0.5) * 0.02;
    currentLon += (Math.random() - 0.5) * 0.02;
    points.push({ latitude: currentLat, longitude: currentLon });
  }
  
  return points;
};

// Créer des icônes personnalisées selon le statut de carburant
const createCustomIcon = (status: string) => {
  const color = status === 'critical' ? '#ef4444' : 
                status === 'low' ? '#f97316' : 
                status === 'medium' ? '#eab308' : '#22c55e';
  
  return divIcon({
    html: `
      <div style="
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        background-color: ${color}; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Créer une icône pour les points d'arrêt
const createStopIcon = () => {
  return divIcon({
    html: `
      <div style="
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        background-color:rgb(246, 59, 131); 
        border: 2px solid white; 
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};
// Créer une icône pour les points d'arrêt
const createStartIcon = () => {
  return divIcon({
    html: `
      <div style="
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        background-color: #3b82f6; 
        border: 2px solid white; 
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

// Obtenir la couleur de la polyline selon le statut carburant
const getPolylineColor = (status: string) => {
  switch (status) {
    case 'critical': return '#ef4444';
    case 'low': return '#f97316';
    case 'medium': return '#eab308';
    default: return '#22c55e';
  }
};

export const FleetMap: React.FC<FleetMapProps> = ({ vehicles, onVehicleSelect }) => {
  const [selectedVehicle, setSelectedVehicle] = React.useState<VehicleWithPosition | null>(null);
  const [showTrips, setShowTrips] = React.useState(false);
  const [vehicleTrips, setVehicleTrips] = React.useState<Trajet[]>([]);

  const vehiclesWithPositions = React.useMemo<VehicleWithPosition[]>(() => 
    vehicles.map(vehicle => ({
      ...vehicle,
      position: getRandomMadagascarPosition()
    })),
    [vehicles]
  );

  const mapCenter: LatLngExpression = [-18.8792, 47.5079];

  const handleVehicleClick = (vehicle: VehicleWithPosition) => {
    setSelectedVehicle(vehicle);
    setShowTrips(false);
  };

  const handleShowTrips = () => {
    if (selectedVehicle) {
      const trips = getTripsByVehicleId(selectedVehicle.id);
      // Ajouter des traces GPS simulées si elles n'existent pas
      const tripsWithGps = trips.map(trip => {
        if (!trip.traceGps || trip.traceGps.length === 0) {
          return {
            ...trip,
            traceGps: generateGpsTrace(selectedVehicle.position, trip.distance_km)
          };
        }
        return trip;
      });
      setVehicleTrips(tripsWithGps);
      setShowTrips(true);
    }
  };


  return (
    <Card className="rounded-2xl overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="h-[500px] relative">
          <MapContainer
            center={mapCenter}
            zoom={6}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Afficher les véhicules */}
            {vehiclesWithPositions.map((vehicle) => {
              const fuelStatus = getFuelStatus(vehicle);
              const remainingFuel = calculateFuelRemaining(vehicle);
              const autonomy = remainingFuel / vehicle.consommation_nominale * 100;
              const tripsData = getTripsByVehicleId(vehicle.id);

              // Sélection du dernier trajet
              const lastTrip = tripsData && tripsData.length > 0 ? tripsData[tripsData.length - 1] : null;

              // Récupération du dernier point GPS
              const lastPosition =
                lastTrip?.traceGps && lastTrip.traceGps.length > 0
                  ? lastTrip.traceGps[lastTrip.traceGps.length - 1]
                  : null;

              // Exemple d'utilisation
              if (lastPosition) {
                return (
                  <Marker
                    key={vehicle.id}
                    position={
                      lastPosition ? [lastPosition.latitude, lastPosition.longitude] : [0, 0]
                    }
                    icon={createCustomIcon(fuelStatus)}
                    eventHandlers={{
                      click: () => handleVehicleClick(vehicle),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px] p-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-base">{vehicle.marque}</h3>
                          <Badge 
                            variant={fuelStatus === 'critical' ? 'destructive' : 'secondary'}
                            className="ml-2"
                          >
                            {fuelStatus === 'critical' ? 'Critique' : 
                             fuelStatus === 'low' ? 'Faible' : 
                             fuelStatus === 'medium' ? 'Moyen' : 'Normal'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Immatriculation:</span>
                            <span className="font-medium">{vehicle.immatriculation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{remainingFuel.toFixed(1)}L</span>
                            <span className="text-muted-foreground">/ {vehicle.capacite_reservoir}L</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{autonomy.toFixed(0)} km</span>
                            <span className="text-muted-foreground">autonomie</span>
                          </div>
                        </div>
  
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onVehicleSelect?.(vehicle)}
                            className="flex-1"
                          >
                            Détails
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleShowTrips}
                            className="flex-1"
                          >
                            <Route className="h-4 w-4 mr-1" />
                            Trajets
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              
            })}

            {/* Afficher les trajets si activé */}
            {showTrips && selectedVehicle && vehicleTrips.map((trip, idx) => {
              const fuelStatus = getFuelStatus(selectedVehicle);
              const color = getPolylineColor(fuelStatus);
              
              if (!trip.traceGps || trip.traceGps.length === 0) {
                return null
              };

              const endPoints = [];

              for (let i = 1; i < trip.traceGps.length; i++) {
                const current = trip.traceGps[i];
              
                // Si la sequence revient à 1, le point précédent est une fin de trajet
                if (current.sequence === 1) {
                  const previous = trip.traceGps[i - 1];
                  endPoints.push({
                    latitude: previous.latitude,
                    longitude: previous.longitude,
                  });
                }
              }
              
              // Ajouter le dernier point uniquement s’il n’a pas déjà été ajouté
              const lastPoint = trip.traceGps[trip.traceGps.length - 1];
              const alreadyIncluded = endPoints.some(
                (pt) =>
                  pt.latitude === lastPoint.latitude &&
                  pt.longitude === lastPoint.longitude
              );
              
              if (!alreadyIncluded) {
                endPoints.push({
                  latitude: lastPoint.latitude,
                  longitude: lastPoint.longitude,
                });
              }
              
              const startPoint = trip.traceGps[0];
              
              const positions: LatLngExpression[] = trip.traceGps.map(point => [point.latitude, point.longitude]);
              // const endPoint = trip.traceGps[trip.traceGps.length - 1];

                return (
                  <React.Fragment key={`trip-${trip.id}`}>
                    {/* Polyline du trajet */}
                    <Polyline
                      positions={positions}
                      pathOptions={{
                        color: color,
                        weight: 3,
                        opacity: 0.7,
                      }}
                    />
                    {/* <Marker
                      key={`startPoint-${trip.id}-${new Date()}`}
                      position={[startPoint.latitude, startPoint.longitude]}
                      icon={createStartIcon()}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <h4 className="font-semibold text-sm">Point d'arrêt / depart</h4>
                          </div>
                          <div className="text-xs space-y-1">
                            <p><span className="text-muted-foreground">Trajet:</span> #{trip.id}</p>
                            <p><span className="text-muted-foreground">Distance:</span> {trip.distance_km} km</p>
                            <p><span className="text-muted-foreground">Fin:</span> {new Date(trip.date_fin).toLocaleString('fr-FR')}</p>
                          </div>
                        </div>
                      </Popup>
                    </Marker> */}
                    
                    {/* Point d'arrêt à la fin du trajet */}
                    {
                      endPoints.map((endPoint, i) => (
                        <Marker
                          key={`endpoint-${trip.id}-${i}`}
                          position={[endPoint.latitude, endPoint.longitude]}
                          icon={createStartIcon()}
                        >
                          <Popup>
                            <div className="p-2">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className={`h-4 w-4 text-red-500`} />
                                <h4 className="font-semibold text-sm">Point d'arrêt / depart</h4>
                              </div>
                              <div className="text-xs space-y-1">
                                <p><span className="text-muted-foreground">Trajet:</span> #{trip.id}</p>
                                <p><span className="text-muted-foreground">Distance:</span> {trip.distance_km} km</p>
                                <p><span className="text-muted-foreground">Fin:</span> {new Date(trip.date_fin).toLocaleString('fr-FR')}</p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))
                    }

                  </React.Fragment>
                );
            })}
          </MapContainer>
          
          {/* Légende */}
          <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
            <h4 className="text-xs font-semibold mb-2">État carburant</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Normal (&gt;60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Moyen (30-60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Faible (15-30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critique (&lt;15%)</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Point d'arrêt</span>
              </div>
            </div>
          </div>

          {/* Menu de sélection */}
          {selectedVehicle && (
            <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
              <h4 className="text-sm font-semibold mb-2">{selectedVehicle.marque}</h4>
              <p className="text-xs text-muted-foreground mb-3">{selectedVehicle.immatriculation}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowTrips(false);
                    onVehicleSelect?.(selectedVehicle);
                  }}
                  className="flex-1"
                >
                  Fiche détails
                </Button>
                <Button
                  size="sm"
                  variant={showTrips ? "default" : "outline"}
                  onClick={handleShowTrips}
                  className="flex-1"
                >
                  <Route className="h-4 w-4 mr-1" />
                  {showTrips ? "Masquer" : "Afficher"} trajets
                </Button>
              </div>
              {showTrips && (
                <p className="text-xs text-muted-foreground mt-2">
                  {vehicleTrips.length} trajet(s) affiché(s)
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};