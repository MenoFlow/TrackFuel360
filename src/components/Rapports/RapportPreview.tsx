import { RapportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface RapportPreviewProps {
  rapport: RapportData | null;
  isLoading?: boolean;
}

export const RapportPreview = ({ rapport, isLoading }: RapportPreviewProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!rapport) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Sélectionnez un type de rapport et configurez les filtres pour générer un aperçu
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    }
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    return String(value);
  };

  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4 w-full">
      {/* En-tête du rapport */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{rapport.metadata.titre}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {rapport.metadata.description}
              </p>
            </div>
            <Badge variant="outline">
              {rapport.metadata.nb_lignes} ligne{rapport.metadata.nb_lignes > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      {rapport.statistiques && Object.keys(rapport.statistiques).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(rapport.statistiques).map(([key, value]) => {
                if (typeof value === 'number' || typeof value === 'string') {
                  const isPositive = typeof value === 'number' && key.includes('ecart') && value > 0;
                  const isNegative = typeof value === 'number' && key.includes('ecart') && value < 0;
                  
                  return (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground">{formatLabel(key)}</p>
                        {isPositive && <TrendingUp className="h-4 w-4 text-red-500" />}
                        {isNegative && <TrendingDown className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-lg font-semibold mt-1">{formatValue(value)}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau de données */}
      {rapport.donnees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Données ({rapport.donnees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(rapport.donnees[0]).map(key => (
                      <TableHead key={key} className="whitespace-nowrap">
                        {formatLabel(key)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapport.donnees.slice(0, 100).map((row, index) => (
                    <TableRow key={index}>
                      {Object.keys(row).map(key => (
                        <TableCell key={key} className="whitespace-nowrap">
                          {formatValue(row[key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rapport.donnees.length > 100 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Affichage des 100 premières lignes sur {rapport.donnees.length}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {rapport.donnees.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucune donnée ne correspond aux critères sélectionnés
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
