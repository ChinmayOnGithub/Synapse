import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuthResponse } from '@/types';
import { toast } from 'sonner';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

const GOOGLE_ENABLED = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.length < 3 || username.length > 30) {
      toast.error('Username must be 3-30 characters');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post<AuthResponse>('/api/auth/register', {
        username,
        email,
        password,
        avatar: avatar || undefined,
      });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Account created successfully');
      navigate('/rooms');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] p-4">
      <Card className="w-full max-w-md border-[#30363d] bg-[#161b22] shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white font-semibold">
            Create Account
          </CardTitle>
          <p className="text-center text-sm text-gray-400">Join the community</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username (3-30 chars)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>
            <div>
              <Input
                type="url"
                placeholder="Avatar URL (optional)"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-medium" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </Button>

            {GOOGLE_ENABLED && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#30363d]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#161b22] px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <GoogleAuthButton />
              </>
            )}

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#58a6ff] hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
