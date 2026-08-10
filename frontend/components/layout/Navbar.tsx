'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl tracking-tight text-text-primary">
          Closetly.
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/closet">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
