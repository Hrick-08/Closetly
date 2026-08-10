import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Closetly — Your AI Fashion Companion',
  description: 'Manage your wardrobe, discover matching outfits, and get AI-powered styling advice.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-text-primary antialiased flex flex-col">
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
