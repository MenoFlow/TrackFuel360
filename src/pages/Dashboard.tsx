import { MainLayout } from '@/components/Layout/MainLayout';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useAlertes } from '@/hooks/useAlertes';
import { Car, Fuel, AlertTriangle, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FleetMap } from "./fleet-map";
import { TabsContent } from '@radix-ui/react-tabs';
import { mockVehicules } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alertes, isLoading: alertesLoading } = useAlertes('new');
  const navigate = useNavigate();


  if (statsLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}          
        className="flex flex-col items-center text-center sm:items-start sm:text-left"
        >
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de votre flotte
          </p>
        </motion.div>


        {/* Stats principales */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}        
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatsCard
            title="Véhicules actifs"
            value={`${stats?.vehicules_actifs}/${stats?.total_vehicules}`}
            icon={Car}
            subtitle="Flotte totale"
          />
          <StatsCard
            title="Alertes actives"
            value={stats?.alertes_actives || 0}
            icon={AlertTriangle}
            subtitle="Nécessitent une action"
          />
          <StatsCard
            title="Coût carburant (mois)"
            value={`${stats?.cout_carburant_mois.toLocaleString('fr-FR')} $`}
            icon={DollarSign}
            subtitle={`${stats?.litres_mois.toLocaleString('fr-FR')} L consommés`}
          />
          <StatsCard
            title="Consommation moyenne"
            value={`${stats?.consommation_moyenne_flotte.toFixed(1)} L`}
            icon={Activity}
            subtitle={`${stats?.distance_mois_km.toLocaleString('fr-FR')} km parcourus en moyenne par mois`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}  
        >
          <FleetMap vehicles={mockVehicules} onVehicleSelect={(v) => navigate(`/vehicle/${v.id}`)} />
        </motion.div>


        {/* Top véhicules à forte consommation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} 
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Véhicules à forte consommation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_vehicules_consommation.map((v) => (
                  <div key={v.vehicule_id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{v.immatriculation}</p>
                        <p className="text-sm text-muted-foreground">{v.consommation.toFixed(1)} L/100km</p>
                      </div>
                    </div>
                    <Badge variant={v.ecart_pourcentage > 20 ? "destructive" : "secondary"}>
                      +{v.ecart_pourcentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Alertes récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertesLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : alertes && alertes.length > 0 ? (
              <div className="space-y-3">
                {alertes.slice(0, 5).map((alerte) => (
                  <div key={alerte.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{alerte.titre}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alerte.description}</p>
                      </div>
                      <Badge 
                        variant={alerte.score > 70 ? "destructive" : "secondary"}
                        className="ml-2"
                      >
                        Score: {alerte.score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucune alerte active</p>
            )}
          </CardContent>
        </Card>

        {/* <TabsContent value="map" className="space-y-4"> */}
        {/* </TabsContent> */}
      </div>
    </MainLayout>
  );
};

export default Dashboard;