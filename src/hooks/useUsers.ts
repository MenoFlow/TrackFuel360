import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import { mockUsers } from '@/lib/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate current user (for demo purposes)
let currentUserId = 1; // Default admin

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async (): Promise<User> => {
      await delay(200);
      const user = mockUsers.find(u => u.id === currentUserId);
      if (!user) throw new Error('User not found');
      return user;
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      await delay(300);
      return mockUsers;
    },
  });
};

export const useUsersBySite = (siteId?: number) => {
  return useQuery({
    queryKey: ['users', 'site', siteId],
    queryFn: async (): Promise<User[]> => {
      await delay(300);
      if (!siteId) return mockUsers;
      return mockUsers.filter(u => u.site_id === siteId);
    },
    enabled: !!siteId,
  });
};

export const useUsersByRole = (role?: string) => {
  return useQuery({
    queryKey: ['users', 'role', role],
    queryFn: async (): Promise<User[]> => {
      await delay(300);
      if (!role) return mockUsers;
      return mockUsers.filter(u => u.role === role);
    },
    enabled: !!role,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newUser: Omit<User, 'id'>): Promise<User> => {
      await delay(500);
      const user: User = {
        id: Date.now(),
        ...newUser,
      };
      mockUsers.push(user);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }): Promise<User> => {
      await delay(500);
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      const updatedUser = { ...mockUsers[index], ...data };
      mockUsers[index] = updatedUser;
      return updatedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await delay(500);
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      mockUsers.splice(index, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Helper function to check permissions
export const hasPermission = (user: User | undefined, permission: string): boolean => {
  if (!user) return false;
  
  const permissions: Record<string, string[]> = {
    admin: ['*'], // All permissions
    manager: ['view_dashboard', 'view_alerts', 'view_reports', 'manage_vehicles', 'manage_drivers'],
    supervisor: ['view_dashboard', 'view_alerts', 'view_reports', 'validate_corrections'],
    driver: ['create_plein', 'view_own_data'],
    auditeur: ['view_dashboard', 'view_alerts', 'view_reports', 'export_reports'],
  };
  
  const userPermissions = permissions[user.role] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

// Simulate login (for demo purposes)
export const login = (userId: number) => {
  currentUserId = userId;
};

export const logout = () => {
  currentUserId = null;
};
