import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../Layout/LanguageSelector';
import { ThemeToggle } from '../ThemeToggle';
import motion from "framer-motion";

interface HeaderProps {
  currentUser: {
    prenom: string;
    nom: string;
    matricule: string;
  };
  logout: () => void;
  isDashboard?: boolean;
}

export default function Header({ currentUser, logout, isDashboard = true }: HeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="mx-12 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div hidden={isDashboard}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/chauffeur')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
            </Button>
          </div>
          <div hidden={!isDashboard}>
            <Fuel />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">TrackFuel360</h1>
            <p className="text-xs text-muted-foreground">{t('driver.requestCorrection')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <OfflineSyncIndicator />
          <ThemeToggle />
          
          <LanguageSelector />


          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}

{/* <div className="text-right">
<p className="text-sm font-medium text-foreground">
    {currentUser.prenom} {currentUser.nom}
</p>
<p className="text-xs text-muted-foreground">{currentUser.matricule}</p>
</div> */}