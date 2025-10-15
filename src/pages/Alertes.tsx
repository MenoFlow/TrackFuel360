import { MainLayout } from '@/components/Layout/MainLayout';
import { useAlertes } from '@/hooks/useAlertes';
import { useVehicules } from '@/hooks/useVehicules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlerteType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { mockPleins } from '@/lib/data/mockData.fuel';

const alerteTypeLabels: Record<AlerteType, string> = {
  consommation_elevee: 'Consommation élevée',
  plein_hors_zone: 'Plein hors zone',
  doublon_bon: 'Doublon de bon',
  distance_gps_ecart: 'Écart GPS',
  immobilisation_anormale: 'Immobilisation anormale',
  carburant_disparu: 'Carburant disparu',
  plein_suspect: 'Plein suspect',
};

const Alertes = () => {
  const navigate = useNavigate();
  const { data: alertes, isLoading } = useAlertes();
  const { data: vehicules } = useVehicules();

  const getVehiculeImmat = (vehiculeId: string) => {
    return vehicules?.find(v => v.id === vehiculeId)?.immatriculation || vehiculeId;
  };

  const getPleinIdForAlerte = (alerte: any) => {
    // Chercher un plein correspondant à l'alerte
    const plein = mockPleins.find(p => 
      p.vehicule_id === alerte.vehicule_id && 
      new Date(p.date).toDateString() === new Date(alerte.date_detection).toDateString()
    );
    return plein?.id;
  };

  const getAlerteSeverityColor = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'default';
    return 'secondary';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Titre + sous-titre */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-foreground">Alertes</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {alertes?.length || 0} alerte(s) détectée(s)
            </p>
          </div>

          {/* Bouton filtrer */}
          <div className="flex justify-center sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </div>
 

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : alertes && alertes.length > 0 ? (
          <div className="space-y-4">
            {alertes.map((alerte) => (
              <Card key={alerte.id}>
                <CardContent className="p-6">
                  <div className=" items-start sm:items-left sm:text-left sm:justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        alerte.score >= 80 ? 'bg-destructive/10' : 
                        alerte.score >= 60 ? 'bg-yellow-500/10' : 
                        'bg-secondary'
                      }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                          alerte.score >= 80 ? 'text-destructive' : 
                          alerte.score >= 60 ? 'text-yellow-600' : 
                          'text-muted-foreground'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className='md:flex items-center text-center sm:justify-between'>
                          {/* Titre + Badges */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-foreground truncate">
                              {alerte.titre}
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                              <Badge variant={getAlerteSeverityColor(alerte.score)}>
                                Score: {alerte.score}
                              </Badge>
                              <Badge variant="outline">
                                {alerteTypeLabels[alerte.type]}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4 mb-4 sm:mt-0 sm:flex-nowrap sm:items-start sm:justify-end">
                            {(alerte.type === 'plein_suspect' || alerte.type === 'plein_hors_zone') && getPleinIdForAlerte(alerte) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/pleins/${getPleinIdForAlerte(alerte)}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Voir preuve
                              </Button>
                            )}
                            {alerte.status === 'new' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <p className='hidden md:block'>Résoudre</p>
                                </Button>
                                <Button variant="outline" size="sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  <p className='hidden md:block'>Ignorer</p>
                                </Button>
                              </>
                            )}
                            {alerte.status === 'resolved' && (
                              <Badge variant="secondary">Résolue</Badge>
                            )}
                          </div>
                        </div>


                        {/* Description */}
                        <p className="text-muted-foreground mb-4">{alerte.description}</p>

                        {/* Métadonnées */}
                        <div className="grid grid-cols-1 text-sm mb-3">
                          <span className="text-muted-foreground">
                            Véhicule: <span className="font-medium text-foreground">
                              {getVehiculeImmat(alerte.vehicule_id)}
                            </span>
                          </span>
                          {alerte.chauffeur_id && (
                            <span className="text-muted-foreground">
                              Chauffeur: <span className="font-medium text-foreground">
                                {alerte.chauffeur_id}
                              </span>
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            Détecté le: <span className="font-medium text-foreground">
                              {format(new Date(alerte.date_detection), 'dd MMM yyyy HH:mm', { locale: fr })}
                            </span>
                          </span>
                        </div>
                        

                        {/* Détails d'écart */}
                        {(alerte.deviation_percent !== undefined || alerte.litres_manquants !== undefined) && (
                          <div className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                            <div className="flex flex-col sm:flex-row gap-4 text-sm">
                              {alerte.deviation_percent !== undefined && alerte.deviation_percent > 0 && (
                                <span className="text-destructive font-semibold">
                                  Écart: +{alerte.deviation_percent.toFixed(1)}%
                                </span>
                              )}
                              {alerte.litres_manquants !== undefined && alerte.litres_manquants > 0 && (
                                <span className="text-destructive font-semibold">
                                  Carburant manquant: {alerte.litres_manquants.toFixed(1)}L
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                    
                    

                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune alerte active</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Alertes;