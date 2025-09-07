import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, ShoppingCart, DollarSign, MessageCircle, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
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

  const sendWhatsAppPayment = (order: Order) => {
    const message = `Halo ${order.customer_name}! 🍎

Terima kasih sudah memesan di Fresh Fruits!

📋 *Detail Pesanan:*
• Produk: ${order.fruits.name}
• Jumlah: ${order.quantity}kg
• Total: ${formatPrice(order.fruits.price * order.quantity)}

💰 *Silakan transfer ke:*
BCA: 1234567890
A.n: Fresh Fruits

Setelah transfer, mohon kirim bukti pembayaran ke nomor ini ya! 😊`;

    const whatsappUrl = `https://wa.me/${order.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
      month: 'short',
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'processing': return 'Diproses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
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
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-fresh bg-clip-text text-transparent">
          Dashboard Admin
        </h1>
        <p className="text-muted-foreground">Kelola toko buah online Anda dengan mudah</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold text-emerald-600">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pesanan Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingOrders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Produk</p>
                <p className="text-2xl font-bold text-purple-600">{fruits.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stok Menipis</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockFruits}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-96 mx-auto bg-muted/50 backdrop-blur">
          <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Kelola Pesanan
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Kelola Produk
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Daftar Pesanan
              </CardTitle>
              <CardDescription>
                Kelola semua pesanan dan status pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada pesanan masuk</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/25">
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.contact}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.fruits.name}</p>
                              <p className="text-sm text-muted-foreground">{order.quantity}kg</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-bold text-primary">
                              {formatPrice(order.fruits.price * order.quantity)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="rounded-full">
                              {getStatusText(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendWhatsAppPayment(order)}
                                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    WhatsApp
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="bg-gradient-fresh hover:opacity-90"
                                  >
                                    Proses
                                  </Button>
                                </>
                              )}
                              {order.status === 'processing' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  className="bg-gradient-fresh hover:opacity-90"
                                >
                                  Selesai
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Kelola Produk</h2>
              <p className="text-muted-foreground">Tambah, edit, dan hapus produk buah</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedFruit(null);
                setIsFormOpen(true);
              }}
              className="bg-gradient-fresh hover:opacity-90 shadow-soft"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fruits.map((fruit) => (
              <Card key={fruit.id} className="border-0 shadow-soft overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <img
                    src={fruit.image}
                    alt={fruit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-foreground">{fruit.name}</h3>
                    {fruit.stock <= 10 && (
                      <Badge variant="destructive" className="text-xs rounded-full">
                        Stok Rendah
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(fruit.price)}
                  </p>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {fruit.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stok:</span>
                    <span className={`font-medium ${fruit.stock <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                      {fruit.stock} kg
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
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

          {fruits.length === 0 && (
            <Card className="border-0 shadow-soft">
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada produk. Tambahkan produk pertama Anda!</p>
              </CardContent>
            </Card>
          )}
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