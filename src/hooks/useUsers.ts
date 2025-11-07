import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchFromApi(path: string, token: string | null, options: RequestInit = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'x-auth-token': token || '',
    };

    const response = await fetch(`${API_URL}/api/admin${path}`, {
        ...options,
        headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
}

export function useUsers(filters?: { search?: string; role?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
        return fetchFromApi(`/users?${params.toString()}`, token);
    },
    enabled: !!token,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (user: UserInsert) => {
        return fetchFromApi('/users', token, {
            method: 'POST',
            body: JSON.stringify(user),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UserUpdate & { id: string }) => {
        return fetchFromApi(`/users/${id}`, token, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
        return fetchFromApi(`/users/${userId}`, token, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}