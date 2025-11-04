import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import type { LatLngExpression } from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Navigation, Move, AlertTriangle, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/Layout/MainLayout';
import { MapToolbar } from '@/components/Map/MapToolbar';
import { GeofenceDialog } from '@/components/Map/GeofenceDialog';
import { LegendPanel } from '@/components/Map/LegendPanel';
import { VehicleFilters } from '@/components/Map/VehicleFilters';
import { GeofenceDetailsPanel } from '@/components/Map/GeofenceDetailsPanel';
import { AlertButton } from '@/components/Map/AlertButton';
import { AlertPanel } from '@/components/Map/AlertPanel';
import { useGeofences } from '@/hooks/useGeofences';
import { useVehiclePositions } from '@/hooks/useVehiclePositions';
import { useAlerts } from '@/hooks/useAlerts';
import { getFuelStatus, calculateFuelRemaining, getFuelStatusColor, getFuelStatusLabel } from '@/lib/fuelCalculations';
import { createCustomVehicleIcon, createLucideDivIcon, getGeofenceColor, getRadiusMarkerPosition, calculateDistanceMeters } from '@/lib/utils/mapUtils';
import { detectDangerZoneViolations } from '@/lib/utils/geofenceUtils';
import { Geofence, GeofenceType, FilterState } from '@/types';
import 'leaflet-draw';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getTripsByVehicleId } from '@/lib/mockData';

const MAP_CENTER: LatLngExpression = [-18.8792, 47.5079];

