import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { Ruta, RutaInsert, RutaUpdate } from '@/types/ruta';

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

export function useRutas(filters?: { search?: string; dificultad?: string; estado?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['rutas', filters],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.dificultad && filters.dificultad !== 'all') params.append('dificultad', filters.dificultad);
        if (filters?.estado && filters.estado !== 'all') params.append('estado', filters.estado);
        return fetchFromApi(`/routes?${params.toString()}`, token);
    },
    enabled: !!token,
  });
}

export function useCreateRuta() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (ruta: RutaInsert) => {
        return fetchFromApi('/routes', token, {
            method: 'POST',
            body: JSON.stringify(ruta),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
    },
  });
}

export function useUpdateRuta() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: RutaUpdate & { id: string }) => {
        return fetchFromApi(`/routes/${id}`, token, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
    },
  });
}

export function useDeleteRuta() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (rutaId: string) => {
        return fetchFromApi(`/routes/${rutaId}`, token, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
    },
  });
}