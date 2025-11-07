'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { Search, UserPlus, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { UserRole, Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', searchTerm, roleFilter],
    queryFn: async () => {
      if (!token) throw new Error('No token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      let data = await response.json();

      if (searchTerm) {
        data = data.filter((user: User) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (roleFilter !== 'all') {
        data = data.filter((user: User) => user.role === roleFilter);
      }

      return data;
    },
    enabled: !!token,
  });

  // Create/Update user
  const saveUser = useMutation({
    mutationFn: async (userData: any) => {
      if (!token) throw new Error('No token');
      const url = selectedUser ? `/api/admin/users/${selectedUser.id}` : '/api/admin/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setSelectedUser(null);
    },
  });

  // Toggle user active status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      if (!token) throw new Error('No token');
      const response = await fetch(`/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ is_active: !isActive }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Delete user
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!token) throw new Error('No token');
      const response = await fetch(`/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'x-auth-token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
  });

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      ciclista: 'info',
      comerciante: 'success',
      creador_ruta: 'warning',
      administrador: 'danger',
    };

    const labels: Record<UserRole, string> = {
      ciclista: 'Ciclista',
      comerciante: 'Comerciante',
      creador_ruta: 'Creador de Rutas',
      administrador: 'Administrador',
    };

    return <Badge variant={variants[role]}>{labels[role]}</Badge>;
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">Administra todos los usuarios de la plataforma</p>
          </div>
          <Button onClick={handleNewUser}>
            <UserPlus size={20} className="mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Todos los roles</option>
                <option value="ciclista">Ciclistas</option>
                <option value="comerciante">Comerciantes</option>
                <option value="creador_ruta">Creadores de Rutas</option>
                <option value="administrador">Administradores</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Usuarios ({users?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : ''}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'success' : 'danger'}>
                          {user.is_active ? 'Activo' : 'Suspendido'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus.mutate({ userId: user.id, isActive: user.is_active })}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={user.is_active ? 'Suspender' : 'Activar'}
                          >
                            {user.is_active ? (
                              <Ban size={16} className="text-orange-600" />
                            ) : (
                              <CheckCircle size={16} className="text-green-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(user.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        onSubmit={(data) => saveUser.mutate(data)}
        user={selectedUser}
        isLoading={saveUser.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={() => userToDelete && deleteUser.mutate(userToDelete)}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
