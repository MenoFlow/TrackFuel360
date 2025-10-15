import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useUsers';
import { useCorrections, useValidateCorrection, useRejectCorrection } from '@/hooks/useCorrections';
import { usePleins } from '@/hooks/usePleins';
import { useVehicules } from '@/hooks/useVehicules';
import { mockUsers } from '@/lib/mockData';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CorrectionDetailsDialog from '@/components/Corrections/CorrectionDetailsDialog';
import { validateCorrectionPlein, ValidationResult } from '@/lib/utils/correctionValidation';
import { Correction, CorrectionStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  AlertCircle, 
  Filter,
  Calendar,
  User,
  FileEdit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { hasPermission } from '@/hooks/useUsers';

const GestionCorrections = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: corrections, isLoading: isLoadingCorrections } = useCorrections();
  const { data: pleins } = usePleins();
  const { data: vehicules } = useVehicules();
  const validateMutation = useValidateCorrection();
  const rejectMutation = useRejectCorrection();
  const { toast } = useToast();

  const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | undefined>();

  // Filtres
  const [statusFilter, setStatusFilter] = useState<CorrectionStatus | 'all'>('all');
  const [vehiculeFilter, setVehiculeFilter] = useState<string>('all');
  const [chauffeurFilter, setChauffeurFilter] = useState<string>('all');

  // Vérification des permissions
  if (!currentUser || !hasPermission(currentUser, 'manage_corrections')) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Accès refusé</CardTitle>
              <CardDescription>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleOpenDetails = (correction: Correction) => {
    setSelectedCorrection(correction);
    
    // Calculer la validation si c'est une correction de plein
    if (correction.table === 'plein') {
      const plein = pleins?.find(p => p.id === correction.record_id);
      const vehicule = vehicules?.find(v => v.id === plein?.vehicule_id);
      
      if (plein && vehicule && pleins) {
        const previousPleins = pleins.filter(p => p.vehicule_id === vehicule.id);
        const result = validateCorrectionPlein(correction, plein, vehicule, previousPleins);
        setValidationResult(result);
      }
    }
    
    setDetailsOpen(true);
  };

  const handleValidate = async (correctionId: string, comment: string) => {
    try {
      await validateMutation.mutateAsync({
        id: correctionId,
        validated_by: currentUser?.id || 'admin'
      });
      
      toast({
        title: 'Correction validée',
        description: 'La correction a été validée avec succès.',
      });
      
      setDetailsOpen(false);
      setSelectedCorrection(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de valider la correction.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (correctionId: string, comment: string) => {
    try {
      await rejectMutation.mutateAsync({
        id: correctionId,
        validated_by: currentUser?.id || 'admin'
      });
      
      toast({
        title: 'Correction rejetée',
        description: 'La correction a été rejetée.',
        variant: 'destructive',
      });
      
      setDetailsOpen(false);
      setSelectedCorrection(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la correction.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: CorrectionStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> En attente
          </Badge>
        );
      case 'validated':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" /> Validée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejetée
          </Badge>
        );
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      litres: 'Litres',
      odometre: 'Odomètre',
      prix_unitaire: 'Prix unitaire',
      station: 'Station',
      date: 'Date'
    };
    return labels[field] || field;
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.prenom} ${user.nom}` : userId;
  };

  // Filtrage des corrections
  const filteredCorrections = corrections?.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    
    if (vehiculeFilter !== 'all') {
      const plein = pleins?.find(p => p.id === c.record_id);
      if (plein?.vehicule_id !== vehiculeFilter) return false;
    }
    
    if (chauffeurFilter !== 'all') {
      const plein = pleins?.find(p => p.id === c.record_id);
      if (plein?.chauffeur_id !== chauffeurFilter) return false;
    }
    
    return true;
  });

  const pendingCount = corrections?.filter(c => c.status === 'pending').length || 0;
  const validatedCount = corrections?.filter(c => c.status === 'validated').length || 0;
  const rejectedCount = corrections?.filter(c => c.status === 'rejected').length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className='flex flex-col text-center sm:text-left'>
          <h1 className="text-3xl font-bold tracking-tight">Corrections</h1>
          <p className="text-muted-foreground text-truncated">
            Validez ou rejetez les corrections proposées par les utilisateurs
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Corrections à traiter
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validées</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{validatedCount}</div>
              <p className="text-xs text-muted-foreground">
                Corrections acceptées
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">
                Corrections refusées
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CorrectionStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="validated">Validées</SelectItem>
                    <SelectItem value="rejected">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Véhicule</Label>
                <Select value={vehiculeFilter} onValueChange={setVehiculeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les véhicules</SelectItem>
                    {vehicules?.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.immatriculation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chauffeur</Label>
                <Select value={chauffeurFilter} onValueChange={setChauffeurFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les chauffeurs</SelectItem>
                    {mockUsers
                      .filter(u => u.role === 'driver')
                      .map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.prenom} {u.nom}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des corrections */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Corrections ({filteredCorrections?.length || 0})
          </h2>

          {isLoadingCorrections ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCorrections && filteredCorrections.length > 0 ? (
            <div className="space-y-4">
              {filteredCorrections.map((correction) => {
                const plein = pleins?.find(p => p.id === correction.record_id);
                const vehicule = vehicules?.find(v => v.id === plein?.vehicule_id);

                return (
                  <Card key={correction.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className='flex justify-between'>
                            <div className="flex items-center gap-3">
                              <FileEdit className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-semibold">
                                  Correction #{correction.id} - {getFieldLabel(correction.champ)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Plein {correction.record_id}
                                  {vehicule && ` - ${vehicule.immatriculation}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3 ml-4">
                              {getStatusBadge(correction.status)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDetails(correction)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Détails
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Demandeur: {getUserName(correction.requested_by)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(correction.requested_at), 'PPp', { locale: fr })}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Ancienne:</span>
                              <Badge variant="outline" className="font-mono text-red-600 line-through">
                                {correction.old_value}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">→</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Nouvelle:</span>
                              <Badge variant="outline" className="font-mono text-green-600 font-semibold">
                                {correction.new_value}
                              </Badge>
                            </div>
                          </div>

                          {correction.comment && (
                            <p className="text-sm italic text-muted-foreground bg-muted/30 p-2 rounded">
                              "{correction.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune correction trouvée</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de détails */}
      {selectedCorrection && (
        <CorrectionDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          correction={selectedCorrection}
          plein={pleins?.find(p => p.id === selectedCorrection.record_id)}
          vehicule={vehicules?.find(v => 
            v.id === pleins?.find(p => p.id === selectedCorrection.record_id)?.vehicule_id
          )}
          validationResult={validationResult}
          onValidate={handleValidate}
          onReject={handleReject}
          isLoading={validateMutation.isPending || rejectMutation.isPending}
        />
      )}
    </MainLayout>
  );
};

export default GestionCorrections;
