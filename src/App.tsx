import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthContext";
import { Header } from "@/components/layout/Header";
import { Home } from "@/pages/Home";
import { Auth } from "@/pages/Auth";
import { Admin } from "@/pages/Admin";

const queryClient = new QueryClient();

const App = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'auth' | 'admin'>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'auth':
        return <Auth onNavigate={setCurrentPage} />;
      case 'admin':
        return <Admin onNavigate={setCurrentPage} />;
      default:
        return <Home />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen">
            <Header currentPage={currentPage} onNavigate={setCurrentPage} />
            <main>{renderPage()}</main>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
