import React, { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthContext';

interface AuthProps {
  onNavigate: (page: 'home' | 'auth' | 'admin') => void;
}

export const Auth: React.FC<AuthProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      onNavigate('home');
    }
  }, [user, onNavigate]);

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-fresh bg-clip-text text-transparent mb-2">
            Fresh Fruits
          </h1>
          <p className="text-muted-foreground">
            Platform jual beli buah-buahan segar terpercaya
          </p>
        </div>
        
        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
};