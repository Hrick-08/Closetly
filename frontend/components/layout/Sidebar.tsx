'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Shirt, Search, ShoppingBag, Palette, MessageCircle, LogOut } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/closet', label: 'Closet', icon: Shirt },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/outfits', label: 'Outfits', icon: Palette },
    { href: '/chat', label: 'AI Stylist', icon: MessageCircle },
  ];

  return (
    <aside className="w-64 border-r border-border bg-surface h-screen hidden md:flex flex-col flex-shrink-0 sticky top-0">
      <div className="p-6">
        <Link href="/" className="font-semibold text-2xl tracking-tight text-text-primary">
          Closetly.
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-accent text-white' 
                  : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-highlight text-text-primary flex items-center justify-center font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-text-secondary truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};
