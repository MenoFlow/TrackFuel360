import { MainLayout } from '@/components/Layout/MainLayout';
import { usePleins } from '@/hooks/usePleins';
import { useVehicules } from '@/hooks/useVehicules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Fuel, Plus, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Pleins = () => {
  const navigate = useNavigate();
  const { data: pleins, isLoading: pleinsLoading } = usePleins();
  const { data: vehicules } = useVehicules();

  const getVehiculeImmat = (vehiculeId: string) => {
    return vehicules?.find(v => v.id === vehiculeId)?.immatriculation || vehiculeId;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pleins de carburant</h1>
            <p className="text-muted-foreground mt-2">
              Historique et suivi des pleins
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau plein
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Derniers pleins</CardTitle>
          </CardHeader>
          <CardContent>
            {pleinsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : pleins && pleins.length > 0 ? (
                <div className="space-y-3">
                {pleins.map((plein) => (
                  <div
                    key={plein.id} 
                    className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Fuel className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 justify-between">
                            <div className="md:flex items-center gap-2 mb-2">
                              <p className="font-semibold text-foreground">
                                {getVehiculeImmat(plein.vehicule_id)}
                              </p>
                              <Badge variant="outline">
                                {plein.type_saisie === 'auto' ? 'Auto' : 'Manuelle'}
                              </Badge>
                            </div>
                            <div className="flex items-start gap-4">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/pleins/${plein.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Détails
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium text-foreground">
                                {format(new Date(plein.date), 'dd MMM yyyy', { locale: fr })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Litres</p>
                              <p className="font-medium text-foreground">{plein.litres}L</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Prix/L</p>
                              <p className="font-medium text-foreground">${plein.prix_unitaire}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-medium text-foreground">
                                ${(plein.litres * plein.prix_unitaire).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Odomètre</p>
                              <p className="font-medium text-foreground">
                                {plein.odometre.toLocaleString('fr-FR')} km
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Station</p>
                              <p className="font-medium text-foreground">
                                {plein.station}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucun plein enregistré</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Pleins;