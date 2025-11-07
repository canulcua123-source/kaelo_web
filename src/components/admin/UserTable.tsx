
'use client';

import { useState } from 'react';
import { useUsers, useDeleteUser, useUpdateUser, useCreateUser } from '@/hooks/useUsers';
import { UserFormModal } from './UserFormModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';

type User = {
  id: string;
  full_name: string;
  email: string;
  role: 'ciclista' | 'comerciante' | 'creador_ruta' | 'administrador';
  is_active: boolean;
  created_at: string;
  phone?: string;
};

export function UserTable() {
  const [filters, setFilters] = useState({ search: '', role: 'all' });
  const { data: users, isLoading, error } = useUsers(filters);
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUser.mutate(userId);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (selectedUser) {
      updateUser.mutate({ ...data, id: selectedUser.id }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }
      });
    } else {
      createUser.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error al cargar los usuarios: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Usuarios</h2>
        <Button onClick={handleCreateUser}>Crear Usuario</Button>
      </div>

      <div className="flex gap-4">
        <Input
          name="search"
          placeholder="Buscar por nombre o email..."
          value={filters.search}
          onChange={handleFilterChange}
          className="max-w-sm"
        />
        <Select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="all">Todos los roles</option>
          <option value="ciclista">Ciclista</option>
          <option value="comerciante">Comerciante</option>
          <option value="creador_ruta">Creador de Rutas</option>
          <option value="administrador">Administrador</option>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Miembro desde</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
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

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={updateUser.isLoading || createUser.isLoading}
      />
    </div>
  );
}
