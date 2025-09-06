import React, { useEffect } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface AdminProps {
  onNavigate: (page: 'home' | 'auth' | 'admin') => void;
}

export const Admin: React.FC<AdminProps> = ({ onNavigate }) => {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      onNavigate('home');
    }
  }, [user, userRole, loading, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
            <p className="text-muted-foreground">
              Anda tidak memiliki akses untuk halaman ini. Hanya admin yang dapat mengakses dashboard ini.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Kelola buah-buahan dan pesanan Fresh Fruits
          </p>
        </div>
        
        <AdminDashboard />
      </div>
    </div>
  );
};