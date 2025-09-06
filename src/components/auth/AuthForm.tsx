import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: mode === 'signin' ? 'Berhasil masuk!' : 'Akun berhasil dibuat!',
          description: mode === 'signin' 
            ? 'Selamat datang kembali!' 
            : 'Silakan periksa email untuk verifikasi.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan yang tidak terduga',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-medium">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-fresh bg-clip-text text-transparent">
          {mode === 'signin' ? 'Masuk' : 'Daftar'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? 'Masuk ke akun Fresh Fruits Anda'
            : 'Buat akun Fresh Fruits baru'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Masukkan nama lengkap"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Masukkan email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-fresh hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? 'Loading...' : (mode === 'signin' ? 'Masuk' : 'Daftar')}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin' 
                ? 'Belum punya akun? Daftar di sini'
                : 'Sudah punya akun? Masuk di sini'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};