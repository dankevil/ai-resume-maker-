'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const credentials = {
        email: formData.get('email')?.toString().toLowerCase().trim() || '',
        password: formData.get('password')?.toString() || '',
      };

      if (!credentials.email || !credentials.password) {
        toast.error('Please enter both email and password');
        return;
      }

      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.error('Login error:', result.error);
        toast.error('Invalid email or password');
        return;
      }

      if (result?.ok) {
        toast.success('Login successful!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred while signing in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>
    </div>
  );
} 