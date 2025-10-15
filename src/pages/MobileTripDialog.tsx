import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Activity, Edit, Trash } from "lucide-react"
import { useState } from "react"

interface Trip {
  id: string
  vehicule_id: string
  motif?: string
  t_start: string
  t_end: string
  distance_km: number
}

interface MobileTripDialogProps {
  role: string
  vehiculeId: string
  trips: Trip[]
  startEditTrip: (trip: Trip) => void
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>
}

export default function MobileTripDialog({
  role,
  vehiculeId,
  trips,
  startEditTrip,
  setTrips,
}: MobileTripDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const tripsPerPage = 4

  const filteredTrips = trips.filter((t) => t.vehicule_id === vehiculeId)
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage)

  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * tripsPerPage,
    currentPage * tripsPerPage
  )

  return (
    <div className="md:hidden">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Activity className="w-5 h-5" />
            Trajets
          </Button>
        </DialogTrigger>

        <DialogContent className="p-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Modifier les trajets du véhicule {vehiculeId}
            </DialogTitle>
          </DialogHeader>

          {(role === 'admin' || role === 'administrateur') && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 pr-1 max-h-[260px] overflow-y-auto">
                {paginatedTrips.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-gray-200 rounded-md shadow-sm p-3 flex flex-col gap-1"
                  >
                    <div className="font-medium">{t.motif || '—'}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.t_start} → {t.t_end} — <strong>{t.distance_km} km</strong>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          startEditTrip(t);
                          setIsOpen(false);
                        }}
                        className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition"
                      >
                        <Edit className="h-4 w-4 mr-1 inline" />
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm('Supprimer (mock) ?')) return
                          setTrips((prev) => prev.filter((x) => x.id !== t.id))
                        }}
                        className="text-sm px-2 py-1 rounded bg-white text-red-600 hover:bg-gray-100 transition"
                      >
                        <Trash className="h-4 w-4 mr-1 inline" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-2">
                  <Button
                    variant="ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
