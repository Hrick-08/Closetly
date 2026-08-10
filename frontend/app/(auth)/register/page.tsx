'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      window.location.href = '/closet';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 shadow-sm">
      <h1 className="text-2xl font-semibold mb-6 text-center">Create an account</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Full Name"
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          icon={<UserIcon className="w-4 h-4" />}
          placeholder="John Doe"
        />
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
        <Input 
          label="Confirm Password"
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          icon={<Lock className="w-4 h-4" />}
          placeholder="••••••••"
        />
        
        <Button type="submit" className="w-full mt-2" loading={loading}>
          Register
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </Card>
  );
}
