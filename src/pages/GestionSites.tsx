// src/pages/GestionSites.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/Layout/MainLayout';
import { MotionWrapper } from '@/components/Layout/MotionWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useSites, useDeleteSite } from '@/hooks/useSites';
import { SiteFormDialog } from '@/components/Sites/SiteFormDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Site } from '@/types';
import { useToast } from '@/hooks/use-toast';

const GestionSites = () => {
  const { t } = useTranslation();
  const { data: sites, isLoading } = useSites();
  const deleteSite = useDeleteSite();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);

  const handleAdd = () => {
    setSelectedSite(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (site: Site) => {
    setSelectedSite(site);
    setDialogOpen(true);
  };

  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!siteToDelete) return;
    deleteSite.mutate(siteToDelete.id, {
      onSuccess: () => {
        toast({ title: t('sites.deleteSuccess') });
        setDeleteDialogOpen(false);
        setSiteToDelete(null);
      },
      onError: () => {
        toast({ title: t('sites.deleteError'), variant: 'destructive' });
      },
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <MotionWrapper variant="slideUp">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                {t('sites.title')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('sites.description')}
              </p>
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('sites.addSite')}
            </Button>
          </div>
        </MotionWrapper>

        <MotionWrapper variant="fade" delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>{t('sites.sitesList')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('common.loading')}
                </div>
              ) : !sites || sites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('sites.noSites')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('sites.name')}</TableHead>
                      <TableHead>{t('sites.city')}</TableHead>
                      <TableHead>{t('sites.country')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.nom}</TableCell>
                        <TableCell>{site.ville}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{site.pays}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(site)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(site)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </MotionWrapper>
      </div>

      <SiteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        site={selectedSite}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('sites.confirmDelete')}
        description={t('sites.confirmDeleteDesc', { name: siteToDelete?.nom })}
        confirmText={t('common.delete')}
        icon={Trash2}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSite.isPending}
      />
    </MainLayout>
  );
};

export default GestionSites;