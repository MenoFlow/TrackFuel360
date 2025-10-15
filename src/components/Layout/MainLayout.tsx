import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/vehicules', label: 'Véhicules', icon: Car },
  { path: '/pleins', label: 'Pleins', icon: Fuel },
  { path: '/alertes', label: 'Alertes', icon: AlertTriangle },
  { path: '/rapports', label: 'Rapports', icon: FileText },
  { path: '/parametres/corrections', label: 'Corrections', icon: FileEdit },
  { path: '/geofences', label: 'Géofences', icon: MapPin },
  { path: '/parametres', label: 'Paramètres', icon: Settings },
];

const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
  const location = useLocation();
  
  return (
    <div className={cn(
      "flex flex-col h-full",
      mobile ? "w-full" : "w-64 border-r border-border bg-card"
    )}>
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">TrackFuel360</h1>
        <p className="text-xs text-muted-foreground mt-1">Suivi intelligent de carburant</p>
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
                  "w-full justify-start gap-3",
                  isActive && "bg-secondary text-secondary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3"
          onClick={() => {
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <Sidebar />
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
            <Sidebar mobile />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 h-auto overflow-auto mb-5">
        <div className="h-full mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
};