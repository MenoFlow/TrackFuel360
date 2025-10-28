import { Button } from '@/components/ui/button';
import { Plus, X, Eye, EyeOff, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MapToolbarProps {
  isDrawing: boolean;
  isReadOnly: boolean;
  onToggleDrawing: () => void;
  onToggleReadOnly: () => void;
}

export function MapToolbar({
  isDrawing,
  isReadOnly,
  onToggleDrawing,
  onToggleReadOnly,
}: MapToolbarProps) {
  const { t } = useTranslation(); 

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div className="flex gap-2">
        
        <Button
          size="sm"
          variant={isReadOnly ? 'outline' : 'secondary'}
          onClick={onToggleReadOnly}
          className="whitespace-nowrap"
        >
          {isReadOnly ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              {t('map.readMode')}
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              {t('map.editMode')}
            </>
          )}
        </Button>

        {!isReadOnly && (
          <Button
            size="sm"
            className="whitespace-nowrap"
            variant={isDrawing ? 'destructive' : 'default'}
            onClick={onToggleDrawing}
          >
            {isDrawing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                {t('map.stopDrawing')}
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                {t('map.startDrawing')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
