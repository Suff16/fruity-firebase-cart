import React, { useState, useEffect } from 'react';
import { FruitCard } from '@/components/fruits/FruitCard';
import { FruitDetailModal } from '@/components/fruits/FruitDetailModal';
import { OrderModal } from '@/components/fruits/OrderModal';
import { Input } from '@/components/ui/input';
import { Search, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Fruit {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export const Home: React.FC = () => {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [filteredFruits, setFilteredFruits] = useState<Fruit[]>([]);
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [orderFruit, setOrderFruit] = useState<Fruit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFruits();
  }, []);

  useEffect(() => {
    const filtered = fruits.filter(fruit =>
      fruit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fruit.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFruits(filtered);
  }, [fruits, searchTerm]);

  const fetchFruits = async () => {
    try {
      const { data, error } = await supabase
        .from('fruits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFruits(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data buah',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat buah-buahan segar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section className="bg-gradient-fresh text-white py-16">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Buah Segar Berkualitas
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Langsung dari kebun ke meja Anda
          </p>
          <div className="flex items-center justify-center space-x-2 text-lg">
            <Leaf className="h-6 w-6" />
            <span>100% Segar • Harga Terjangkau • Kualitas Terbaik</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Cari buah favorit Anda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Fruits Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Pilihan Buah Segar Kami
          </h2>
          
          {filteredFruits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'Tidak ada buah yang cocok dengan pencarian Anda' : 'Belum ada buah tersedia'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFruits.map((fruit) => (
                <FruitCard
                  key={fruit.id}
                  fruit={fruit}
                  onViewDetail={setSelectedFruit}
                  onOrder={setOrderFruit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <section className="bg-background/80 backdrop-blur-sm rounded-lg p-8 shadow-soft">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-primary">
              Mengapa Memilih Fresh Fruits?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">100% Segar</h4>
                <p className="text-muted-foreground">
                  Buah dipetik langsung dari kebun dengan kualitas terbaik
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-citrus rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h4 className="font-semibold mb-2">Harga Terjangkau</h4>
                <p className="text-muted-foreground">
                  Harga langsung dari petani tanpa perantara berlebihan
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h4 className="font-semibold mb-2">Pengiriman Cepat</h4>
                <p className="text-muted-foreground">
                  Pesanan diproses dengan cepat untuk menjaga kesegaran
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <FruitDetailModal
        fruit={selectedFruit}
        isOpen={!!selectedFruit}
        onClose={() => setSelectedFruit(null)}
        onOrder={setOrderFruit}
      />

      <OrderModal
        fruit={orderFruit}
        isOpen={!!orderFruit}
        onClose={() => setOrderFruit(null)}
      />
    </div>
  );
};