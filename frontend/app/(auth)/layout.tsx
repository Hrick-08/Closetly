import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-background to-background pointer-events-none" />
      
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-semibold text-3xl tracking-tight text-text-primary">
            Closetly.
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
