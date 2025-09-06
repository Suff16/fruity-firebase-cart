import React, { useState, useEffect } from 'react';
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

interface FruitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  fruit: Fruit | null;
  onSave: () => void;
}

export const FruitFormModal: React.FC<FruitFormModalProps> = ({
  isOpen,
  onClose,
  fruit,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (fruit) {
      setFormData({
        name: fruit.name,
        price: fruit.price.toString(),
        stock: fruit.stock.toString(),
        image: fruit.image,
        description: fruit.description
      });
    } else {
      setFormData({
        name: '',
        price: '',
        stock: '',
        image: '',
        description: ''
      });
    }
  }, [fruit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fruitData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: formData.image,
        description: formData.description
      };

      let error;
      if (fruit) {
        // Update existing fruit
        const result = await supabase
          .from('fruits')
          .update(fruitData)
          .eq('id', fruit.id);
        error = result.error;
      } else {
        // Create new fruit
        const result = await supabase
          .from('fruits')
          .insert(fruitData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: 'Berhasil!',
        description: fruit ? 'Buah berhasil diupdate' : 'Buah berhasil ditambahkan'
      });

      onSave();
    } catch (error) {
      toast({
        title: 'Error',
        description: fruit ? 'Gagal mengupdate buah' : 'Gagal menambahkan buah',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {fruit ? 'Edit Buah' : 'Tambah Buah Baru'}
          </DialogTitle>
          <DialogDescription>
            {fruit ? 'Edit informasi buah yang sudah ada' : 'Tambahkan buah baru ke dalam katalog'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Buah</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Contoh: Apel Fuji"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Harga per Kg (Rp)</Label>
            <Input
              id="price"
              type="number"
              step="1000"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              required
              placeholder="15000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stok (Kg)</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              required
              placeholder="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL Gambar</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              required
              placeholder="https://example.com/image.jpg"
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              placeholder="Deskripsi singkat tentang buah ini..."
              className="h-24"
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              {loading ? 'Menyimpan...' : (fruit ? 'Update' : 'Tambah')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};