export default function MapView() {
  // Hooks personnalisés
  const { t } = useTranslation();
  const [hideLateralWin, setHideLateralWin] = useState(false);
  const { vehiclesWithPositions } = useVehiclePositions();
  const {
    geofences,
    selectedGeofence,
    editingGeofence,
    setSelectedGeofence,
    addGeofence,
    updateGeofence,
    deleteGeofence,
    startEditing,
    cancelEditing,
  } = useGeofences();
  const {
    alerts,
    addAlert,
    deleteAlert,
    markAllAsRead,
    clearAll,
    unreadCount,
  } = useAlerts();

  // États locaux
  const [isDrawing, setIsDrawing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [pendingGeofenceData, setPendingGeofenceData] = useState<{
    lat: number;
    lon: number;
    rayon_metres: number;
  } | null>(null);

  // Filtres véhicules
  const [filters, setFilters] = useState<FilterState>({
    showCritical: true,
    showLow: true,
    showMedium: true,
    showHigh: true,
  });

  // Tracking des véhicules en zone à risque (pour éviter les alertes en double)
  const vehiclesInDangerZoneRef = useRef<Set<string>>(new Set());

  // Détection des violations de zones à risque
  useEffect(() => {
    const violations = detectDangerZoneViolations(vehiclesWithPositions, geofences);
    const currentVehiclesInDanger = new Set<string>();

    violations.forEach(({ vehicle, geofence }) => {
      const key = `${vehicle.id}-${geofence.id}`;
      currentVehiclesInDanger.add(key);

      // Créer une alerte seulement si c'est une nouvelle entrée
      if (!vehiclesInDangerZoneRef.current.has(key)) {
        addAlert({
          vehicleId: vehicle.id,
          vehicleImmatriculation: vehicle.immatriculation,
          vehicleModele: vehicle.modele,
          geofenceId: geofence.id,
          geofenceName: geofence.nom,
          coordinates: vehicle.position,
        });

        toast({
          title: 'Alerte de sécurité !',
          description: `${vehicle.modele} (${vehicle.id}) est entré dans ${geofence.nom}`,
          variant: 'destructive',
        });
      }
    });

    vehiclesInDangerZoneRef.current = currentVehiclesInDanger;
  }, [vehiclesWithPositions, geofences, addAlert]);

  // Filtrer les véhicules selon les filtres actifs
  const filteredVehicles = useMemo(() => {
    return vehiclesWithPositions.filter((vehicle) => {
      const status = getFuelStatus(vehicle);
      switch (status) {
        case 'critical':
          return filters.showCritical;
        case 'low':
          return filters.showLow;
        case 'medium':
          return filters.showMedium;
        case 'high':
          return filters.showHigh;
        default:
          return true;
      }
    });
  }, [vehiclesWithPositions, filters]);

  // Déterminer quels véhicules sont actuellement en zone à risque
  const vehiclesInDangerZone = useMemo(() => {
    const violations = detectDangerZoneViolations(vehiclesWithPositions, geofences);
    return new Set(violations.map((v) => v.vehicle.id));
  }, [vehiclesWithPositions, geofences]);

  /**
   * Gestion de la création d'une geofence
   */
  const handleGeofenceCreated = useCallback((e: any) => {
    const { layerType, layer } = e;

    if (layerType === 'circle') {
      const center = layer.getLatLng();
      const radius = layer.getRadius();

      // Stocker temporairement les données
      setPendingGeofenceData({
        lat: center.lat,
        lon: center.lng,
        rayon_metres: radius,
      });

      // Ouvrir le dialog pour saisir nom et type
      setDialogOpen(true);

      // IMPORTANT: Supprimer le layer temporaire pour éviter la duplication
      layer.remove();
    }
  }, []);

  /**
   * Sauvegarde de la geofence après validation du formulaire
   */
  const handleSaveGeofence = useCallback(
    (name: string, type: GeofenceType) => {
      // Mode édition: mise à jour du nom et du type
      if (editingGeofence) {
        updateGeofence(editingGeofence.id, {
          nom: name,
          type: type,
        });
        cancelEditing();
        setDialogOpen(false);
        return;
      }

      // Mode création: nouvelle geofence
      if (pendingGeofenceData && name.trim()) {
        const newGeofence: Geofence = {
          id: Date.now(),
          nom: name,
          type: type,
          lat: pendingGeofenceData.lat,
          lon: pendingGeofenceData.lon,
          rayon_metres: pendingGeofenceData.rayon_metres,
        };

        addGeofence(newGeofence);
        setPendingGeofenceData(null);

        toast({
          title: 'Geofence créée',
          description: `La zone "${name}" a été créée avec succès.`,
        });
      }
    },
    [pendingGeofenceData, editingGeofence, addGeofence, updateGeofence, cancelEditing]
  );

  /**
   * Gestion de l'édition d'une geofence
   */
  const handleGeofenceEdited = useCallback(
    (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        if (editingGeofence && layer.options && layer.options.geofenceId) {
          const center = layer.getLatLng();
          const radius = layer.getRadius();

          updateGeofence(editingGeofence.id, {
            lat: center.lat,
            lon: center.lng,
            rayon_metres: radius,
          });

          toast({
            title: 'Geofence modifiée',
            description: 'Les modifications ont été enregistrées.',
          });
        }
      });
    },
    [editingGeofence, updateGeofence]
  );

  /**
   * Gestion de la suppression d'une geofence
   */
  const handleGeofenceDeleted = useCallback(
    (e: any) => {
      if (editingGeofence) {
        deleteGeofence(editingGeofence.id);
        toast({
          title: 'Geofence supprimée',
          description: 'La zone a été supprimée avec succès.',
        });
      }
    },
    [editingGeofence, deleteGeofence]
  );

  /**
   * Démarrer l'édition d'une geofence
   */
  const handleStartEditing = useCallback(
    (geofence: Geofence) => {
      // Ouvrir le dialogue pour permettre l'édition du nom et du type
      startEditing(geofence);
      setDialogOpen(true);
    },
    [startEditing]
  );

  /**
   * Supprimer une geofence
   */
  const handleDeleteGeofence = useCallback(
    async (id: number) => {
      await deleteGeofence(id);
    },
    [deleteGeofence]
  );

  /**
   * Mise à jour du rayon via drag du marker
   */
  const handleRadiusMarkerDrag = useCallback(
    (geofenceId: number, center: [number, number], newPos: { lat: number; lng: number }) => {
      const newRadius = calculateDistanceMeters(center, [newPos.lat, newPos.lng]);
      updateGeofence(geofenceId, { rayon_metres: newRadius });
    },
    [updateGeofence]
  );

  /**
   * Mise à jour du centre via drag du marker
   */
  const handleCenterMarkerDrag = useCallback(
    (geofenceId: number, newCenter: { lat: number; lng: number }) => {
      updateGeofence(geofenceId, { lat: newCenter.lat, lon: newCenter.lng });
    },
    [updateGeofence]
  );

  // Mémoïser les icônes pour éviter les rerenders
  const vehicleIcons = useMemo(() => {
    const icons: Record<string, ReturnType<typeof createCustomVehicleIcon>> = {};
    filteredVehicles.forEach((vehicle) => {
      const status = getFuelStatus(vehicle);
      const color = getFuelStatusColor(status);
      icons[vehicle.id] = createCustomVehicleIcon(color);
    });
    return icons;
  }, [filteredVehicles]);

  // Gérer l'ouverture du panneau d'alerte
  const handleAlertButtonClick = useCallback(() => {
    setShowAlertPanel(!showAlertPanel);
    if (!showAlertPanel) {
      markAllAsRead();
    }
  }, [showAlertPanel, markAllAsRead]);

  return (
    <MainLayout>

      <div className="container mx-auto p-4 h-screen flex flex-col gap-4 max-w-full max-h-[90vh] overflow-x-hidden">
        {/* Toolbar avec bouton d'alerte */}
        <div className='flex flex-col justify-center item-center text-center md:flex-row md:justify-between gap-4'>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold lg:text-start">{t('map.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('map.subtitle')}
            </p>
          </div>
          <div className="flex flex-row sm:flex-row items-start sm:items-center justify-center gap-2">
            <MapToolbar
              isDrawing={isDrawing}
              isReadOnly={isReadOnly}
              onToggleDrawing={() => {
                setIsDrawing(!isDrawing);
                if (isDrawing) {
                  cancelEditing();
                }
              }}
              onToggleReadOnly={() => setIsReadOnly(!isReadOnly)}
            />
            <AlertButton
              unreadCount={unreadCount}
              onClick={handleAlertButtonClick}
              isOpen={showAlertPanel}
            />
            <div className='hidden lg:block'>
              <Button variant='outline' onClick={() => setHideLateralWin(!hideLateralWin)}>
                {!hideLateralWin ? <ArrowLeft /> : <ArrowRight />}
              </Button>
            </div>
            <div className='lg:hidden'>
              <Button variant='outline' onClick={() => setHideLateralWin(!hideLateralWin)}>
                {!hideLateralWin ? <ArrowUp /> : <ArrowDown />}
              </Button>
            </div>

          </div>
        </div>

        {/* Dialog création geofence */}
        <GeofenceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveGeofence}
          editingGeofence={editingGeofence}
        />

        {/* Grille principale */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 ">
          {/* Carte */}
          <div
            className={`min-h-[400px] ${
              hideLateralWin ? 'lg:col-span-3' : 'lg:col-span-4'
            }`}
          >

            <Card className="h-full overflow-hidden">
              <CardContent className="p-0 h-full">
                <MapContainer
                  center={MAP_CENTER}
                  zoom={6}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {/* Geofences avec EditControl */}
                  <FeatureGroup>
                    <EditControl
                      position="topright"
                      onCreated={handleGeofenceCreated}
                      onEdited={handleGeofenceEdited}
                      onDeleted={handleGeofenceDeleted}
                      draw={{
                        circle: isDrawing && !isReadOnly && !editingGeofence
                          ? {
                              shapeOptions: {
                                color: '#3b82f6',
                                weight: 3,
                              },
                            }
                          : false,
                        polygon: false,
                        rectangle: false,
                        polyline: false,
                        marker: false,
                        circlemarker: false,
                      }}
                      edit={{
                        edit: false,
                        remove: false,
                      }}
                    />

                    {/* Affichage des geofences */}
                    {geofences.map((geofence) => {
                      const isEditable = editingGeofence?.id === geofence.id;
                      const isDangerZone = geofence.type === 'zone_risque';
                      const hasVehiclesInside = isDangerZone && 
                        vehiclesWithPositions.some(v => vehiclesInDangerZone.has(v.id));

                      return (
                        <Circle
                          key={geofence.id}
                          center={[geofence.lat, geofence.lon]}
                          radius={geofence.rayon_metres}
                          pathOptions={{
                            color: getGeofenceColor(geofence.type),
                            fillOpacity: isEditable ? 0.4 : (hasVehiclesInside ? 0.3 : 0.2),
                            weight: isEditable ? 4 : (hasVehiclesInside ? 4 : 3),
                            className: hasVehiclesInside ? 'pulse-danger' : '',
                          }}
                          eventHandlers={{
                            click: () => {
                              if (!isDrawing) {
                                setSelectedGeofence(geofence);
                                setHideLateralWin(true);
                              }
                            },
                          }}
                        >
                          {/* Marker centre (draggable en édition) */}
                          {isEditable && (
                            <Marker
                              position={[geofence.lat, geofence.lon]}
                              icon={createLucideDivIcon(Move, getGeofenceColor(geofence.type), 33)}
                              draggable={true}
                              eventHandlers={{
                                dragend: (e) => {
                                  const newCenter = e.target.getLatLng();
                                  handleCenterMarkerDrag(geofence.id, newCenter);
                                },
                              }}
                            />
                          )}

                          {/* Marker rayon (draggable en édition) */}
                          {isEditable && (
                            <Marker
                              position={getRadiusMarkerPosition(
                                [geofence.lat, geofence.lon],
                                geofence.rayon_metres
                              )}
                              icon={createLucideDivIcon(Move, getGeofenceColor(geofence.type), 33)}
                              draggable={true}
                              eventHandlers={{
                                dragend: (e) => {
                                  const newPos = e.target.getLatLng();
                                  handleRadiusMarkerDrag(
                                    geofence.id,
                                    [geofence.lat, geofence.lon],
                                    newPos
                                  );
                                },
                              }}
                            />
                          )}

                          {/* Popup */}
                          <Popup>
                            <div className="min-w-[200px] p-2">
                              <h3 className="font-semibold text-base mb-2">{geofence.nom}</h3>
                              <Badge style={{ backgroundColor: getGeofenceColor(geofence.type) }}>
                                {geofence.type === 'depot'
                                  ? 'Dépôt'
                                  : geofence.type === 'station'
                                  ? 'Station'
                                  : 'Zone à Risque'}
                              </Badge>
                            </div>
                          </Popup>
                        </Circle>
                      );
                    })}
                  </FeatureGroup>

                  {/* Marqueurs véhicules */}
                  {filteredVehicles.map((vehicle) => {
                    const fuelStatus = getFuelStatus(vehicle);
                    const remainingFuel = calculateFuelRemaining(vehicle);
                    const autonomy = (remainingFuel / vehicle.consommation_nominale) * 100;
                    const isInDangerZone = vehiclesInDangerZone.has(vehicle.id);

                    const tripsData = getTripsByVehicleId(vehicle.id);
                    
                    // Sélection du dernier trajet
                    const lastTrip = tripsData && tripsData.length > 0 ? tripsData[tripsData.length - 1] : null;

                    // Récupération du dernier point GPS
                    const lastPosition =
                      lastTrip?.traceGps && lastTrip.traceGps.length > 0
                        ? lastTrip.traceGps[lastTrip.traceGps.length - 1]
                        : null;

                    return (
                      <div key={vehicle.id}>
                        <Marker
                          key={vehicle.id}
                          position={
                            lastPosition ? [lastPosition.latitude, lastPosition.longitude] : [0, 0]
                          }
                          icon={vehicleIcons[vehicle.id]}
                        >
                          <Popup>
                            <div className="min-w-[200px] p-2">
                              {isInDangerZone && (
                                <div className="mb-2 p-2 bg-destructive/10 border border-destructive rounded-md">
                                  <div className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-xs font-semibold">En zone à risque</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-base">{vehicle.modele}</h3>
                                <Badge
                                  variant={
                                    fuelStatus === 'critical' || fuelStatus === 'low'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                  className="ml-2"
                                >
                                  {getFuelStatusLabel(fuelStatus)}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Immatriculation:</span>
                                  <span className="font-medium">{vehicle.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Fuel className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{remainingFuel.toFixed(1)}L</span>
                                  <span className="text-muted-foreground">
                                    / {vehicle.capacite_reservoir}L
                                  </span>
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
                        
                        {/* Icône d'alerte au-dessus du véhicule en danger */}
                        {isInDangerZone && (
                          <Marker
                            position={vehicle.position}
                            icon={createLucideDivIcon(AlertTriangle, '#ef4444', 24)}
                            zIndexOffset={1000}
                          />
                        )}
                      </div>
                    );
                  })}
                </MapContainer>
              </CardContent>
            </Card>
          </div>

          {/* Panneau latéral */}
          <div hidden={!hideLateralWin} className="space-y-4 overflow-y-auto">
            {showAlertPanel ? (
              <AlertPanel
                alerts={alerts}
                onDeleteAlert={deleteAlert}
                onClearAll={clearAll}
                onClose={() => setShowAlertPanel(false)}
              />
            ) : (
              <>
                <VehicleFilters filters={filters} onFilterChange={setFilters} />
                <LegendPanel />
                <GeofenceDetailsPanel
                  geofence={selectedGeofence}
                  isEditing={editingGeofence?.id === selectedGeofence?.id}
                  isReadOnly={isReadOnly}
                  onEdit={handleStartEditing}
                  onDelete={handleDeleteGeofence}
                  onClose={() => {
                    setSelectedGeofence(null);
                    cancelEditing();
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
