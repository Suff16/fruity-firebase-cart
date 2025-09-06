import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Fruit {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

interface OrderModalProps {
  fruit: Fruit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ fruit, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!fruit) return null;

  const totalPrice = fruit.price * quantity;
  const maxQuantity = Math.min(fruit.stock, 100); // Limit to stock or 100kg

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          fruit_id: fruit.id,
          quantity,
          customer_name: customerName,
          contact,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Pesanan Berhasil!',
        description: `Pesanan ${quantity}kg ${fruit.name} telah dikirim. Kami akan segera menghubungi Anda.`
      });

      // Reset form
      setQuantity(1);
      setCustomerName('');
      setContact('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengirim pesanan. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Pesan {fruit.name}
          </DialogTitle>
          <DialogDescription>
            Isi detail pesanan Anda di bawah ini
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={fruit.image}
                alt={fruit.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{fruit.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(fruit.price)}/kg
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah (kg)</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Maksimal {maxQuantity}kg (Stok tersedia: {fruit.stock}kg)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Nama Lengkap</Label>
            <Input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Kontak (WA/Email)</Label>
            <Textarea
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              placeholder="Nomor WhatsApp atau email untuk dihubungi"
              className="h-20"
            />
          </div>

          <div className="bg-gradient-soft p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-fresh hover:opacity-90"
            >
              {loading ? 'Mengirim...' : 'Pesan Sekarang'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};