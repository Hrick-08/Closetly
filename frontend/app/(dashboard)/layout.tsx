'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, Search, ShoppingBag, Palette, MessageCircle } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: '/closet', icon: Shirt },
    { href: '/search', icon: Search },
    { href: '/shop', icon: ShoppingBag },
    { href: '/outfits', icon: Palette },
    { href: '/chat', icon: MessageCircle },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around p-3 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-black/5'
              }`}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
