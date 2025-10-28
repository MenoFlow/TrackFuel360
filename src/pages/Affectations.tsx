import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/Layout/MainLayout';
import { MotionLayout } from '@/components/Layout/MotionLayout';
import { useAffectations, useDeleteAffectation } from '@/hooks/useAffectations';
import { useVehicules } from '@/hooks/useVehicules';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { AffectationDialog } from '@/components/Affectations/AffectationDialog';
import { Affectation } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Affectations = () => {
  const { t } = useTranslation();
  const { data: affectations, isLoading } = useAffectations();
  const { data: vehicules } = useVehicules();
  const { data: users } = useUsers();
  const deleteAffectation = useDeleteAffectation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAffectation, setSelectedAffectation] = useState<Affectation | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [affectationToDelete, setAffectationToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddAffectation = () => {
    setSelectedAffectation(undefined);
    setDialogOpen(true);
  };

  const handleEditAffectation = (affectation: Affectation) => {
    setSelectedAffectation(affectation);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAffectationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!affectationToDelete) return;

    try {
      await deleteAffectation.mutateAsync(affectationToDelete);
      toast.success(t('assignments.assignmentDeleted'));
    } catch (error) {
      toast.error(t('assignments.errorDelete'));
    } finally {
      setDeleteDialogOpen(false);
      setAffectationToDelete(null);
    }
  };

  const getVehiculeImmatriculation = (immatriculation: string) => {
    // vehicule_id est déjà l'immatriculation dans la nouvelle structure
    return immatriculation;
  };

  const getVehiculeInfo = (immatriculation: string) => {
    return vehicules?.find(v => v.immatriculation === immatriculation);
  };

  const getChauffeurName = (chauffeurId: string) => {
    const user = users?.find(u => u.id === chauffeurId);
    return user ? `${user.prenom} ${user.nom}` : chauffeurId;
  };

  const filteredAffectations = affectations?.filter(affectation => {
    const vehiculeImmat = getVehiculeImmatriculation(affectation.vehicule_id).toLowerCase();
    const chauffeurName = getChauffeurName(affectation.chauffeur_id).toLowerCase();
    const search = searchTerm.toLowerCase();
    return vehiculeImmat.includes(search) || chauffeurName.includes(search);
  }) || [];

  const totalPages = Math.ceil(filteredAffectations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAffectations = filteredAffectations.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <MotionLayout variant="slideUp">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('assignments.title')}</h1>
              <p className="text-muted-foreground mt-2">{t('assignments.description')}</p>
            </div>
            <Button onClick={handleAddAffectation}>
              <Plus className="h-4 w-4 mr-2" />
              {t('assignments.addAssignment')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {filteredAffectations.length} {t('assignments.assignmentsCount')}
              </CardTitle>
              <CardDescription>{t('assignments.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {paginatedAffectations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('assignments.noAssignments')}</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('assignments.vehicle')}</TableHead>
                          <TableHead>{t('assignments.driver')}</TableHead>
                          <TableHead>{t('assignments.startDate')}</TableHead>
                          <TableHead>{t('assignments.endDate')}</TableHead>
                          <TableHead>{t('assignments.createdAt')}</TableHead>
                          <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAffectations.map((affectation) => (
                          <TableRow key={affectation.id}>
                            <TableCell className="font-medium">
                              {getVehiculeImmatriculation(affectation.vehicule_id)}
                            </TableCell>
                            <TableCell>{getChauffeurName(affectation.chauffeur_id)}</TableCell>
                            <TableCell>{format(new Date(affectation.date_debut), 'dd/MM/yyyy HH:mm')}</TableCell>
                            <TableCell>{format(new Date(affectation.date_fin), 'dd/MM/yyyy HH:mm')}</TableCell>
                            <TableCell>{format(new Date(affectation.date_debut), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAffectation(affectation)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(affectation.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <AffectationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          affectation={selectedAffectation}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('assignments.confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('assignments.deleteConfirmText')}<br />
                {t('assignments.actionIrreversible')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MotionLayout>
    </MainLayout>
  );
};

export default Affectations;
