import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChauffeurAccess } from '@/hooks/useChauffeurAccess';
import { useVehicules } from '@/hooks/useVehicules';
import { mockAffectations } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LogOut, Camera } from 'lucide-react';

export default function AjoutPleinForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, filterVehiculesForDriver } = useChauffeurAccess();
  const { data: allVehicules } = useVehicules();

  const [vehiculeId, setVehiculeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [litres, setLitres] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [odometre, setOdometre] = useState('');
  const [station, setStation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const mesVehicules = allVehicules ? filterVehiculesForDriver(allVehicules, mockAffectations) : [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation de l'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Plein enregistré',
      description: 'Votre plein de carburant a été enregistré avec succès.',
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
              <p className="text-xs text-muted-foreground">Ajouter un plein</p>
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
            <CardTitle>Nouveau plein de carburant</CardTitle>
            <CardDescription>
              Enregistrez un nouveau plein avec photo du bon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vehiculeId">Véhicule</Label>
                <Select value={vehiculeId} onValueChange={setVehiculeId} required>
                  <SelectTrigger id="vehiculeId">
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesVehicules.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.immatriculation} - {v.marque} {v.modele}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date du plein</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odometre">Odomètre (km)</Label>
                  <Input
                    id="odometre"
                    type="number"
                    placeholder="125000"
                    value={odometre}
                    onChange={(e) => setOdometre(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="litres">Litres</Label>
                  <Input
                    id="litres"
                    type="number"
                    step="0.01"
                    placeholder="45.5"
                    value={litres}
                    onChange={(e) => setLitres(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prixUnitaire">Prix unitaire ($/L)</Label>
                  <Input
                    id="prixUnitaire"
                    type="number"
                    step="0.001"
                    placeholder="1.850"
                    value={prixUnitaire}
                    onChange={(e) => setPrixUnitaire(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="station">Station (optionnel)</Label>
                <Input
                  id="station"
                  type="text"
                  placeholder="Total - Avenue Mohammed V"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo du bon de carburant</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {photo ? (
                    <div>
                      <p className="text-sm font-medium text-foreground">{photo.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => document.getElementById('photo')?.click()}
                      >
                        Changer la photo
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('photo')?.click()}
                      className="flex flex-col items-center gap-2"
                    >
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Prendre une photo du bon
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/chauffeur')} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer le plein'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
