import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

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

export function useTransactions(filters?: { search?: string; type?: string; status?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
        return fetchFromApi(`/transactions?${params.toString()}`, token);
    },
    enabled: !!token,
  });
}