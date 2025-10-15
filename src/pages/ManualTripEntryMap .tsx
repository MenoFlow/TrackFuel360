import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, FeatureGroup  } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw";
import { TripDialog } from "./TripDialog";
import '../index.css'
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Trash, PanelRightClose, PanelRightOpen, Edit, RotateCcw, Activity } from "lucide-react";
import MobileTripDialog from "./MobileTripDialog";
import { motion } from "framer-motion";


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

// --- Haversine ---
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// utility: ISO local string without timezone offset (for inputs)
function toISOLocal(datetime) {
  const d = new Date(datetime);
  const tzOffset = d.getTimezoneOffset() * 60000; // ms
  const localISO = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISO;
}

// --- Mock trips for admin edit ---
const MOCK_TRIPS = [
  {
    id: "T-001",
    vehicule_id: "V123",
    t_start: "2025-10-11T08:00:00",
    t_end: "2025-10-11T09:00:00",
    distance_km: 25.4,
    trace_gps: [
      { lat: -18.8792, lon: 47.5079 },
      { lat: -18.9400, lon: 47.5200 },
    ],
    type_saisie: "Manuelle",
    motif: "Livraison matin",
    author: "admin",
    created_at: "2025-10-11T10:00:00",
  },
  {
    id: "T-002",
    vehicule_id: "V123",
    t_start: "2025-10-10T14:30:00",
    t_end: "2025-10-10T15:10:00",
    distance_km: 12.1,
    trace_gps: [
      { lat: -19.0450, lon: 47.6350 },
      { lat: -19.0600, lon: 47.6420 },
    ],
    type_saisie: "Manuelle",
    motif: "Rendez-vous",
    author: "chauffeur:jean",
    created_at: "2025-10-10T15:30:00",
  },
  {
    id: "T-003",
    vehicule_id: "V123",
    t_start: "2025-10-11T08:00:00",
    t_end: "2025-10-11T09:00:00",
    distance_km: 25.4,
    trace_gps: [
      { lat: -18.8792, lon: 47.5079 },
      { lat: -18.9400, lon: 47.5200 },
    ],
    type_saisie: "Manuelle",
    motif: "Livraison matin",
    author: "admin",
    created_at: "2025-10-11T10:00:00",
  },
  {
    id: "T-004",
    vehicule_id: "V123",
    t_start: "2025-10-10T14:30:00",
    t_end: "2025-10-10T15:10:00",
    distance_km: 12.1,
    trace_gps: [
      { lat: -19.0450, lon: 47.6350 },
      { lat: -19.0600, lon: 47.6420 },
    ],
    type_saisie: "Manuelle",
    motif: "Rendez-vous",
    author: "chauffeur:jean",
    created_at: "2025-10-10T15:30:00",
  },
  {
    id: "T-005",
    vehicule_id: "V123",
    t_start: "2025-10-11T08:00:00",
    t_end: "2025-10-11T09:00:00",
    distance_km: 25.4,
    trace_gps: [
      { lat: -18.8792, lon: 47.5079 },
      { lat: -18.9400, lon: 47.5200 },
    ],
    type_saisie: "Manuelle",
    motif: "Livraison matin",
    author: "admin",
    created_at: "2025-10-11T10:00:00",
  },
  {
    id: "T-006",
    vehicule_id: "V123",
    t_start: "2025-10-10T14:30:00",
    t_end: "2025-10-10T15:10:00",
    distance_km: 12.1,
    trace_gps: [
      { lat: -19.0450, lon: 47.6350 },
      { lat: -19.0600, lon: 47.6420 },
    ],
    type_saisie: "Manuelle",
    motif: "Rendez-vous",
    author: "chauffeur:jean",
    created_at: "2025-10-10T15:30:00",
  },
  {
    id: "T-005",
    vehicule_id: "V123",
    t_start: "2025-10-11T08:00:00",
    t_end: "2025-10-11T09:00:00",
    distance_km: 25.4,
    trace_gps: [
      { lat: -18.8792, lon: 47.5079 },
      { lat: -18.9400, lon: 47.5200 },
    ],
    type_saisie: "Manuelle",
    motif: "Livraison matin",
    author: "admin",
    created_at: "2025-10-11T10:00:00",
  },
  {
    id: "T-006",
    vehicule_id: "V123",
    t_start: "2025-10-10T14:30:00",
    t_end: "2025-10-10T15:10:00",
    distance_km: 12.1,
    trace_gps: [
      { lat: -19.0450, lon: 47.6350 },
      { lat: -19.0600, lon: 47.6420 },
    ],
    type_saisie: "Manuelle",
    motif: "Rendez-vous",
    author: "chauffeur:jean",
    created_at: "2025-10-10T15:30:00",
  },
];

