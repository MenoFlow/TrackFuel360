import { MainLayout } from '@/components/Layout/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { usePleins } from '@/hooks/usePleins';
import { useVehicules } from '@/hooks/useVehicules';
import { useUsers } from '@/hooks/useUsers';
import { usePleinMetadata } from '@/hooks/usePleinMetadata';
import { useGeofences } from '@/hooks/useGeofences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, MapPin, Clock, Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isPointInGeofence } from '@/lib/utils/geolocation';

const PleinDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pleins } = usePleins();
  const { data: vehicules } = useVehicules();
  const { data: users } = useUsers();
  const { data: exifMetadata } = usePleinMetadata(id);
  const { data: geofences } = useGeofences();

  const plein = pleins?.find(p => p.id === id);
  const vehicule = vehicules?.find(v => v.immatriculation === plein?.vehicule_id);
  const chauffeur = users?.find(u => u.id === plein?.chauffeur_id);
  
  // Vérifier que exifMetadata est un objet unique et non un tableau
  const metadata = Array.isArray(exifMetadata) ? null : exifMetadata;

  if (!plein) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Plein non trouvé</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Calcul des écarts et anomalies
  const dateEcart = metadata 
    ? Math.abs(new Date(plein.date).getTime() - new Date(`${metadata.date}T${metadata.heure}Z`).getTime()) / (1000 * 60 * 60)
    : 0;

  const gpsEcart = metadata && plein.latitude && plein.longitude
    ? Math.sqrt(
        Math.pow((metadata.latitude - plein.latitude) * 111, 2) +
        Math.pow((metadata.longitude - plein.longitude) * 111 * Math.cos(plein.latitude * Math.PI / 180), 2)
      )
    : 0;

  const stations = geofences?.filter(g => g.type === 'station') || [];
  const pleinDansStation = plein.latitude && plein.longitude 
    ? stations.some(s => isPointInGeofence(plein.latitude!, plein.longitude!, s.lat, s.lon, s.rayon_metres))
    : false;

  const exifDansStation = metadata 
    ? stations.some(s => isPointInGeofence(metadata.latitude, metadata.longitude, s.lat, s.lon, s.rayon_metres))
    : false;

  const hasAnomalies = dateEcart > 2 || gpsEcart > 0.5 || !pleinDansStation || !exifDansStation;

  const handleDownloadPhoto = () => {
    if (plein.photo_bon) {
      const link = document.createElement('a');
      link.href = `/src/assets/receipts/${plein.photo_bon}`;
      link.download = plein.photo_bon;
      link.click();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          {hasAnomalies ? (
            <Badge variant="destructive" className="text-base px-4 py-2 w-full sm:w-auto justify-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Plein suspect
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-base px-4 py-2 w-full sm:w-auto justify-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Plein validé
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du plein */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Données saisies {plein.type_saisie === 'auto' ? '(OCR)' : '(Manuel)'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Véhicule</p>
                <p className="font-semibold text-lg">{vehicule?.immatriculation}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Chauffeur</p>
                <p className="font-semibold">{chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : plein.chauffeur_id}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date & Heure</p>
                  <p className="font-semibold">
                    {format(new Date(plein.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Litres</p>
                  <p className="font-semibold text-lg">{plein.litres}L</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Prix unitaire</p>
                  <p className="font-semibold">${plein.prix_unitaire.toFixed(2)}/L</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Coût total</p>
                  <p className="font-semibold text-lg">${(plein.litres * plein.prix_unitaire).toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Odomètre</p>
                  <p className="font-semibold">{plein.odometre.toLocaleString()} km</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Station</p>
                  <p className="font-semibold">{plein.station || 'Non renseignée'}</p>
                </div>
              </div>

              {plein.latitude && plein.longitude && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Position GPS (saisie)
                    </p>
                    <p className="font-mono text-sm">
                      {plein.latitude.toFixed(6)}, {plein.longitude.toFixed(6)}
                    </p>
                    {pleinDansStation ? (
                      <Badge variant="secondary" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Dans une station autorisée
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="mt-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Hors station autorisée
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées EXIF */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Métadonnées EXIF (Photo)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Heure (photo)</p>
                    <p className="font-semibold">
                      {format(new Date(`${metadata.date}T${metadata.heure}Z`), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                    {dateEcart > 0 && (
                      <div className="mt-2">
                        {dateEcart < 2 ? (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Écart: {dateEcart.toFixed(1)}h
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Écart: {dateEcart.toFixed(1)}h (suspect)
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Modèle téléphone</p>
                    <p className="font-semibold">{metadata.modele_telephone}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Position GPS (photo)
                    </p>
                    <p className="font-mono text-sm">
                      {metadata.latitude.toFixed(6)}, {metadata.longitude.toFixed(6)}
                    </p>
                    {exifDansStation ? (
                      <Badge variant="secondary" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Dans une station autorisée
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="mt-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Hors station autorisée
                      </Badge>
                    )}
                    
                    {gpsEcart > 0 && (
                      <div className="mt-2">
                        {gpsEcart < 0.5 ? (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Écart GPS: {gpsEcart.toFixed(2)} km
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Écart GPS: {gpsEcart.toFixed(2)} km (suspect)
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune métadonnée EXIF disponible</p>
                  <Badge variant="destructive" className="mt-2">Suspect</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Photo du bon */}
        {plein.photo_bon && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo du bon de carburant
                </CardTitle>
                <Button onClick={handleDownloadPhoto} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center bg-muted/50 rounded-lg p-6">
                <img 
                  src={`/src/assets/receipts/${plein.photo_bon}`}
                  alt="Bon de carburant"
                  className="max-w-md w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyse d'anomalies */}
        {hasAnomalies && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Anomalies détectées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dateEcart > 2 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <span>Écart de temps important entre la photo et la saisie ({dateEcart.toFixed(1)} heures)</span>
                  </li>
                )}
                {gpsEcart > 0.5 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <span>Écart de position GPS entre la photo et la saisie ({gpsEcart.toFixed(2)} km)</span>
                  </li>
                )}
                {!pleinDansStation && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <span>Position saisie hors des stations autorisées</span>
                  </li>
                )}
                {!exifDansStation && metadata && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <span>Position EXIF de la photo hors des stations autorisées</span>
                  </li>
                )}
                {!metadata && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <span>Aucune métadonnée EXIF disponible (photo potentiellement modifiée)</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default PleinDetails;
