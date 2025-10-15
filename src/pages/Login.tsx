import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mockData';
import { Fuel } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simuler un délai de connexion
    await new Promise(resolve => setTimeout(resolve, 500));

    // Vérifier les identifiants dans les données mock
    const user = mockUsers.find(u => u.email === email);

    if (user && password === 'password123') { // Mot de passe mock pour tous
      // Stocker l'utilisateur en localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${user.prenom} ${user.nom}`,
      });

      // Rediriger vers le dashboard approprié
      if (user.role === 'driver') {
        navigate('/chauffeur');
      } else {
        navigate('/');
      }
    } else {
      toast({
        title: 'Erreur de connexion',
        description: 'Email ou mot de passe incorrect',
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
            Connectez-vous pour accéder à votre tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@trackfuel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Comptes de test :</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Admin: admin@trackfuel.com</p>
              <p>• Manager: manager@trackfuel.com</p>
              <p>• Chauffeur: chauffeur1@trackfuel.com</p>
              <p className="mt-2">Mot de passe: password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
