import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChauffeurAccess } from '@/hooks/useChauffeurAccess';
import { usePleins } from '@/hooks/usePleins';
import { useTrajets } from '@/hooks/useTrajets';
import { useCreateCorrection } from '@/hooks/useCorrections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogOut } from 'lucide-react';
import { OfflineSyncIndicator } from '@/components/Chauffeur/OfflineSyncIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import Header from './Header';

export default function DemandeCorrectionForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, filterDataForDriver } = useChauffeurAccess();
  const { data: allPleins } = usePleins();
  const { data: allTrajets } = useTrajets();
  const createCorrection = useCreateCorrection();
  const isOnline = useOnlineStatus();

  const [type, setType] = useState<'plein' | 'trajet'>('plein');
  const [itemId, setItemId] = useState('');
  const [justification, setJustification] = useState('');

  if (!currentUser) return null;

  const mesPleins = allPleins ? filterDataForDriver(allPleins) : [];
  const mesTrajets = allTrajets ? filterDataForDriver(allTrajets) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCorrection.mutateAsync({
        table: type === 'plein' ? 'pleins' : 'trajets',
        record_id: itemId,
        champ: 'correction_demandee',
        old_value: justification,
        new_value: justification,
        status: 'pending',
        comment: justification,
        requested_by: currentUser?.id || '',
      });

      toast({
        title: isOnline ? t('driver.requestSent') : t('offline.status.savedLocally'),
        description: isOnline ? t('driver.requestSentDesc') : t('offline.willSyncLater'),
      });

      navigate('/chauffeur');
    } catch (error) {
      toast({
        title: t('errors.generic'),
        description: String(error),
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
            <CardTitle>{t('driver.correctionRequestTitle')}</CardTitle>
            <CardDescription>
              {t('driver.correctionRequestDesc')}
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
                <Label htmlFor="type">{t('driver.correctionType')}</Label>
                <Select value={type} onValueChange={(v) => setType(v as 'plein' | 'trajet')}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plein">{t('driver.fuelCorrection')}</SelectItem>
                    <SelectItem value="trajet">{t('driver.tripCorrection')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemId">
                  {type === 'plein' ? t('driver.selectFuel') : t('driver.selectTrip')}
                </Label>
                <Select value={itemId} onValueChange={setItemId} required>
                  <SelectTrigger id="itemId">
                    <SelectValue placeholder={t('driver.choose')} />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'plein' ? (
                      mesPleins.map((plein) => (
                        <SelectItem key={plein.id} value={plein.id}>
                          {new Date(plein.date).toLocaleDateString('fr-FR')} - {plein.litres}L - {plein.station || t('driver.unknownStation')}
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
                <Label htmlFor="justification">{t('driver.correctionJustification')}</Label>
                <Textarea
                  id="justification"
                  placeholder={t('driver.correctionJustificationPlaceholder')}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/chauffeur')} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createCorrection.isPending} className="flex-1">
                  {createCorrection.isPending ? t('driver.sending') : t('driver.sendRequest')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
