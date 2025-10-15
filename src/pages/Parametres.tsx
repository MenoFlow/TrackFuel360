import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, MapPin, Bell, Database } from 'lucide-react';

const Parametres = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Créer et gérer les comptes utilisateurs et leurs rôles',
      icon: Users,
      action: () => navigate('/parametres/utilisateurs'),
    },
    {
      title: 'Sites et dépôts',
      description: 'Configurer les sites, dépôts et stations autorisées',
      icon: MapPin,
      action: () => navigate('/geofences'),
    },
    {
      title: 'Notifications',
      description: 'Paramétrer les alertes et les seuils de détection',
      icon: Bell,
    },
    {
      title: 'Import/Export',
      description: 'Importer des données en lot (Excel) ou exporter la base',
      icon: Database,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className='flex flex-col items-center text-center sm:items-start sm:text-start'>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground mt-2">
            Configuration et administration de l'application
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={section.action}
                    disabled={!section.action}
                  >
                    Configurer
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Parametres;