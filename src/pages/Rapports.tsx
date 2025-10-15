import { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, FileSpreadsheet, Copy, Clock } from 'lucide-react';
import { RapportType, RapportFilters, FormatExport, RapportData } from '@/types';
import { useGenererRapport, useHistoriqueRapports } from '@/hooks/useRapports';
import { useCurrentUser } from '@/hooks/useUsers';
import { exporterRapport, genererLienExportSecurise, copierDansPressePapier } from '@/lib/utils/exportUtils';
import { RapportFiltersComponent } from '@/components/Rapports/RapportFilters';
import { RapportPreview } from '@/components/Rapports/RapportPreview';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from "framer-motion";


const Rapports = () => {
  const [selectedType, setSelectedType] = useState<RapportType>('mensuel_site');
  const [filtres, setFiltres] = useState<RapportFilters>({});
  const [rapportGenere, setRapportGenere] = useState<RapportData | null>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: historique } = useHistoriqueRapports();
  const genererMutation = useGenererRapport();

  const rapportTypes: { value: RapportType; label: string }[] = [
    { value: 'mensuel_site', label: 'Rapport mensuel par site/véhicule' },
    { value: 'top_ecarts', label: 'Top 10 des écarts de consommation' },
    { value: 'anomalies', label: 'Rapport des anomalies' },
    { value: 'corrections', label: 'Rapport des corrections' },
    { value: 'comparaison', label: 'Comparaison inter-sites' },
    { value: 'kpi_global', label: 'KPI globaux' },
  ];

  const handleGenerer = async () => {
    if (!currentUser) {
      toast.error('Utilisateur non connecté');
      return;
    }

    try {
      const rapport = await genererMutation.mutateAsync({
        type: selectedType,
        filtres,
        currentUser
      });
      setRapportGenere(rapport);
      toast.success('Rapport généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport');
    }
  };

  const handleExport = (formatExport: FormatExport) => {
    if (!rapportGenere) return;
    try {
      exporterRapport(rapportGenere, formatExport);
      toast.success(`Rapport exporté en ${formatExport.toUpperCase()}`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleCopyLink = async () => {
    if (!rapportGenere) return;
    const lien = genererLienExportSecurise(rapportGenere.metadata.id, 'pdf', 24);
    const success = await copierDansPressePapier(lien);
    if (success) {
      toast.success('Lien copié dans le presse-papier (valable 24h)');
    } else {
      toast.error('Erreur lors de la copie du lien');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='text-center sm:text-start'
        >
          <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground mt-2">
            Générez et exportez vos rapports dans différents formats
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2 space-y-6">
            {/* Sélection du type */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Type de rapport</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedType} onValueChange={(v) => setSelectedType(v as RapportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rapportTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filtres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RapportFiltersComponent
                filtres={filtres}
                onFiltresChange={setFiltres}
                onReset={() => setFiltres({})}
                selectedType={selectedType}
              />
            </motion.div>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-3"
            >
              <Button onClick={handleGenerer} disabled={genererMutation.isPending} className="flex-1">
                {genererMutation.isPending ? 'Génération...' : 'Générer le rapport'}
              </Button>
            </motion.div>

            {/* Aperçu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-[89vw] overflow-x-auto"
            >
              <RapportPreview rapport={rapportGenere} isLoading={genererMutation.isPending} />
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Export */}
            {rapportGenere && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier lien
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Historique */}
            <motion.div
              initial = {{ opacity: 0, x: 20 }}
              animate = {{ opacity: 1, x: 0 }}
              transition = {{ delay: 0.4 }}
            >
              <Card className='mb-4'>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Historique
                  </CardTitle>
                </CardHeader>
                <CardContent className='mb-4'>
                  {historique && historique.length > 0 ? (
                    <div className="space-y-2">
                      {historique.slice(0, 5).map(h => (
                        <div key={h.id} className="text-sm p-2 bg-muted/50 rounded">
                          <p className="font-medium">{h.titre}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(h.date_generation), 'dd/MM/yy HH:mm', { locale: fr })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun rapport récent</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Rapports;