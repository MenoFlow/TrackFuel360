import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Car, 
  Fuel, 
  AlertTriangle, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  FileEdit,
  Map,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface MainLayoutProps {
  children: ReactNode;
}

const Sidebar = ({ mobile = false, collapsed = false, onToggleCollapse, onLogoutClick }: { mobile?: boolean; collapsed?: boolean; onToggleCollapse?: () => void; onLogoutClick?: () => void }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/vehicules', label: t('nav.vehicles'), icon: Car },
    { path: '/pleins', label: t('nav.fuel'), icon: Fuel },
    { path: '/geofence', label: t('nav.map'), icon: Map },
    { path: '/comparaison-flotte', label: t('nav.comparison'), icon: BarChart3 },
    { path: '/affectations', label: t('assignments.title'), icon: User },
    { path: '/alertes', label: t('nav.alerts'), icon: AlertTriangle },
    { path: '/rapports', label: t('nav.reports'), icon: FileText },
    { path: '/parametres/corrections', label: t('nav.corrections'), icon: FileEdit },
    { path: '/parametres', label: t('nav.settings'), icon: Settings },
  ];
  
  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-300 relative",
      mobile ? "w-full" : collapsed ? "w-20 border-r border-border bg-card" : "w-64 border-r border-border bg-card"
    )}>
      {/* Collapse/Expand Button - Centered on right border (desktop only) */}
      {!mobile && onToggleCollapse && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-1/2 -translate-y-1/2 -right-4 z-50 h-8 w-8 rounded-full shadow-md bg-card border-border hover:bg-accent"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
      
      <div className={cn(
        "border-b border-border transition-all duration-300 overflow-hidden",
        "min-h-[80px] flex flex-col justify-center",
        collapsed ? "p-4" : "p-6"
      )}>
        {collapsed ? (
          <h1 className="text-xl font-bold text-foreground text-center">TF</h1>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">TrackFuel360</h1>
            <p className="text-xs text-muted-foreground mt-1">{t('appTitle')}</p>
          </>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full gap-3 transition-all duration-300",
                  collapsed ? "justify-center px-2" : "justify-start",
                  isActive && "bg-secondary text-secondary-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className={cn(
        "flex flex-col border-t border-border space-y-2 transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
     
        <div className='flex flex-col px-1'>
          <LanguageSelector />
          <ThemeToggle />
        </div>
        
        <Button 
          variant="ghost" 
          className={cn(
            "w-full gap-3 transition-all duration-300",
            "justify-start"
          )}
          title={collapsed ? t('nav.logout') : undefined}
          onClick={onLogoutClick}
        >
          <LogOut className="" />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </Button>
      </div>
    </div>
  );
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored === 'true';
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed.toString());
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <Sidebar 
          collapsed={collapsed} 
          onToggleCollapse={toggleCollapse} 
          onLogoutClick={() => setShowLogoutConfirm(true)}
        />
      </aside>
      
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar mobile onLogoutClick={() => setShowLogoutConfirm(true)} />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="w-full h-full p-4 md:p-6">
          {children}
        </div>

      </main>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
        title={t('confirm.logout')}
        description={t('confirm.logoutDesc')}
        confirmText={t('nav.logout')}
        icon={LogOut}
      />
    </div>
  );
};