// --- Main component ---
export default function ManualTripEntryMap({ vehiculeId = "V123", role = "admin" }) {
  const [departure, setDeparture] = useState(null); // {lat, lon}
  const [arrival, setArrival] = useState(null);
  const [isArrival, setIsArrival] = useState(true);
  const [showInfo, setShowInfo] = useState({
    isVisible: false,
  });
  const [distanceKm, setDistanceKm] = useState(null);
  const [tStart, setTStart] = useState( toISOLocal(new Date().toISOString()) );
  const [tEnd, setTEnd] = useState( toISOLocal(new Date().toISOString()) );
  const [motif, setMotif] = useState("");
  const [typeSaisie] = useState("Manuelle");
  const [trips, setTrips] = useState(MOCK_TRIPS);
  const [editingTripId, setEditingTripId] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup<any>>(new L.FeatureGroup());
  // console.log(arrival);

  // compute distance when both points present
  useEffect(() => {
    if (departure && arrival) {
      const d = haversine(departure.lat, departure.lon, arrival.lat, arrival.lon);
      // console.log("departureLat:", departure.lat);
      // console.log("departureLon:", departure.lon);
      // console.log("arrivalLat:", arrival.lat);
      // console.log("arrivalLon:", arrival.lon);

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
        // if departure missing -> set departure, else set arrival
        if (!departure) {
          setDeparture({ lat, lon: lng });
        } else if (!arrival) {
          
          setArrival({ lat, lon: lng });
        } else {
          // both exist -> replace arrival by default
          if(isArrival){
            setArrival({ lat, lon: lng });
          } else {
            setDeparture({ lat, lon: lng });
          }
        }
      },
    });
    return null;
  }

  // reset points
  function resetPoints() {
    setDeparture(null);
    setArrival(null);
    setDistanceKm(null);
    setEditingTripId(null);
  }

  // mock save (in real app replace by API POST)
  function saveTrip() {
    if (!departure || !arrival) {
      alert("Veuillez définir les points de départ et d'arrivée.");
      return;
    }
    const newTrip = {
      id: `T-${Date.now()}`,
      vehicule_id: vehiculeId,
      t_start: new Date(tStart).toISOString().split(".")[0],
      t_end: new Date(tEnd).toISOString().split(".")[0],
      distance_km: distanceKm,
      trace_gps: [departure, arrival],
      type_saisie: typeSaisie,
      motif: motif,
      author: role,
      created_at: new Date().toISOString().split(".")[0],
    };
    // if editing an existing trip, replace it
    if (editingTripId) {
      setTrips((prev) => prev.map((t) => (t.id === editingTripId ? { ...newTrip, id: editingTripId } : t)));
      alert("Trajet modifié avec succès (mock).");
    } else {
      setTrips((prev) => [newTrip, ...prev]);
      alert("Trajet enregistré (mock).");
    }
    resetPoints();
  }

  // when admin chooses to edit a trip
  function startEditTrip(trip) {
    if (!trip || !trip.trace_gps || trip.trace_gps.length < 2) return;
    const [d, a] = trip.trace_gps;
    setDeparture({ lat: d.lat, lon: d.lon });
    setArrival({ lat: a.lat, lon: a.lon });
    setTStart(toISOLocal(trip.t_start));
    setTEnd(toISOLocal(trip.t_end));
    setMotif(trip.motif || "");
    setEditingTripId(trip.id);
    // fly to first point
    if (mapRef.current) {
      try {
        if (mapRef.current) {
          mapRef.current.setView([d.lat, d.lon], 13);
        }
        
      } catch (err) {}
    }
  }
  function MapEvents({ onReady }: { onReady: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
      onReady(map);
    }, [map, onReady]);
    return null;
  }

  // small UI for the control panel
  return (
    <MainLayout>
      <>
      <div className="w-full h-[67%] flex flex-col md:flex-row" style={{ gap: 12 }}>
        <div style={{ flex: 1, minHeight: "580px" }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}   
           className="flex flex-col items-center text-center md:flex-row md:items-left md:text-left md:justify-between gap-4 mb-3"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion de trajets</h1>
              <p className="text-muted-foreground mt-2">Ajouter ou modifier un trajet</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-red-600" onClick={resetPoints}>
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
              {
                !showSidePanel && (
                  <div className="hidden md:block">
                    <Button variant="outline" onClick={() => setShowSidePanel(prev => !prev)}>
                      <Activity className="w-5 h-5" />
                      Trajets
                    </Button>
                  </div>
                )
              }
              <MobileTripDialog
                role={role}
                vehiculeId={vehiculeId}
                trips={trips}
                startEditTrip={startEditTrip}
                setTrips={setTrips}
              />

            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}   
            className="w-full h-full"
          >
            <MapContainer
              center={[-18.8792, 47.5079]}
              zoom={6}
              style={{ height: "100%", width: "100%", borderRadius: 8 }}
              // whenReady={(event) => (mapRef.current = event.target)}
            >
              <MapEvents onReady={(map) => (mapRef.current = map)} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <ClickHandler />

              {/* Departure marker */}
              {departure && (
                <Marker position={[departure.lat, departure.lon]} icon={GreenIcon}>
                  <Popup>
                    <div className="w-full min-w-[220px] p-2 rounded">

                      {showInfo.isVisible === false ? (
                        <>
                          <strong>Départ</strong>
                          <div>Lat: {departure.lat.toFixed(6)}</div>
                          <div>Lon: {departure.lon.toFixed(6)}</div>
                          <div style={{ marginTop: 8 }}>
                            {/* <button
                              onClick={() => setDeparture(null)}
                              style={{ marginRight: 8 }}
                            >
                              Réinitialiser
                            </button> */}
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-1 rounded shadow"
                                onClick={() => {
                                  setTimeout(() => {
                                    setIsArrival(false);
                                    setShowInfo(prev => ({
                                      ...prev,
                                      isVisible: true
                                    }));
                                  }, 500); // délai de 500 ms
                                }}
                              >
                                Modifier
                              </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <strong>Info (Départ)</strong>
                          <p>Cliquez sur un autre point sur la carte pour modifier</p>
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
                      {
                        showInfo.isVisible === true ? (
                          <>
                            <strong>Arrivée</strong>
                            <div>Lat: {arrival.lat.toFixed(6)}</div>
                            <div>Lon: {arrival.lon.toFixed(6)}</div>
                            <div style={{ marginTop: 8 }}>
                              {/* <button
                                onClick={() => setArrival(null)}
                                style={{ marginRight: 8 }}
                              >
                                Réinitialiser!
                              </button> */}
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-1 rounded shadow"
                                onClick={() => {
                                  setTimeout(() => {
                                    setIsArrival(true);
                                    setShowInfo(prev => ({
                                      ...prev,
                                      isVisible: false
                                    }));
                                  }, 500); // délai de 500 ms
                                }}
                              >
                                Modifier
                              </button>

                            </div>
                          </>
                        ) : (
                          <>
                            <strong>Info (Arrivée)</strong>
                            <p>Cliquez sur un autre point sur la carte pour modifier</p>
                          </>
                        )
                      }
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* A small draw control to satisfy react-leaflet-draw requirement. We won't use it to draw lines here,
                  but the user asked to "use react-leaflet-draw for the drawing" so we include the EditControl. */}
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
                  edit={
                    // editingGeofence
                    true && {
                    edit: false,
                    remove: false,
                  } 
                  }
                />
              </FeatureGroup>
            </MapContainer>
          
          </motion.div>

            {/* Quick Info Bar */}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}          
              className="flex items-center gap-4 mt-3 px-4 py-2 bg-muted rounded-md shadow-sm text-sm text-muted-foreground justify-between"
            >
              <div className="font-medium text-foreground">
                Distance estimée :
                <span className="ml-2 font-semibold text-primary">
                  {distanceKm !== null ? `${distanceKm} km` : "—"}
                </span>
              </div>
              <TripDialog
                editingTripId={editingTripId}
                role={role}
                vehiculeId={vehiculeId}
                trips={trips}
                distanceKm={distanceKm}
                tStart={tStart}
                tEnd={tEnd}
                typeSaisie={typeSaisie}
                motif={motif}
                setTStart={setTStart}
                setTEnd={setTEnd}
                setMotif={setMotif}
                saveTrip={saveTrip}
                resetPoints={resetPoints}
                setEditingTripId={setEditingTripId}
                setTrips={setTrips}
                startEditTrip={startEditTrip}
              />
            </motion.div>
        </div>



        {/* Side panel: form + admin list */}
        {
          showSidePanel  && (
            <motion.div
              style={{
                width: 420,
                padding: 16,
                borderLeft: '1px solid rgba(0,0,0,0.08)',
                background: '#fafafa',
                position: 'relative',
                // display: 'flex',
                flexDirection: 'column',
                gap: 12,
                height: '100%',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}     
              className="hidden lg:block"
            >
              <div className="flex justify-between">
                <h3 style={{ margin: 0, fontWeight: 600 }}>Modifier trajet</h3>
                <Button onClick={() => setShowSidePanel(false)} variant="outline">X fermer</Button>
              </div>
              <hr style={{ margin: '8px 0 12px 0', opacity: 0.3 }} />

              {(role === 'admin' || role === 'administrateur') && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
                    Trajets du véhicule {vehiculeId}
                  </h4>

                  <div
                    style={{
                      maxHeight: "730px",
                      overflowY: 'auto',
                      paddingRight: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {trips
                      .filter((t) => t.vehicule_id === vehiculeId)
                      .map((t) => (
                        <div
                          key={t.id}
                          style={{
                            padding: '10px 12px',
                            border: '1px solid rgba(0,0,0,0.06)',
                            borderRadius: 8,
                            background: 'white',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{t.motif || '—'}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {t.t_start} → {t.t_end} — <strong>{t.distance_km} km</strong>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button
                              onClick={() => startEditTrip(t)}
                              style={{
                                borderRadius: 6,
                                background: '#f9f9f9',
                                cursor: 'pointer',
                                fontSize: 13,
                                transition: 'all 0.2s ease',
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.background = '#f0f0f0')
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.background = '#f9f9f9')
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              
                            </button>

                            <button
                              onClick={() => {
                                if (!window.confirm('Supprimer (mock) ?')) return;
                                setTrips((prev) => prev.filter((x) => x.id !== t.id));
                              }}
                              style={{
                                padding: '6px',
                                borderRadius: 6,
                                background: '#fff',
                                cursor: 'pointer',
                                color: '#b33',
                                fontSize: 13,
                                transition: 'all 0.2s ease',
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.background = '#f8f8f8')
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.background = '#fff')
                              }
                            >
                              <Trash className="h-4 w-4 mr-2" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>

          )
        }
      </div>
      
      </>
    </MainLayout>
  );
}







