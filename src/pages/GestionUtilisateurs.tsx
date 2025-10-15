import { MainLayout } from '@/components/Layout/MainLayout';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useCurrentUser, hasPermission } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Plus, Edit, Trash2, Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import { UserFormDialog } from '@/components/Users/UserFormDialog';
import { User } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const GestionUtilisateurs = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Check if current user has permission to manage users
  if (!hasPermission(currentUser, 'manage_users') && currentUser?.role !== 'admin') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Accès refusé</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleCreateUser = async (data: Omit<User, 'id'>) => {
    try {
      await createUser.mutateAsync(data);
      toast.success('Utilisateur créé avec succès');
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleUpdateUser = async (data: Omit<User, 'id'>) => {
    if (!editingUser) return;
    try {
      await updateUser.mutateAsync({ id: editingUser.id, data });
      toast.success('Utilisateur modifié avec succès');
      setEditingUser(null);
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser.mutateAsync(deletingUser.id);
      toast.success('Utilisateur supprimé avec succès');
      setDeletingUser(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
      case 'supervisor':
        return 'default';
      case 'auditeur':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      manager: 'Manager',
      supervisor: 'Superviseur',
      driver: 'Chauffeur',
      auditeur: 'Auditeur',
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </MainLayout>
    );
  }
  console.log(users);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center md:flex-row md:text-left md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground mt-2">
              {users?.length} utilisateur{users?.length !== 1 ? 's' : ''} dans le système
            </p>
          </div>
          <Button onClick={() => {
            setEditingUser(null);
            setIsFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>

        <div className="grid gap-4">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">
                          {user.prenom} {user.nom}
                        </h3>
                      </div>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Matricule: {user.matricule}
                        </p>
                        {user.site_id && (
                          <p className="text-sm text-muted-foreground">
                            Site: {user.site_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {currentUser?.id !== user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        isLoading={createUser.isPending || updateUser.isPending}
      />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{deletingUser?.prenom} {deletingUser?.nom}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default GestionUtilisateurs;
