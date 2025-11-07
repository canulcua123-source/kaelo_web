
'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export function TransactionsTable() {
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' });
  const { data: transactions, isLoading, error } = useTransactions(filters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (isLoading) return <div>Cargando transacciones...</div>;
  if (error) return <div>Error al cargar las transacciones: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Historial de Transacciones</h2>
      </div>

      <div className="flex gap-4">
        <Input
          name="search"
          placeholder="Buscar por usuario..."
          value={filters.search}
          onChange={handleFilterChange}
          className="max-w-sm"
        />
        <Select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="all">Todos los tipos</option>
          <option value="compra_ruta">Compra de Ruta</option>
          <option value="pedido_comercio">Pedido a Comercio</option>
        </Select>
        <Select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="fallido">Fallido</option>
          <option value="reembolsado">Reembolsado</option>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Referencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{(transaction.user as any)?.full_name || 'N/A'}</TableCell>
                <TableCell>{transaction.transaction_type}</TableCell>
                <TableCell>${transaction.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={{
                      pendiente: 'secondary',
                      completado: 'success',
                      fallido: 'destructive',
                      reembolsado: 'warning',
                    }[transaction.payment_status]}
                  >
                    {transaction.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                <TableCell>
                    {transaction.route_id && `Ruta: ${(transaction.route as any)?.title}`}
                    {transaction.order_id && `Pedido: ${transaction.order_id}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
