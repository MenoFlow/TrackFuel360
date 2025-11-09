import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, FeatureGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw";
import { TripDialog } from "./TripDialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Activity, Edit, Trash, Loader2 } from "lucide-react";
import MobileTripDialog from "./MobileTripDialog";
import { MotionWrapper } from "../Layout/MotionWrapper";
import { useTrips, useCreateTrip, useUpdateTrip, useDeleteTrip } from "@/hooks/useTripsQuery";
import { TripInput } from "@/types/trip";
import { useTranslation } from "react-i18next";
import { MainLayout } from "../Layout/MainLayout";
import { useParams } from "react-router-dom";

// --- Custom marker icons ---
const GreenIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='%2300a86b' /><text x='12' y='16' fill='white' font-size='12' font-family='Arial' text-anchor='middle'>D</text></svg>`
    ),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const RedIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='%23e03e3e' /><text x='12' y='16' fill='white' font-size='12' font-family='Arial' text-anchor='middle'>A</text></svg>`
    ),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// --- Haversine distance calculation ---
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Utility: ISO local string without timezone offset (for inputs)
function toISOLocal(datetime: string): string {
  const d = new Date(datetime);
  const tzOffset = d.getTimezoneOffset() * 60000; // ms
  const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISO;
}

interface GPSPoint {
  lat: number;
  lon: number;
}


