import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Vehicule } from '@/types';
import { useSites } from '@/hooks/useSites';
import { useCreateVehicule, useUpdateVehicule } from '@/hooks/useVehicules';

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicule?: Vehicule;
}

export function VehicleDialog({ open, onOpenChange, vehicule }: VehicleDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: sites } = useSites();
  const createVehicule = useCreateVehicule();
  const updateVehicule = useUpdateVehicule();

  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    type: 'essence' as 'essence' | 'diesel' | 'hybride' | 'electrique' | 'gpl',
    capacite_reservoir: '',
    consommation_nominale: '',
    carburant_initial: '',
    actif: true,
    site_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicule) {
      setFormData({
        immatriculation: vehicule.immatriculation,
        marque: vehicule.marque,
        modele: vehicule.modele,
        type: vehicule.type as 'essence' | 'diesel' | 'hybride' | 'electrique' | 'gpl',
        capacite_reservoir: vehicule.capacite_reservoir.toString(),
        consommation_nominale: vehicule.consommation_nominale.toString(),
        carburant_initial: vehicule.carburant_initial?.toString() || '0',
        actif: vehicule.actif,
        site_id: vehicule.site_id || '',
      });
    } else {
      setFormData({
        immatriculation: '',
        marque: '',
        modele: '',
        type: 'essence' as const,
        capacite_reservoir: '',
        consommation_nominale: '',
        carburant_initial: '0',
        actif: true,
        site_id: '',
      });
    }
    setErrors({});
  }, [vehicule, open]);

  const validateImmatriculation = (value: string): boolean => {
    // Regex pour autoriser uniquement lettres, chiffres, tirets et underscores
    // Pas de caractères spéciaux qui pourraient casser une URL (/, ?, &, #, etc.)
    const regex = /^[A-Za-z0-9\-_]+$/;
    return regex.test(value);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.immatriculation.trim()) {
      newErrors.immatriculation = t('validation.required');
    } else if (!validateImmatriculation(formData.immatriculation)) {
      newErrors.immatriculation = 'Immatriculation invalide. Utilisez uniquement des lettres, chiffres, tirets et underscores.';
    }

    if (!formData.marque.trim()) {
      newErrors.marque = t('validation.required');
    }

    if (!formData.modele.trim()) {
      newErrors.modele = t('validation.required');
    }

    const capacite = parseFloat(formData.capacite_reservoir);
    if (!formData.capacite_reservoir || isNaN(capacite) || capacite <= 0) {
      newErrors.capacite_reservoir = 'La capacité doit être supérieure à 0';
    }

    const consommation = parseFloat(formData.consommation_nominale);
    if (!formData.consommation_nominale || isNaN(consommation) || consommation <= 0) {
      newErrors.consommation_nominale = 'La consommation doit être supérieure à 0';
    }

    const carburantInit = parseFloat(formData.carburant_initial);
    if (formData.carburant_initial && (isNaN(carburantInit) || carburantInit < 0)) {
      newErrors.carburant_initial = 'Le carburant initial doit être positif ou nul';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const vehiculeData = {
        immatriculation: formData.immatriculation.trim(),
        marque: formData.marque.trim(),
        modele: formData.modele.trim(),
        type: formData.type,
        capacite_reservoir: parseFloat(formData.capacite_reservoir),
        consommation_nominale: parseFloat(formData.consommation_nominale),
        carburant_initial: formData.carburant_initial ? parseFloat(formData.carburant_initial) : 0,
        actif: formData.actif,
        site_id: formData.site_id || undefined,
      };

      if (vehicule) {
        await updateVehicule.mutateAsync({
          id: vehicule.id,
          data: vehiculeData,
        });
        toast({
          title: t('vehicles.updateSuccess'),
          description: `${vehiculeData.immatriculation} a été mis à jour`,
        });
      } else {
        await createVehicule.mutateAsync(vehiculeData);
        toast({
          title: t('vehicles.createSuccess'),
          description: `${vehiculeData.immatriculation} a été ajouté`,
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehicule ? t('vehicles.editVehicle') : t('vehicles.addVehicle')}
          </DialogTitle>
          <DialogDescription>
            {vehicule 
              ? 'Modifiez les informations du véhicule' 
              : 'Ajoutez un nouveau véhicule à la flotte'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Immatriculation */}
            <div className="space-y-2">
              <Label htmlFor="immatriculation">
                {t('vehicles.registration')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="immatriculation"
                value={formData.immatriculation}
                onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                placeholder="Ex: ABC-123"
                disabled={!!vehicule} // Immatriculation non modifiable en édition
                className={errors.immatriculation ? 'border-destructive' : ''}
              />
              {errors.immatriculation && (
                <p className="text-sm text-destructive">{errors.immatriculation}</p>
              )}
            </div>

            {/* Marque */}
            <div className="space-y-2">
              <Label htmlFor="marque">
                {t('vehicles.brand')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="marque"
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                placeholder="Ex: Toyota"
                className={errors.marque ? 'border-destructive' : ''}
              />
              {errors.marque && (
                <p className="text-sm text-destructive">{errors.marque}</p>
              )}
            </div>

            {/* Modèle */}
            <div className="space-y-2">
              <Label htmlFor="modele">
                {t('vehicles.model')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="modele"
                value={formData.modele}
                onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                placeholder="Ex: Corolla"
                className={errors.modele ? 'border-destructive' : ''}
              />
              {errors.modele && (
                <p className="text-sm text-destructive">{errors.modele}</p>
              )}
            </div>

            {/* Type de carburant */}
            <div className="space-y-2">
              <Label htmlFor="type">
                {t('vehicles.type')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essence">Essence</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybride">Hybride</SelectItem>
                  <SelectItem value="electrique">Électrique</SelectItem>
                  <SelectItem value="gpl">GPL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Capacité réservoir */}
            <div className="space-y-2">
              <Label htmlFor="capacite_reservoir">
                {t('vehicles.tankCapacity')} (L) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacite_reservoir"
                type="number"
                step="0.01"
                value={formData.capacite_reservoir}
                onChange={(e) => setFormData({ ...formData, capacite_reservoir: e.target.value })}
                placeholder="Ex: 50"
                className={errors.capacite_reservoir ? 'border-destructive' : ''}
              />
              {errors.capacite_reservoir && (
                <p className="text-sm text-destructive">{errors.capacite_reservoir}</p>
              )}
            </div>

            {/* Consommation nominale */}
            <div className="space-y-2">
              <Label htmlFor="consommation_nominale">
                {t('vehicles.nominalConsumption')} (L/100km) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="consommation_nominale"
                type="number"
                step="0.01"
                value={formData.consommation_nominale}
                onChange={(e) => setFormData({ ...formData, consommation_nominale: e.target.value })}
                placeholder="Ex: 7.5"
                className={errors.consommation_nominale ? 'border-destructive' : ''}
              />
              {errors.consommation_nominale && (
                <p className="text-sm text-destructive">{errors.consommation_nominale}</p>
              )}
            </div>

            {/* Carburant initial */}
            <div className="space-y-2">
              <Label htmlFor="carburant_initial">
                Carburant initial (L)
              </Label>
              <Input
                id="carburant_initial"
                type="number"
                step="0.01"
                value={formData.carburant_initial}
                onChange={(e) => setFormData({ ...formData, carburant_initial: e.target.value })}
                placeholder="Ex: 0"
                className={errors.carburant_initial ? 'border-destructive' : ''}
              />
              {errors.carburant_initial && (
                <p className="text-sm text-destructive">{errors.carburant_initial}</p>
              )}
            </div>

            {/* Site */}
            <div className="space-y-2">
              <Label htmlFor="site_id">Site</Label>
              <Select
                value={formData.site_id}
                onValueChange={(value) => setFormData({ ...formData, site_id: value })}
              >
                <SelectTrigger id="site_id">
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucun">Aucun site</SelectItem>
                  {sites?.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statut actif */}
          <div className="flex items-center space-x-2">
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
            />
            <Label htmlFor="actif" className="cursor-pointer">
              {t('vehicles.active')}
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? t('common.saving') 
                : vehicule 
                  ? t('common.update') 
                  : t('common.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
