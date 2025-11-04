import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateAffectation, useUpdateAffectation } from '@/hooks/useAffectations';
import { useVehicules } from '@/hooks/useVehicules';
import { useUsersByRole } from '@/hooks/useUsers';
import { Affectation } from '@/types';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CalendarWrapper } from '../ui/calendar-wrapper';

interface AffectationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affectation?: Affectation;
}

const formSchema = z.object({
  vehicule_id: z.number().min(1, 'Le véhicule est requis'),
  chauffeur_id: z.number().min(1, 'Le chauffeur est requis'),
  date_debut: z.date({ required_error: 'La date de début est requise' }),
  date_fin: z.date({ required_error: 'La date de fin est requise' }),
}).refine((data) => data.date_fin > data.date_debut, {
  message: 'La date de fin doit être après la date de début',
  path: ['date_fin'],
});

type FormData = z.infer<typeof formSchema>;

export const AffectationDialog = ({ open, onOpenChange, affectation }: AffectationDialogProps) => {
  const { t } = useTranslation();
  const { data: vehicules } = useVehicules();
  const { data: chauffeurs } = useUsersByRole('driver');
  const createAffectation = useCreateAffectation();
  const updateAffectation = useUpdateAffectation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicule_id: null,
      chauffeur_id: null,
      date_debut: new Date(),
      date_fin: new Date(),
    },
  });

  useEffect(() => {
    if (affectation && vehicules) {
      // Trouver le véhicule par son immatriculation pour obtenir son ID
      const vehicule = vehicules.find(v => v.id === affectation.vehicule_id);
      
      form.reset({
        vehicule_id: vehicule?.id || null, // Utiliser l'ID du véhicule pour le formulaire
        chauffeur_id: affectation.chauffeur_id,
        date_debut: new Date(affectation.date_debut),
        date_fin: new Date(affectation.date_fin),
      });
    } else {
      form.reset({
        vehicule_id: null,
        chauffeur_id: null,
        date_debut: new Date(),
        date_fin: new Date(),
      });
    }
  }, [affectation, vehicules, form, open]);

  const onSubmit = async (data: FormData) => {
    try {
      // Récupérer l'immatriculation du véhicule sélectionné
      const selectedVehicule = vehicules?.find(v => v.id === data.vehicule_id);
      if (!selectedVehicule) {
        toast.error('Véhicule non trouvé');
        return;
      }

      const affectationData = {
        vehicule_id: selectedVehicule.id, // Utiliser l'immatriculation comme clé étrangère
        chauffeur_id: data.chauffeur_id,
        date_debut: data.date_debut.toISOString(),
        date_fin: data.date_fin.toISOString(),
      };

      if (affectation) {
        await updateAffectation.mutateAsync({
          id: affectation.id,
          data: affectationData,
        });
        toast.success(t('assignments.assignmentUpdated'));
      } else {
        await createAffectation.mutateAsync(affectationData);
        toast.success(t('assignments.assignmentCreated'));
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(affectation ? t('assignments.errorUpdate') : t('assignments.errorCreation'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {affectation ? t('assignments.editAssignment') : t('assignments.newAssignment')}
          </DialogTitle>
          <DialogDescription>{t('assignments.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('assignments.vehicle')}</FormLabel>
                  <Select onValueChange={field.onChange} value={(field.value).toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('assignments.selectVehicle')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicules?.map((vehicule) => (
                        <SelectItem key={vehicule.id} value={(vehicule.id).toString()}>
                          {vehicule.immatriculation} - {vehicule.marque} {vehicule.modele}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chauffeur_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('assignments.driver')}</FormLabel>
                  <Select onValueChange={field.onChange} value={(field.value.toString())}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('assignments.selectDriver')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {chauffeurs?.map((chauffeur) => (
                        <SelectItem key={chauffeur.id} value={chauffeur.id.toString()}>
                          {chauffeur.prenom} {chauffeur.nom} ({chauffeur.matricule})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_debut"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('assignments.startDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>{t('assignments.startDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <CalendarWrapper
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                      placeholderText="Choisis une date"
                    />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_fin"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('assignments.endDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>{t('assignments.endDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <CalendarWrapper
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                      placeholderText="Choisis une date"
                    />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createAffectation.isPending || updateAffectation.isPending}>
                {createAffectation.isPending || updateAffectation.isPending
                  ? t('common.loading')
                  : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
