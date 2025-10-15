import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { useState, useEffect } from 'react';
import { mockSites } from '@/lib/mockData';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: Omit<User, 'id'>) => void;
  isLoading: boolean;
}

export const UserFormDialog = ({ open, onOpenChange, user, onSubmit, isLoading }: UserFormDialogProps) => {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    email: '',
    matricule: '',
    nom: '',
    prenom: '',
    role: 'driver',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        site_id: user.site_id,
      });
    } else {
      setFormData({
        email: '',
        matricule: '',
        nom: '',
        prenom: '',
        role: 'driver',
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule</Label>
            <Input
              id="matricule"
              value={formData.matricule}
              onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="supervisor">Superviseur</SelectItem>
                <SelectItem value="driver">Chauffeur</SelectItem>
                <SelectItem value="auditeur">Auditeur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === 'driver') && (
            <div className="space-y-2">
              <Label htmlFor="site">Site (optionnel)</Label>
              <Select
                value={formData.role || 's'}
                onValueChange={(value) =>
                  setFormData({ ...formData, site_id: value === 'none' ? undefined : value })
                }
              >
                <SelectTrigger id="site">
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="aucun">Aucun site</SelectItem>
                  {mockSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.nom} - {site.ville}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : user ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
