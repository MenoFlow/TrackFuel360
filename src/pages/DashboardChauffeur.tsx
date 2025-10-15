import { useChauffeurAccess } from '@/hooks/useChauffeurAccess';
import { useVehicules } from '@/hooks/useVehicules';
import { usePleins } from '@/hooks/usePleins';
import { useTrajets } from '@/hooks/useTrajets';
import { useAlertes } from '@/hooks/useAlertes';
import { mockAffectations } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Fuel, Route, AlertTriangle, Plus, FileEdit, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardChauffeur() {
  const { currentUser, logout, filterVehiculesForDriver, filterDataForDriver } = useChauffeurAccess();
  const { data: allVehicules, isLoading: vehiculesLoading } = useVehicules();
  const { data: allPleins, isLoading: pleinsLoading } = usePleins();
  const { data: allTrajets, isLoading: trajetsLoading } = useTrajets();
  const { data: allAlertes, isLoading: alertesLoading } = useAlertes();

  if (!currentUser) {
    return null;
  }

  // Filtrer les données pour le chauffeur
  const mesVehicules = allVehicules ? filterVehiculesForDriver(allVehicules, mockAffectations) : [];
  const mesPleins = allPleins ? filterDataForDriver(allPleins) : [];
  const mesTrajets = allTrajets ? filterDataForDriver(allTrajets) : [];
  const mesAlertes = allAlertes ? allAlertes.filter(a => 
    a.chauffeur_id === currentUser.id
  ) : [];

  const isLoading = vehiculesLoading || pleinsLoading || trajetsLoading || alertesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">TrackFuel360</h1>
            <p className="text-sm text-muted-foreground">Espace Chauffeur</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{currentUser.prenom} {currentUser.nom}</p>
              <p className="text-xs text-muted-foreground">{currentUser.matricule}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Bienvenue */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">Bonjour {currentUser.prenom} !</h2>
          <p className="text-muted-foreground mt-2">Voici un résumé de votre activité</p>
        </div>

        {/* Actions rapides */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/chauffeur/ajouter-plein">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Ajouter un plein</h3>
                  <p className="text-sm text-muted-foreground">Enregistrer un nouveau plein de carburant</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/chauffeur/demande-correction">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <FileEdit className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Demande de correction</h3>
                  <p className="text-sm text-muted-foreground">Corriger un trajet ou un plein</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                Mes véhicules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{mesVehicules.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Véhicules assignés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                Pleins ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{mesPleins.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Pleins enregistrés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                Trajets ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{mesTrajets.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {mesTrajets.reduce((sum, t) => sum + t.distance_km, 0).toFixed(0)} km parcourus
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mes véhicules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Mes véhicules assignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mesVehicules.length > 0 ? (
              <div className="space-y-3">
                {mesVehicules.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{v.immatriculation}</p>
                      <p className="text-sm text-muted-foreground">{v.marque} {v.modele}</p>
                    </div>
                    <Badge variant={v.actif ? "default" : "secondary"}>
                      {v.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucun véhicule assigné</p>
            )}
          </CardContent>
        </Card>

        {/* Alertes me concernant */}
        {mesAlertes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes me concernant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mesAlertes.slice(0, 5).map((alerte) => (
                  <div key={alerte.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{alerte.titre}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alerte.description}</p>
                      </div>
                      <Badge variant={alerte.score > 70 ? "destructive" : "secondary"}>
                        Score: {alerte.score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
