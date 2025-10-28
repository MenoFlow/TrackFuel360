import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, X } from "lucide-react";
import { mockDataByType } from "@/lib/mockData";
import { MotionLayout } from "../Layout/MotionLayout";
import { useTranslation } from "react-i18next";

interface ExportPreviewProps {
  open: boolean;
  onClose: () => void;
  selectedTypes: string[];
  onConfirm: () => void;
}

export const ExportPreview = ({ open, onClose, selectedTypes, onConfirm }: ExportPreviewProps) => {
  const { t } = useTranslation();
  
  const previewData = selectedTypes.map((type) => {
    const data = mockDataByType[type as keyof typeof mockDataByType] || [];
    const items = Array.isArray(data) ? data : [data];
    return { type, items: items.slice(0, 5), total: items.length };
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('export.previewTitle')}</DialogTitle>
          <DialogDescription>
            {t('export.previewDescription')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {previewData.map(({ type, items, total }) => (
              <MotionLayout key={type} variant="fade">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">{t(`dataTypes.${type}`)}</h4>
                    <span className="text-sm text-muted-foreground">{total} {t('export.totalRows')}</span>
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {items[0] && Object.keys(items[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx} className="border-t border-border">
                              {Object.values(item).map((value, vidx) => (
                                <td key={vidx} className="px-3 py-2 text-xs text-foreground truncate max-w-[200px]">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </MotionLayout>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            {t('export.close')}
          </Button>
          <Button onClick={onConfirm} className="gap-2">
            <Download className="h-4 w-4" />
            {t('export.exportButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
