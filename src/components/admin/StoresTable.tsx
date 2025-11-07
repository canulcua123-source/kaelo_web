
'use client';

import { useState } from 'react';
import { useStores, useDeleteStore, useUpdateStore, useCreateStore } from '@/hooks/useStores';
import { StoreFormModal } from './StoreFormModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import type { Database } from '@/types/database';

type Store = Database['public']['Tables']['stores']['Row'];

export function StoresTable() {
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const { data: stores, isLoading, error } = useStores(filters);
  const deleteStore = useDeleteStore();
  const updateStore = useUpdateStore();
  const createStore = useCreateStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleDelete = (storeId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comercio?')) {
      deleteStore.mutate(storeId);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (selectedStore) {
      updateStore.mutate({ ...data, id: selectedStore.id }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedStore(null);
        }
      });
    } else {
      createStore.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleCreateStore = () => {
    setSelectedStore(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Cargando comercios...</div>;
  if (error) return <div>Error al cargar los comercios: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Comercios</h2>
        <Button onClick={handleCreateStore}>Crear Comercio</Button>
      </div>

      <div className="flex gap-4">
        <Input
          name="search"
          placeholder="Buscar por nombre..."
          value={filters.search}
          onChange={handleFilterChange}
          className="max-w-sm"
        />
        <Select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="all">Todos los estados</option>
          <option value="pendiente_aprobacion">Pendiente Aprobación</option>
          <option value="aprobado">Aprobado</option>
          <option value="suspendido">Suspendido</option>
          <option value="rechazado">Rechazado</option>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registrado el</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores?.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{(store.owner as any)?.full_name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge
                    variant={{
                      pendiente_aprobacion: 'secondary',
                      aprobado: 'success',
                      suspendido: 'warning',
                      rechazado: 'destructive',
                    }[store.status]}
                  >
                    {store.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(store)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(store.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StoreFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        store={selectedStore}
        isLoading={updateStore.isLoading || createStore.isLoading}
      />
    </div>
  );
}
