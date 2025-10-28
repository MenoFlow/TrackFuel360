import { useState, useEffect } from "react";
import { useParametres } from "@/hooks/useParameter";
import { Parametre } from "@/lib/data/mockData.parametres";
import ParametreCard from "@/components/ParametreCard";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/Layout/MainLayout";

const NotificationParameters = () => {
  const { t } = useTranslation();
  const { 
    parametres, 
    isLoading, 
    saveParametres, 
    resetParametres, 
    isSaving, 
    isResetting 
  } = useParametres();
  
  const [localParametres, setLocalParametres] = useState<Parametre[]>([]);

  useEffect(() => {
    if (parametres) {
      setLocalParametres(parametres);
    }
  }, [parametres]);

  const handleChange = (id: string, value: number) => {
    setLocalParametres((prev) =>
      prev.map((p) => (p.id === id ? { ...p, valeur: value } : p))
    );
  };

  const handleSave = () => {
    saveParametres(localParametres, {
      onSuccess: () => {
        toast.success(t("notification.toast.saveSuccess"));
      },
      onError: () => {
        toast.error(t("notification.toast.saveError"));
      },
    });
  };

  const handleReset = () => {
    resetParametres(undefined, {
      onSuccess: () => {
        toast.success(t("notification.toast.resetSuccess"));
      },
      onError: () => {
        toast.error(t("notification.toast.resetError"));
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" aria-hidden="true" />
            <p className="text-muted-foreground" role="status" aria-live="polite">
              {t("notification.a11y.loading")}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {t("notification.page.title")}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {t("notification.page.description")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {localParametres.map((parametre) => (
            <ParametreCard
              key={parametre.id}
              parametre={parametre}
              value={parametre.valeur}
              onChange={handleChange}
            />
          ))}
        </div>

        <footer className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={isSaving || isResetting}
            className="flex-1 sm:flex-none min-w-[200px]"
            size="lg"
            aria-label={isSaving ? t("notification.button.saving") : t("notification.button.save")}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                {t("notification.button.saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" aria-hidden="true" />
                {t("notification.button.save")}
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            disabled={isSaving || isResetting}
            variant="secondary"
            className="flex-1 sm:flex-none min-w-[200px]"
            size="lg"
            aria-label={isResetting ? t("notification.button.resetting") : t("notification.button.reset")}
          >
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                {t("notification.button.resetting")}
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" />
                {t("notification.button.reset")}
              </>
            )}
          </Button>
        </footer>
      </main>
    </div>
    </MainLayout>
  );
};

export default NotificationParameters;
