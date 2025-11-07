
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/types/database';

type Store = Database['public']['Tables']['stores']['Row'];
type StoreInsert = Database['public']['Tables']['stores']['Insert'];
type StoreUpdate = Database['public']['Tables']['stores']['Update'];

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

export function useStores(filters?: { search?: string; status?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['stores', filters],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
        return fetchFromApi(`/stores?${params.toString()}`, token);
    },
    enabled: !!token,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (store: StoreInsert) => {
        return fetchFromApi('/stores', token, {
            method: 'POST',
            body: JSON.stringify(store),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: StoreUpdate & { id: string }) => {
        return fetchFromApi(`/stores/${id}`, token, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (storeId: string) => {
        return fetchFromApi(`/stores/${storeId}`, token, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
