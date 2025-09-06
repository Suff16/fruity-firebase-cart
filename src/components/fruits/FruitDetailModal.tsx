import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Fruit {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

interface FruitDetailModalProps {
  fruit: Fruit | null;
  isOpen: boolean;
  onClose: () => void;
  onOrder?: (fruit: Fruit) => void;
}

export const FruitDetailModal: React.FC<FruitDetailModalProps> = ({ 
  fruit, 
  isOpen, 
  onClose, 
  onOrder 
}) => {
  if (!fruit) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const isOutOfStock = fruit.stock === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {fruit.name}
          </DialogTitle>
          <DialogDescription>
            Detail lengkap produk buah-buahan segar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={fruit.image}
              alt={fruit.name}
              className="w-full h-64 md:h-80 object-cover"
            />
            {isOutOfStock && (
              <Badge 
                variant="destructive" 
                className="absolute top-4 right-4 text-lg px-3 py-1"
              >
                Habis
              </Badge>
            )}
            {fruit.stock <= 10 && fruit.stock > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute top-4 right-4 bg-orange-accent text-white text-lg px-3 py-1"
              >
                Stok Terbatas
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Harga</h3>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(fruit.price)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Ketersediaan Stok</h3>
                <p className={`text-xl font-medium ${isOutOfStock ? 'text-destructive' : 'text-primary'}`}>
                  {fruit.stock} kg tersedia
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Deskripsi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {fruit.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Tutup
            </Button>
            {onOrder && (
              <Button 
                onClick={() => onOrder(fruit)}
                disabled={isOutOfStock}
                className="flex-1 bg-gradient-fresh hover:opacity-90"
              >
                {isOutOfStock ? 'Stok Habis' : 'Pesan Sekarang'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};