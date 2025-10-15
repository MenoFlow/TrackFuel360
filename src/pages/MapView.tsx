import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { LatLngExpression } from "leaflet";
import { divIcon } from "leaflet";
import { Vehicule, Geofence } from "@/types";
import {mockVehicules,  mockGeofences } from "@/lib/mockData";
import { getFuelStatus, calculateFuelRemaining } from "@/lib/fuelCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fuel, Navigation, Plus, MapPin, Edit, X, CircleDot, Target, MoveDiagonal, MoveDiagonal2, Move, LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { MainLayout } from "@/components/Layout/MainLayout";
import ReactDOMServer from 'react-dom/server';
import * as L from 'leaflet';



interface VehicleWithPosition extends Vehicule {
  position: [number, number];
}

const getRandomMadagascarPosition = (): [number, number] => {
  const lat = -18.766947 + (Math.random() - 0.5) * 10;
  const lng = 46.869107 + (Math.random() - 0.5) * 8;
  return [lat, lng];
};

const createCustomIcon = (status: string) => {
  const color = status === 'critical' ? '#ef4444' : 
                status === 'low' ? '#f97316' : 
                status === 'medium' ? '#eab308' : '#22c55e';
  
  return divIcon({
    html: `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const getGeofenceColor = (type: Geofence['type']) => {
  switch (type) {
    case 'depot': return '#22c55e';
    case 'station': return '#3b82f6';
    case 'zone_risque': return '#ef4444';
    default: return '#6b7280';
  }
};

export default function MapView() {
  const [vehiclesWithPositions, setVehiclesWithPositions] = useState<VehicleWithPosition[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>(mockGeofences);
  const [newGeofenceType, setNewGeofenceType] = useState<Geofence['type']>('depot');
  const [newGeofenceName, setNewGeofenceName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const mapCenter: LatLngExpression = [-18.8792, 47.5079];

  useEffect(() => {
    // const initialPositions = mockVehicules.map(vehicle => ({
    //   ...vehicle,
    //   position: getRandomMadagascarPosition()
    // }));
    // setVehiclesWithPositions(initialPositions);

    // const interval = setInterval(() => {
    //   setVehiclesWithPositions(prev => 
    //     prev.map(vehicle => ({
    //       ...vehicle,
    //       position: [
    //         vehicle.position[0] + (Math.random() - 0.5) * 0.01,
    //         vehicle.position[1] + (Math.random() - 0.5) * 0.01
    //       ] as [number, number]
    //     }))
    //   );
    // }, 5000);

    // return () => clearInterval(interval);
  }, []);
  function calculateGeofenceCenterAndRadius(coords: [number, number][]): {
    lat: number;
    lon: number;
    rayon_metres: number;
  } {
    const lats = coords.map(c => c[1]);
    const lons = coords.map(c => c[0]);
    const lat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const lon = lons.reduce((a, b) => a + b, 0) / lons.length;
  
    const R = 6371000;
    const toRad = (deg: number) => deg * Math.PI / 180;
    const distances = coords.map(([lng, latCoord]) => {
      const dLat = toRad(latCoord - lat);
      const dLon = toRad(lng - lon);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(latCoord)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    });
  
    const rayon_metres = distances.reduce((a, b) => a + b, 0) / distances.length;
    return { lat, lon, rayon_metres };
  }
  
  const handleGeofenceCreated = (e: any) => {
    const { layerType, layer } = e;
  
    if (layerType === 'circle') {
      const center = layer.getLatLng(); // { lat, lng }
      const radius = layer.getRadius(); // en mètres
  
      (window as any).tempGeofenceData = {
        lat: center.lat,
        lon: center.lng,
        rayon_metres: radius,
      };
  
      setDialogOpen(true);
    }
  };
  
  

  // const handleGeofenceEdited = (e: any) => {
  //   const layers = e.layers;
  //   layers.eachLayer((layer: any) => {
  //     if (editingGeofence) {
  //       const coordinates = layer.getLatLngs()[0].map((latlng: any) => [latlng.lng, latlng.lat]);
  //       coordinates.push(coordinates[0]);
        
  //       setGeofences(prev => prev.map(g => 
  //         g.id === editingGeofence.id 
  //           ? { ...g, polygone: { coordinates } }
  //           : g
  //       ));
        
  //       toast({
  //         title: "Geofence modifiée",
  //         description: "Les coordonnées ont été mises à jour avec succès.",
  //       });
  //     }
  //   });
  // };
  const handleGeofenceEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      if (editingGeofence) {
        const coordinates = layer.getLatLngs()[0].map((latlng: any) => [latlng.lng, latlng.lat]);
        coordinates.push(coordinates[0]); // Ferme le polygone
  
        const { lat, lon, rayon_metres } = calculateGeofenceCenterAndRadius(coordinates);
  
        setGeofences(prev => prev.map(g =>
          g.id === editingGeofence.id
            ? { ...g, lat, lon, rayon_metres }
            : g
        ));
  
        toast({
          title: "Geofence modifiée",
          description: "Le centre et le rayon ont été mis à jour avec succès.",
        });
      }
    });
  };
  

  const handleGeofenceDeleted = (e: any) => {
    if (editingGeofence) {
      setGeofences(prev => prev.filter(g => g.id !== editingGeofence.id));
      setEditingGeofence(null);
      setSelectedGeofence(null);
      toast({
        title: "Geofence supprimée",
        description: "La zone a été supprimée avec succès.",
      });
    }
  };

  function getRadiusMarkerPosition(center: [number, number], radius: number): [number, number] {
    const lat = center[0];
    const lon = center[1];
    const earthRadius = 6378137; // en mètres
    const dLat = (radius / earthRadius) * (180 / Math.PI);
    return [lat + dLat, lon]; // vers le nord
  }

  function calculateDistanceMeters(a: [number, number], b: [number, number]): number {
    const R = 6371000;
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
  
    const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  }

  const handleSaveGeofence = () => {
    const temp = (window as any).tempGeofenceData;
    if (temp && newGeofenceName.trim()) {
      const newGeofence: Geofence = {
        id: String(Date.now()),
        nom: newGeofenceName,
        type: newGeofenceType,
        lat: temp.lat,
        lon: temp.lon,
        rayon_metres: temp.rayon_metres,
      };
      console.log(newGeofence);
      setGeofences(prev => [...prev, newGeofence]);
      setNewGeofenceName('');
      setDialogOpen(false);
      delete (window as any).tempGeofenceData;
  
      toast({
        title: "Geofence créée",
        description: `La zone "${newGeofenceName}" a été créée avec succès.`,
      });
    }
  };
  
  const handleEditGeofence = (geofence: Geofence) => {
    setEditingGeofence(geofence);
    setSelectedGeofence(geofence);
    toast({
      title: "Mode édition",
      description: "Vous pouvez maintenant modifier les points de la zone sur la carte.",
    });
  };

  const radiusIconRayon = new L.DivIcon({
    html: ReactDOMServer.renderToString(<MoveDiagonal size={20} color="#f59e0b" style={{ transform: 'rotate(-45deg)' }} />),
    className: '', // désactive le style par défaut
    iconSize: [20, 20],
    iconAnchor: [10, 10], // centre l’icône
  });

  const radiusIconCenter = new L.DivIcon({
    html: ReactDOMServer.renderToString(<Move size={30} color="#f59e0b" />),
    className: '', // désactive le style par défaut
    iconSize: [20, 20],
    iconAnchor: [10, 10], // centre l’icône
  });

  function createLucideDivIcon(
    IconComponent: LucideIcon,
    color: string,
    size: number = 30
  ): L.DivIcon {
    return new L.DivIcon({
      html: ReactDOMServer.renderToString(
        <IconComponent size={size} color={color} />
      ),
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 h-screen flex flex-col gap-4 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-left">Carte Interactive</h1>
            <p className="text-sm text-muted-foreground">Visualisation en temps réel de la flotte et des zones</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="whitespace-nowrap"
              variant={isDrawing ? "destructive" : "default"}
              onClick={() => setIsDrawing(!isDrawing)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isDrawing ? "Arrêter le dessin" : "Dessiner une Geofence"}
            </Button>
            
            {/* {editingGeofence && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setEditingGeofence(null);
                  toast({
                    title: "Mode édition désactivé",
                    description: "Modifications annulées.",
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler l'édition
              </Button>
            )} */}
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle Geofence</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la zone</Label>
                  <Input
                    id="name"
                    value={newGeofenceName}
                    onChange={(e) => setNewGeofenceName(e.target.value)}
                    placeholder="Ex: Dépôt Antananarivo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de zone</Label>
                  <Select value={newGeofenceType} onValueChange={(value) => setNewGeofenceType(value as Geofence['type'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="depot">Dépôt</SelectItem>
                      <SelectItem value="station">Station</SelectItem>
                      <SelectItem value="zone_risque">Zone à Risque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveGeofence} className="w-full">
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          <div className="lg:col-span-3 min-h-[400px]">
            <Card className="h-full overflow-hidden">
              <CardContent className="p-0 h-full">
                <MapContainer center={mapCenter} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  <FeatureGroup>
                    <EditControl
                      position="topright"
                      onCreated={handleGeofenceCreated}
                      onEdited={handleGeofenceEdited}
                      onDeleted={handleGeofenceDeleted}
                      draw={{
                        circle: isDrawing ? {
                          shapeOptions: {
                            color: '#3b82f6',
                            weight: 3,
                          }
                        } : false,
                        polygon: false,
                        rectangle: false,
                        polyline: false,
                        marker: false,
                        circlemarker: false,
                      }}
                      
                      
                      edit={
                        // editingGeofence
                        isDrawing && editingGeofence ? {
                        edit: {},
                        remove: true,
                      } : {
                        edit: false,
                        remove: false,
                      }}
                    />

                    {isDrawing && geofences.map((geofence) => (
                      <Circle
                        key={geofence.id}
                        center={[geofence.lat, geofence.lon]}
                        radius={geofence.rayon_metres}
                        pathOptions={{
                          color: getGeofenceColor(geofence.type),
                          fillOpacity: editingGeofence?.id === geofence.id ? 0.4 : 0.2,
                          weight: editingGeofence?.id === geofence.id ? 4 : 3
                        }}
                        eventHandlers={{
                          click: () => {
                            if (!isDrawing) {
                              setSelectedGeofence(geofence);
                            }
                          }
                        }}
                      >

                      <Marker
                        position={getRadiusMarkerPosition([geofence.lat, geofence.lon], geofence.rayon_metres)}
                        icon={createLucideDivIcon(Move, getGeofenceColor(geofence.type), 33 )}

                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const newPos = e.target.getLatLng();
                            const newRadius = calculateDistanceMeters(
                              [geofence.lat, geofence.lon],
                              [newPos.lat, newPos.lng]
                            );

                            setGeofences(prev =>
                              prev.map(g =>
                                g.id === geofence.id ? { ...g, rayon_metres: newRadius } : g
                              )
                            );
                          }
                        }}
                      />
                      <Marker
                        position={[geofence.lat, geofence.lon]}
                        icon={createLucideDivIcon(Move, getGeofenceColor(geofence.type), 33 )}

                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const newCenter = e.target.getLatLng();
                            setGeofences(prev =>
                              prev.map(g =>
                                g.id === geofence.id
                                  ? { ...g, lat: newCenter.lat, lon: newCenter.lng }
                                  : g
                              )
                            );
                          }
                        }}
                      />


                        <Popup>
                          <div className="min-w-[200px] p-2">
                            <h3 className="font-semibold text-base mb-2">{geofence.nom}</h3>
                            <Badge style={{ backgroundColor: getGeofenceColor(geofence.type) }}>
                              {geofence.type === 'depot' ? 'Dépôt' : geofence.type === 'station' ? 'Station' : 'Zone à Risque'}
                            </Badge>
                            <div className="mt-2 text-sm text-muted-foreground">ID: {geofence.id}</div>
                            <Button 
                              size="sm" 
                              className="mt-2 w-full" 
                              onClick={() => {
                                setIsDrawing(true);
                                handleEditGeofence(geofence);
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Modifier
                            </Button>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                  </FeatureGroup>

                  {vehiclesWithPositions.map((vehicle) => {
                    const fuelStatus = getFuelStatus(vehicle);
                    const remainingFuel = calculateFuelRemaining(vehicle);
                    const autonomy = remainingFuel / vehicle.consommation_nominale * 100;

                    return (
                      <Marker key={vehicle.id} position={vehicle.position} icon={createCustomIcon(fuelStatus)}>
                        <Popup>
                          <div className="min-w-[200px] p-2">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-base">{vehicle.modele}</h3>
                              <Badge variant={fuelStatus === 'critical' ? 'destructive' : 'secondary'} className="ml-2">
                                {fuelStatus === 'critical' ? 'Critique' : fuelStatus === 'low' ? 'Faible' : fuelStatus === 'medium' ? 'Moyen' : 'Normal'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
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
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader><CardTitle className="text-lg">Légende</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">État carburant</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Normal (&gt;60%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Moyen (30-60%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span>Faible (15-30%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Critique (&lt;15%)</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Types de zones</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500"></div><span>Dépôt</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500"></div><span>Station</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500"></div><span>Zone à Risque</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedGeofence && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Zone sélectionnée</CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setSelectedGeofence(null);
                      setEditingGeofence(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold">Nom:</span>
                    <p className="text-sm">{selectedGeofence.nom}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Type:</span>
                    <div className="mt-1">
                      <Badge style={{ backgroundColor: getGeofenceColor(selectedGeofence.type) }}>
                        {selectedGeofence.type === 'depot' ? 'Dépôt' : selectedGeofence.type === 'station' ? 'Station' : 'Zone à Risque'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">ID:</span>
                    <p className="text-sm text-muted-foreground">{selectedGeofence.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Points:</span>
                    <p className="text-xs text-muted-foreground">
                      Centre : {selectedGeofence.lat.toFixed(5)}, {selectedGeofence.lon.toFixed(5)} — Rayon : {(selectedGeofence.rayon_metres / 1000).toFixed(2)} km
                    </p>

                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditGeofence(selectedGeofence)}
                      disabled={editingGeofence?.id === selectedGeofence.id}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {editingGeofence?.id === selectedGeofence.id ? 'En édition' : 'Modifier'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}