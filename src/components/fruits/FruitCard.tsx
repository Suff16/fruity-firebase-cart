import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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

interface FruitCardProps {
  fruit: Fruit;
  onViewDetail: (fruit: Fruit) => void;
  onOrder?: (fruit: Fruit) => void;
}

export const FruitCard: React.FC<FruitCardProps> = ({ fruit, onViewDetail, onOrder }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const isOutOfStock = fruit.stock === 0;

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={fruit.image}
          alt={fruit.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isOutOfStock && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 right-2 bg-destructive/90 backdrop-blur-sm"
          >
            Habis
          </Badge>
        )}
        {fruit.stock <= 10 && fruit.stock > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-orange-accent/90 backdrop-blur-sm"
          >
            Stok Terbatas
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
          {fruit.name}
        </h3>
        <p className="text-2xl font-bold text-primary mb-2">
          {formatPrice(fruit.price)}
        </p>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {fruit.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Stok:</span>
          <span className={`font-medium ${isOutOfStock ? 'text-destructive' : 'text-primary'}`}>
            {fruit.stock} kg
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetail(fruit)}
        >
          Detail
        </Button>
        {onOrder && (
          <Button 
            className="flex-1 bg-gradient-fresh hover:opacity-90"
            onClick={() => onOrder(fruit)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Habis' : 'Pesan'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};