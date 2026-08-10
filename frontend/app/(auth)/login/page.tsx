'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      // router redirect is handled in AuthProvider via effect/logic or they can just navigate
      window.location.href = '/closet';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 shadow-sm">
      <h1 className="text-2xl font-semibold mb-6 text-center">Welcome back</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Email Address"
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Mail className="w-4 h-4" />}
          placeholder="you@example.com"
        />
        <Input 
          label="Password"
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={<Lock className="w-4 h-4" />}
          placeholder="••••••••"
        />
        
        <Button type="submit" className="w-full mt-2" loading={loading}>
          Sign In
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link href="/register" className="text-accent hover:underline font-medium">
          Register
        </Link>
      </p>
    </Card>
  );
}
