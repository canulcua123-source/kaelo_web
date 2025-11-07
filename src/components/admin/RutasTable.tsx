
'use client';

import { useState } from 'react';
import { useRutas, useDeleteRuta, useUpdateRuta, useCreateRuta } from '@/hooks/useRutas';
import { RutaFormModal } from './RutaFormModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import type { Ruta } from '@/types/ruta';

export function RutasTable() {
  const [filters, setFilters] = useState({ search: '', dificultad: 'all', estado: 'all' });
  const { data: rutas, isLoading, error } = useRutas(filters);
  const deleteRuta = useDeleteRuta();
  const updateRuta = useUpdateRuta();
  const createRuta = useCreateRuta();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);

  const handleEdit = (ruta: Ruta) => {
    setSelectedRuta(ruta);
    setIsModalOpen(true);
  };

  const handleDelete = (rutaId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
      deleteRuta.mutate(rutaId);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (selectedRuta) {
      updateRuta.mutate({ ...data, id: selectedRuta.id }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedRuta(null);
        }
      });
    } else {
      createRuta.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleCreateRuta = () => {
    setSelectedRuta(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Cargando rutas...</div>;
  if (error) return <div>Error al cargar las rutas: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Rutas</h2>
        <Button onClick={handleCreateRuta}>Crear Ruta</Button>
      </div>

      <div className="flex gap-4">
        <Input
          name="search"
          placeholder="Buscar por nombre..."
          value={filters.search}
          onChange={handleFilterChange}
          className="max-w-sm"
        />
        <Select name="dificultad" value={filters.dificultad} onChange={handleFilterChange}>
          <option value="all">Todas las dificultades</option>
          <option value="Fácil">Fácil</option>
          <option value="Intermedia">Intermedia</option>
          <option value="Difícil">Difícil</option>
        </Select>
        <Select name="estado" value={filters.estado} onChange={handleFilterChange}>
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dificultad</TableHead>
              <TableHead>Distancia</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creador</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rutas?.map((ruta) => (
              <TableRow key={ruta.id}>
                <TableCell className="font-medium">{ruta.nombre}</TableCell>
                <TableCell>{ruta.dificultad}</TableCell>
                <TableCell>{ruta.distancia} km</TableCell>
                <TableCell>${ruta.precio}</TableCell>
                <TableCell>
                  <Badge
                    variant={{
                      pendiente: 'secondary',
                      aprobada: 'success',
                      rechazada: 'destructive',
                    }[ruta.estado]}
                  >
                    {ruta.estado}
                  </Badge>
                </TableCell>
                <TableCell>{(ruta.creador as any)?.full_name || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(ruta)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(ruta.id)} className="text-red-600">
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

      <RutaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        ruta={selectedRuta}
        isLoading={updateRuta.isLoading || createRuta.isLoading}
      />
    </div>
  );
}
