import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChauffeurAccess } from '@/hooks/useChauffeurAccess';
import { usePleins } from '@/hooks/usePleins';
import { useTrajets } from '@/hooks/useTrajets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function DemandeCorrectionForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, filterDataForDriver } = useChauffeurAccess();
  const { data: allPleins } = usePleins();
  const { data: allTrajets } = useTrajets();

  const [type, setType] = useState<'plein' | 'trajet'>('plein');
  const [itemId, setItemId] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const mesPleins = allPleins ? filterDataForDriver(allPleins) : [];
  const mesTrajets = allTrajets ? filterDataForDriver(allTrajets) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation de l'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Demande envoyée',
      description: 'Votre demande de correction a été envoyée avec succès.',
    });

    setIsSubmitting(false);
    navigate('/chauffeur');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/chauffeur')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">TrackFuel360</h1>
              <p className="text-xs text-muted-foreground">Demande de correction</p>
            </div>
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

      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Demande de correction</CardTitle>
            <CardDescription>
              Demandez la correction d'un trajet ou d'un plein de carburant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type de correction</Label>
                <Select value={type} onValueChange={(v) => setType(v as 'plein' | 'trajet')}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plein">Plein de carburant</SelectItem>
                    <SelectItem value="trajet">Trajet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemId">
                  {type === 'plein' ? 'Sélectionner le plein' : 'Sélectionner le trajet'}
                </Label>
                <Select value={itemId} onValueChange={setItemId} required>
                  <SelectTrigger id="itemId">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'plein' ? (
                      mesPleins.map((plein) => (
                        <SelectItem key={plein.id} value={plein.id}>
                          {new Date(plein.date).toLocaleDateString('fr-FR')} - {plein.litres}L - {plein.station || 'Station inconnue'}
                        </SelectItem>
                      ))
                    ) : (
                      mesTrajets.map((trajet) => (
                        <SelectItem key={trajet.id} value={trajet.id}>
                          {new Date(trajet.date_debut).toLocaleDateString('fr-FR')} - {trajet.distance_km}km
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justification de la correction</Label>
                <Textarea
                  id="justification"
                  placeholder="Expliquez pourquoi cette correction est nécessaire..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/chauffeur')} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
