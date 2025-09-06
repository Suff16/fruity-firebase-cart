import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, ShoppingBasket, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  currentPage: 'home' | 'auth' | 'admin';
  onNavigate: (page: 'home' | 'auth' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { user, userRole, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ShoppingBasket className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-fresh bg-clip-text text-transparent">
            Fresh Fruits
          </h1>
        </div>

        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              {userRole === 'admin' && (
                <Button
                  variant={currentPage === 'admin' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('admin')}
                  className={currentPage === 'admin' ? 'bg-gradient-fresh' : ''}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-fresh text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                      {userRole && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {userRole}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              variant={currentPage === 'auth' ? 'default' : 'outline'}
              onClick={() => onNavigate('auth')}
              className={currentPage === 'auth' ? 'bg-gradient-fresh' : ''}
            >
              <User className="w-4 h-4 mr-2" />
              Masuk
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};