import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TripDialogProps {
  editingTripId: number | null;
  distanceKm: number | null;
  tStart: string;
  tEnd: string;
  typeSaisie: string;
  chauffeurId: number;
  odometreDebut: number;
  odometreFin: number;
  setTStart: (value: string) => void;
  setTEnd: (value: string) => void;
  setChauffeurId: (value: string) => void;
  setOdometreDebut: (value: number) => void;
  setOdometreFin: (value: number) => void;
  onSave: () => void;
  isSaving: boolean;
  disabled: boolean;
}

export function TripDialog({
  editingTripId,
  distanceKm,
  tStart,
  tEnd,
  typeSaisie,
  chauffeurId,
  odometreDebut,
  odometreFin,
  setTStart,
  setTEnd,
  setChauffeurId,
  setOdometreDebut,
  setOdometreFin,
  onSave,
  isSaving,
  disabled,
}: TripDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const handleSave = () => {
    onSave();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('trips.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {editingTripId ? t('trips.editTrip') : t('trips.saveTrip')}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingTripId ? t('trips.editTrip') : t('trips.newTrip')}
          </DialogTitle>
          <DialogDescription>
            {t('trips.tripDetails')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distance" className="text-right">
              {t('trips.distance')}
            </Label>
            <Input
              id="distance"
              value={distanceKm !== null ? `${distanceKm} ${t('trips.km')}` : "—"}
              disabled
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              {t('trips.type')}
            </Label>
            <Input
              id="type"
              value={typeSaisie}
              disabled
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tStart" className="text-right">
              {t('trips.departure')}
            </Label>
            <Input
              id="tStart"
              type="datetime-local"
              value={tStart}
              onChange={(e) => setTStart(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tEnd" className="text-right">
              {t('trips.arrival')}
            </Label>
            <Input
              id="tEnd"
              type="datetime-local"
              value={tEnd}
              onChange={(e) => setTEnd(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chauffeur" className="text-right">
              {t('trips.driver')}
            </Label>
            <Input
              id="chauffeur"
              type="number"
              value={chauffeurId}
              onChange={(e) => setChauffeurId(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="odoDebut" className="text-right">
              {t('trips.odoStart')}
            </Label>
            <Input
              id="odoDebut"
              type="number"
              value={odometreDebut}
              onChange={(e) => setOdometreDebut(Number(e.target.value))}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="odoFin" className="text-right">
              {t('trips.odoEnd')}
            </Label>
            <Input
              id="odoFin"
              type="number"
              value={odometreFin}
              onChange={(e) => setOdometreFin(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            {t('trips.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={disabled || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('trips.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('trips.save')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
