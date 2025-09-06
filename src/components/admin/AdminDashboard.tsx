import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, ShoppingCart, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FruitFormModal } from './FruitFormModal';

interface Fruit {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  created_at: string;
}

interface Order {
  id: string;
  quantity: number;
  customer_name: string;
  contact: string;
  status: string;
  created_at: string;
  fruits: {
    name: string;
    price: number;
  };
}

export const AdminDashboard: React.FC = () => {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFruits();
    fetchOrders();
  }, []);

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

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          fruits (
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data pesanan',
        variant: 'destructive'
      });
    }
  };

  const deleteFruit = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buah ini?')) return;

    try {
      const { error } = await supabase
        .from('fruits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Buah berhasil dihapus'
      });
      fetchFruits();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus buah',
        variant: 'destructive'
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Status pesanan berhasil diupdate'
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengupdate status pesanan',
        variant: 'destructive'
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + (order.fruits.price * order.quantity), 0);

  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const lowStockFruits = fruits.filter(fruit => fruit.stock <= 10).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Dari pesanan selesai</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Pending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-accent">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Perlu diproses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockFruits}</div>
            <p className="text-xs text-muted-foreground">Buah dengan stok ≤ 10kg</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fruits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fruits">Kelola Buah</TabsTrigger>
          <TabsTrigger value="orders">Kelola Pesanan</TabsTrigger>
        </TabsList>

        <TabsContent value="fruits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Kelola Buah</h2>
            <Button 
              onClick={() => {
                setSelectedFruit(null);
                setIsFormOpen(true);
              }}
              className="bg-gradient-fresh hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Buah
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fruits.map((fruit) => (
              <Card key={fruit.id} className="overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={fruit.image}
                    alt={fruit.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{fruit.name}</h3>
                    {fruit.stock <= 10 && (
                      <Badge variant="destructive" className="text-xs">
                        Stok Rendah
                      </Badge>
                    )}
                  </div>
                  <p className="text-primary font-bold text-xl mb-2">
                    {formatPrice(fruit.price)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {fruit.description}
                  </p>
                  <p className="text-sm mb-4">
                    <span className="text-muted-foreground">Stok: </span>
                    <span className={fruit.stock <= 10 ? 'text-destructive font-medium' : 'text-foreground'}>
                      {fruit.stock} kg
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFruit(fruit);
                        setIsFormOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteFruit(fruit.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">Kelola Pesanan</h2>
          
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                      <CardDescription>
                        {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status === 'pending' && 'Menunggu'}
                      {order.status === 'processing' && 'Diproses'}
                      {order.status === 'completed' && 'Selesai'}
                      {order.status === 'cancelled' && 'Dibatalkan'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{order.fruits.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity}kg × {formatPrice(order.fruits.price)} = {formatPrice(order.fruits.price * order.quantity)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kontak:</p>
                      <p className="text-sm">{order.contact}</p>
                    </div>
                    {order.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="bg-gradient-fresh hover:opacity-90"
                        >
                          Proses
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          Selesai
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Batalkan
                        </Button>
                      </div>
                    )}
                    {order.status === 'processing' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="bg-gradient-fresh hover:opacity-90"
                        >
                          Selesai
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Batalkan
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {orders.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada pesanan</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FruitFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedFruit(null);
        }}
        fruit={selectedFruit}
        onSave={() => {
          fetchFruits();
          setIsFormOpen(false);
          setSelectedFruit(null);
        }}
      />
    </div>
  );
};