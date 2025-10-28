import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import { useTranslation } from 'react-i18next';
import { Fuel, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: users } = useUsers();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simuler un délai de connexion
    await new Promise(resolve => setTimeout(resolve, 500));

    // Vérifier les identifiants dans les données mock
    const user = users?.find(u => u.email === email);

    if (user && password === 'password123') { // Mot de passe mock pour tous
      // Stocker l'utilisateur en localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      toast({
        title: t('login.successTitle'),
        description: `${t('login.successMessage')} ${user.prenom} ${user.nom}`,
      });

      // Rediriger vers le dashboard approprié
      if (user.role === 'driver') {
        navigate('/chauffeur');
      } else {
        navigate('/');
      }
    } else {
      toast({
        title: t('login.errorTitle'),
        description: t('login.errorMessage'),
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Fuel className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">TrackFuel360</CardTitle>
          <CardDescription>
            {t('login.connectToAccess')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('login.signingIn') : t('login.signIn')}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('login.testAccounts')}</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Admin: admin@trackfuel.com</p>
              {/* <p>• Chauffeur: driver1@trackfuel.com</p> */}
              <p className="mt-2">{t('login.testPassword')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
