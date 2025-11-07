'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Store,
  CreditCard,
  Settings,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Rutas',
    href: '/admin/rutas',
    icon: MapPin,
  },
  {
    label: 'Comercios',
    href: '/admin/comercios',
    icon: Store,
  },
  {
    label: 'Transacciones',
    href: '/admin/transacciones',
    icon: CreditCard,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Ruta Bici-Maya</h1>
        <p className="text-sm text-gray-400 mt-1">Panel Admin</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
