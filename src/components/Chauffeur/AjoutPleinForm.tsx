import { useState } from 'react';
import { Vehicule } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useChauffeurAccess } from '@/hooks/useChauffeurAccess';
import { useVehicules } from '@/hooks/useVehicules';
import { useAffectations } from '@/hooks/useAffectations';
import { useCreatePlein } from '@/hooks/usePleins';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogOut, Camera } from 'lucide-react';
import { OfflineSyncIndicator } from '@/components/Chauffeur/OfflineSyncIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import Header from './Header';

export default function AjoutPleinForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, filterVehiculesForDriver } = useChauffeurAccess();
  const { data: allVehicules } = useVehicules();
  const { data: affectations } = useAffectations();
  const createPlein = useCreatePlein();
  const isOnline = useOnlineStatus();

  const [vehiculeId, setVehiculeId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [litres, setLitres] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [odometre, setOdometre] = useState('');
  const [station, setStation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  if (!currentUser) return null;

  const mesVehicules: Vehicule[] = allVehicules && affectations 
  ? filterVehiculesForDriver(allVehicules, affectations) 
  : [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      await createPlein.mutateAsync({
        vehicule_id: Number(vehiculeId),
        chauffeur_id: currentUser?.id || 0,
        date,
        litres: parseFloat(litres),
        prix_unitaire: parseFloat(prixUnitaire),
        odometre: parseInt(odometre),
        station,
        photo_bon: photo || undefined,
        type_saisie: 'manuelle',
        latitude: null,
        longitude: null,
      } as any);
  
      toast({
        title: isOnline ? t('driver.fuelRecorded') : t('offline.status.savedLocally'),
        description: isOnline ? t('driver.fuelRecordedDesc') : t('offline.willSyncLater'),
      });
  
      navigate('/chauffeur');
    } catch (error: any) {
      // ODOMÈTRE INVALIDE
      if (error.details?.error === 'Odomètre invalide') {
        toast({
          title: t('fuel.odometerInvalid'),
          description: t('fuel.lastOdometerWas', { 
            odo: error.details.dernier_odometre 
          }),
          variant: 'destructive',
          duration: 8000,
        });
        return;
      }
  
      // AUTRES ERREURS
      toast({
        title: t('errors.generic'),
        description: error.message || t('errors.tryAgain'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header currentUser={currentUser} logout={logout} isDashboard={false} />

      <div className="mx-12 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('driver.newFuelTitle')}</CardTitle>
            <CardDescription>
              {t('driver.newFuelDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isOnline && (
              <Alert className="mb-4">
                <AlertDescription>
                  {t('offline.workingOffline')}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vehiculeId">{t('reports.vehicle')}</Label>
                <Select value={vehiculeId} onValueChange={setVehiculeId} required>
                  <SelectTrigger id="vehiculeId">
                    <SelectValue placeholder={t('driver.selectVehicle')} />
                  </SelectTrigger>
                  <SelectContent>
                    {mesVehicules.map((v) => (
                      <SelectItem key={v.id} value={(v.id).toString()}>
                        {v.immatriculation} - {v.marque} {v.modele}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t('driver.fuelDate')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odometre">{t('fuel.odometer')} (km)</Label>
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
                  <Label htmlFor="litres">{t('fuel.liters')}</Label>
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
                  <Label htmlFor="prixUnitaire">{t('fuel.pricePerLiter')}</Label>
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
                <Label htmlFor="station">{t('fuel.station')}</Label>
                <Input
                  id="station"
                  type="text"
                  placeholder="Total - Avenue Mohammed V"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">{t('driver.receiptPhoto')}</Label>
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
                        {t('driver.changePhoto')}
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
                        {t('driver.takePhoto')}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/chauffeur')} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createPlein.isPending} className="flex-1">
                  {createPlein.isPending ? t('driver.recording') : t('driver.recordFuel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