// --- Main component ---
export default function ManualTripEntryMap() {
  let { vehiculeId } = useParams();
  const id_vehicule = parseInt(vehiculeId);
  const { t } = useTranslation();
  const [departure, setDeparture] = useState<GPSPoint | null>(null);
  const [arrival, setArrival] = useState<GPSPoint | null>(null);
  const [isArrival, setIsArrival] = useState(true);
  const [showInfo, setShowInfo] = useState({ isVisible: false });
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [tStart, setTStart] = useState(toISOLocal(new Date().toISOString()));
  const [tEnd, setTEnd] = useState(toISOLocal(new Date().toISOString()));
  const [chauffeurId, setChauffeurId] = useState(null);
  const [odometreDebut, setOdometreDebut] = useState(0);
  const [odometreFin, setOdometreFin] = useState(0);
  const typeSaisie = "manuelle";
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup<any>>(new L.FeatureGroup());

  // React Query hooks
  const { data: trips = [], isLoading: isLoadingTrips } = useTrips(id_vehicule);
  const createTripMutation = useCreateTrip();
  const updateTripMutation = useUpdateTrip();
  const deleteTripMutation = useDeleteTrip();


  const tripFilter = trips.filter((trip) => trip.vehicule_id === id_vehicule)

  // Compute distance when both points are present
  useEffect(() => {
    if (departure && arrival) {
      const d = haversine(departure.lat, departure.lon, arrival.lat, arrival.lon);
      setDistanceKm(Number(d.toFixed(3)));
    } else {
      setDistanceKm(null);
    }
  }, [departure, arrival]);

  // Map click handler component
  function ClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (!departure) {
          setDeparture({ lat, lon: lng });
        } else if (!arrival) {
          setArrival({ lat, lon: lng });
        } else {
          if (isArrival) {
            setArrival({ lat, lon: lng });
          } else {
            setDeparture({ lat, lon: lng });
          }
        }
      },
    });
    return null;
  }

  // Reset points
  function resetPoints() {
    setDeparture(null);
    setArrival(null);
    setDistanceKm(null);
    setEditingTripId(null);
    setChauffeurId("u1");
    setOdometreDebut(0);
    setOdometreFin(0);
    setTStart(toISOLocal(new Date().toISOString()));
    setTEnd(toISOLocal(new Date().toISOString()));
    setShowSidePanel(false);
  }

  // Save trip (create or update)
  function saveTrip() {
    if (!departure || !arrival) {
      return;
    }

    const tripId = editingTripId || Date.now();
    
    const tripData: TripInput = {
      vehicule_id: id_vehicule,
      chauffeur_id: chauffeurId,
      date_debut: new Date(tStart).toISOString(),
      date_fin: new Date(tEnd).toISOString(),
      distance_km: distanceKm || 0,
      type_saisie: typeSaisie,
      traceGps: [
        {
          trajet_id: tripId,
          sequence: 1,
          latitude: departure.lat,
          longitude: departure.lon,
          timestamp: new Date(tStart).toISOString(),
        },
        {
          trajet_id: tripId,
          sequence: 2,
          latitude: arrival.lat,
          longitude: arrival.lon,
          timestamp: new Date(tEnd).toISOString(),
        },
      ],
    };

    if (editingTripId) {
      updateTripMutation.mutate(
        { id: editingTripId, data: tripData },
        {
          onSuccess: () => {
            resetPoints();
          },
        }
      );
    } else {
      createTripMutation.mutate(tripData, {
        onSuccess: () => {
          resetPoints();
        },
      });
    }
  }

  // Start editing a trip
  function startEditTrip(trip: any) {
    if (!trip || !trip.traceGps || trip.traceGps.length < 2) return;
    console.log(trip);
    const [d, a] = trip.traceGps;
    setDeparture({ lat: d.latitude, lon: d.longitude });
    setArrival({ lat: a.latitude, lon: a.longitude });
    setTStart(toISOLocal(trip.date_debut));
    setTEnd(toISOLocal(trip.date_fin));
    setChauffeurId(trip.chauffeur_id || "u1");
    setEditingTripId(trip.id);
    
    if (mapRef.current) {
      try {
        mapRef.current.setView([d.latitude, d.longitude], 13);
      } catch (err) {
        console.error("Error setting map view:", err);
      }
    }
  }

  // Handle trip deletion
  function handleDeleteTrip(id: number) {
    deleteTripMutation.mutate({ id, id_vehicule });
  }

  function MapEvents({ onReady }: { onReady: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
      onReady(map);
    }, [map, onReady]);
    return null;
  }

  const isSaving = createTripMutation.isPending || updateTripMutation.isPending;
  const isDeleting = deleteTripMutation.isPending;
  const canSave = departure && arrival && !isSaving;

  return (
      <MainLayout>
        <div className="flex flex-col md:flex-row w-full h-[70vh]" style={{ gap: 12 }}>
        <div className="flex-1 min-h-[400px]">
          <MotionWrapper
            variant="slideDown"
            delay={0.1}
            className="flex flex-col items-center text-center md:flex-row md:items-left md:text-left md:justify-between gap-4 mb-3"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('trips.title')}</h1>
              <p className="text-muted-foreground mt-2">{t('trips.subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-destructive" onClick={resetPoints}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('trips.reset')}
              </Button>
              {!showSidePanel && (
                <div className="hidden md:block">
                  <Button variant="outline" onClick={() => setShowSidePanel((prev) => !prev)}>
                    <Activity className="w-5 h-5 mr-2" />
                    {t('trips.tripsButton')}
                    {!isLoadingTrips && trips.length > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                        {trips.filter((t) => t.vehicule_id === id_vehicule).length}
                      </span>
                    )}
                  </Button>
                </div>
              )}
              <MobileTripDialog
                vehiculeId={id_vehicule}
                trips={trips}
                isLoading={isLoadingTrips}
                onEdit={startEditTrip}
                onDelete={handleDeleteTrip}
                isDeleting={isDeleting}
              />
            </div>
          </MotionWrapper>

          <MotionWrapper
            variant="fade"
            delay={0.2}
            className="w-full h-full"
          >
            <MapContainer
              center={[-18.8792, 47.5079]}
              zoom={6}
              style={{ height: "100%", width: "100%", borderRadius: 8 }}
            >
              <MapEvents onReady={(map) => (mapRef.current = map)} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <ClickHandler />

              {/* Departure marker */}
              {departure && (
                <Marker position={[departure.lat, departure.lon]} icon={GreenIcon}>
                  <Popup>
                    <div className="w-full min-w-[220px] p-2 rounded">
                      {showInfo.isVisible === false ? (
                        <>
                          <strong>{t('trips.departure')}</strong>
                          <div>{t('trips.latitude')}: {Number(departure.lat).toFixed(6)}</div>
                          <div>{t('trips.longitude')}: {Number(departure.lon).toFixed(6)}</div>
                          <div style={{ marginTop: 8 }}>
                            <button
                              className="bg-primary hover:bg-primary/90 text-primary-foreground py-1 px-3 rounded shadow text-sm"
                              onClick={() => {
                                setTimeout(() => {
                                  setIsArrival(false);
                                  setShowInfo((prev) => ({ ...prev, isVisible: true }));
                                }, 500);
                              }}
                            >
                              {t('trips.modify')}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <strong>{t('trips.infoDeparture')}</strong>
                          <p className="text-sm text-muted-foreground">
                            {t('trips.clickToModify')}
                          </p>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Arrival marker */}
              {arrival && (
                <Marker position={[arrival.lat, arrival.lon]} icon={RedIcon}>
                  <Popup>
                    <div className="w-full min-w-[220px] p-2 rounded">
                      {showInfo.isVisible === true ? (
                        <>
                          <strong>{t('trips.arrival')}</strong>
                          <div>{t('trips.latitude')}: {arrival.lat.toFixed(6)}</div>
                          <div>{t('trips.longitude')}: {arrival.lon.toFixed(6)}</div>
                          <div style={{ marginTop: 8 }}>
                            <button
                              className="bg-primary hover:bg-primary/90 text-primary-foreground py-1 px-3 rounded shadow text-sm"
                              onClick={() => {
                                setTimeout(() => {
                                  setIsArrival(true);
                                  setShowInfo((prev) => ({ ...prev, isVisible: false }));
                                }, 500);
                              }}
                            >
                              {t('trips.modify')}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <strong>{t('trips.infoArrival')}</strong>
                          <p className="text-sm text-muted-foreground">
                            {t('trips.clickToModify')}
                          </p>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}

              <FeatureGroup ref={featureGroupRef}>
                <EditControl
                  position="topright"
                  onCreated={() => {}}
                  onEdited={() => {}}
                  onDeleted={() => {}}
                  draw={{
                    rectangle: false,
                    polyline: false,
                    polygon: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                  }}
                  edit={true && { edit: false, remove: false }}
                />
              </FeatureGroup>
            </MapContainer>
          </MotionWrapper>

          {/* Quick Info Bar */}
          <MotionWrapper
            variant="slideUp"
            delay={0.3}
            className="flex items-center gap-4 mt-3 px-4 py-2 bg-muted rounded-md shadow-sm text-sm text-muted-foreground justify-between"
          >
            <div className="font-medium text-foreground">
              {t('trips.estimatedDistance')}
              <span className="ml-2 font-semibold text-primary">
                {distanceKm !== null ? `${distanceKm} ${t('trips.km')}` : "—"}
              </span>
            </div>
            <TripDialog
              editingTripId={editingTripId}
              distanceKm={distanceKm}
              tStart={tStart}
              tEnd={tEnd}
              typeSaisie={typeSaisie}
              chauffeurId={chauffeurId}
              odometreDebut={odometreDebut}
              odometreFin={odometreFin}
              setTStart={setTStart}
              setTEnd={setTEnd}
              setChauffeurId={setChauffeurId}
              setOdometreDebut={setOdometreDebut}
              setOdometreFin={setOdometreFin}
              onSave={saveTrip}
              isSaving={isSaving}
              disabled={!canSave}
            />
          </MotionWrapper>
        </div>

        {/* Side panel: admin trip list */}
        {showSidePanel && (
          <MotionWrapper
            variant="slideLeft"
            delay={0.1}
            // style={{
            //   width: 420,
            //   padding: 16,
            //   borderLeft: "1px solid hsl(var(--border))",
            //   background: "hsl(var(--muted))",
            //   position: "relative",
            //   flexDirection: "column",
            //   gap: 12,
            //   height: "100%",
            // }}
            className="hidden lg:block"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t('trips.editTrip')}</h3>
              <Button onClick={() => setShowSidePanel(false)} variant="outline" size="sm">
                {t('trips.close')}
              </Button>
            </div>
            <hr className="my-2 border-border" />

            {(true) && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <h4 className="text-sm font-medium mb-3">{t('trips.vehicleTrips')} {id_vehicule}</h4>

                {isLoadingTrips ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: "730px",
                      overflowY: "auto",
                      paddingRight: 6,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {trips
                      .filter((trip) => trip.vehicule_id === id_vehicule)
                      .map((trip) => (
                        <div
                          key={trip.id}
                          className="p-3 border border-border rounded-lg bg-card shadow-sm space-y-2"
                        >
                          <div className="font-medium">{t('trips.trip')} #{trip.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(trip.date_debut).toLocaleString("fr-FR")} →{" "}
                            {new Date(trip.date_fin).toLocaleString("fr-FR")} —{" "}
                            <strong>{trip.distance_km} {t('trips.km')}</strong>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => startEditTrip(trip)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t('trips.edit')}
                            </Button>

                            <Button
                              onClick={() => {
                                if (window.confirm(t('trips.confirmDelete'))) {
                                  handleDeleteTrip(trip.id);
                                }
                              }}
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </MotionWrapper>
        )}
      </div>
    </MainLayout>
  );
}
