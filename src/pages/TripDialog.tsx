import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Plus } from "lucide-react"

export function TripDialog({
  editingTripId,
  role,
  vehiculeId,
  trips,
  distanceKm,
  tStart,
  tEnd,
  typeSaisie,
  motif,
  setTStart,
  setTEnd,
  setMotif,
  saveTrip,
  resetPoints,
  setEditingTripId,
  setTrips,
  startEditTrip,
}: any) {
  const [open, setOpen] = useState(false)

  const handleCancel = () => {
    resetPoints()
    setMotif("")
    setEditingTripId(null)
    setOpen(false)
  }

  const handleSave = () => {
    saveTrip()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => {
          if (distanceKm !== null) {
            setOpen(true);
          } else {
            toast.warning("Veuillez d'abord sélectionner les points GPS pour calculer la distance.")
          }
        }}
      >
        {editingTripId ? <Edit className="h-4 w-4 md:mr-2" /> : <Plus className="h-4 w-4 md:mr-2" />}
        {editingTripId ? "Modifier" : "Ajouter"}
        
      </Button>

      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {editingTripId ? "Modifier trajet" : "Nouvelle saisie"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Date de départ</label>
            <Input
              type="datetime-local"
              value={tStart}
              onChange={(e) => setTStart(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Date d'arrivée</label>
            <Input
              type="datetime-local"
              value={tEnd}
              onChange={(e) => setTEnd(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type de saisie</label>
            <Input type="text" value={typeSaisie} readOnly />
          </div>

          <div>
            <label className="text-sm font-medium">Motif (optionnel)</label>
            <Input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
          </div>

          <div className="pt-2 text-sm">
            <strong>Distance calculée : </strong>
            {distanceKm !== null ? `${distanceKm} km` : "—"}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSave}>
            {editingTripId ? "Enregistrer modification" : "Valider & Enregistrer"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
