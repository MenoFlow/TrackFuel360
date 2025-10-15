import { MainLayout } from '@/components/Layout/MainLayout';
import { useVehicules } from '@/hooks/useVehicules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

const Vehicules = () => {
  const { data: vehicules, isLoading } = useVehicules();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        {/* Titre + sous-titre */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground">Gestion des véhicules</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {vehicules?.length || 0} véhicule(s) dans la flotte
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center md:justify-end gap-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un véhicule
          </Button>
        </div>
        </motion.div>



        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
          {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> */}
            {vehicules?.map((vehicule) => (
              <Card key={vehicule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {vehicule.immatriculation}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {vehicule.marque} {vehicule.modele}
                        </p>
                      </div>
                    </div>
                    <Badge variant={vehicule.actif ? "secondary" : "destructive"}>
                      {vehicule.actif ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground">{vehicule.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacité:</span>
                      <span className="font-medium text-foreground">{vehicule.capacite_reservoir}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conso nominale:</span>
                      <span className="font-medium text-foreground">
                        {vehicule.consommation_nominale}L/100km
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() =>  navigate(`/vehicle/${vehicule.id}`)}>
                    Voir détails
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/addTrips")} className="w-full mt-4">
                    Trajets
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      {/* </div> */}
      </motion.div>
    </MainLayout>
  );
};

export default Vehicules;