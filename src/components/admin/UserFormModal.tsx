'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  user?: User | null;
  isLoading?: boolean;
}

export function UserFormModal({ isOpen, onClose, onSubmit, user, isLoading }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'ciclista' as any,
    phone: '',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        is_active: user.is_active,
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        role: 'ciclista',
        phone: '',
        is_active: true,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Usuario' : 'Crear Usuario'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre Completo"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={!!user}
        />

        <Input
          label="Teléfono"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <Select
          label="Rol"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          required
        >
          <option value="ciclista">Ciclista</option>
          <option value="comerciante">Comerciante</option>
          <option value="creador_ruta">Creador de Rutas</option>
          <option value="administrador">Administrador</option>
        </Select>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Usuario activo
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
