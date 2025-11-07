
'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { Ruta } from '@/types/ruta';

interface RutaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  ruta?: Ruta | null;
  isLoading?: boolean;
}

export function RutaFormModal({ isOpen, onClose, onSubmit, ruta, isLoading }: RutaFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    distancia: 0,
    dificultad: 'Fácil' as any,
    precio: 0,
    estado: 'pendiente' as any,
  });

  useEffect(() => {
    if (ruta) {
      setFormData({
        nombre: ruta.nombre,
        descripcion: ruta.descripcion,
        distancia: ruta.distancia,
        dificultad: ruta.dificultad,
        precio: ruta.precio,
        estado: ruta.estado,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        distancia: 0,
        dificultad: 'Fácil',
        precio: 0,
        estado: 'pendiente',
      });
    }
  }, [ruta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ruta ? 'Editar Ruta' : 'Crear Ruta'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la Ruta"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />
        <Textarea
          label="Descripción"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Distancia (km)"
            type="number"
            value={formData.distancia}
            onChange={(e) => setFormData({ ...formData, distancia: parseFloat(e.target.value) })}
            required
          />
          <Input
            label="Precio ($)"
            type="number"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Select
              label="Dificultad"
              value={formData.dificultad}
              onChange={(e) => setFormData({ ...formData, dificultad: e.target.value as any })}
              required
            >
              <option value="Fácil">Fácil</option>
              <option value="Intermedia">Intermedia</option>
              <option value="Difícil">Difícil</option>
            </Select>
            <Select
              label="Estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              required
            >
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </Select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : ruta ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
