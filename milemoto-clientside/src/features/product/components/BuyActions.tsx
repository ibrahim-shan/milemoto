// src/features/product/components/BuyActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { useCart } from '@/features/cart/cart-context';
import { Button } from '@/ui/Button';
import { Quantity } from '@/ui/Quantity';

type Props = {
  stock: number;
  slug: string;
  title: string;
  priceMinor: number;
  imageSrc: string;
};

export function BuyActions({ stock, slug, title, priceMinor, imageSrc }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    if (!stock) {
      toast.error('This item is currently out of stock.');
      return;
    }
    addItem({ slug, title, priceMinor, imageSrc, qty });
    toast.success('Added to cart.');
  };

  const buyNow = () => {
    if (!stock) {
      toast.error('This item is currently out of stock.');
      return;
    }
    addItem({ slug, title, priceMinor, imageSrc, qty });
    router.push('/checkout');
  };

  return (
    <div className="mt-6">
      <p className="text-foreground/80 mb-2 block text-xs font-semibold">Quantity</p>
      <div className="flex items-center gap-4">
        <Quantity
          value={qty}
          onChange={setQty}
          min={1}
          max={stock}
        />
        <div className="text-xs">
          <p className="font-semibold">Only {stock} items left!</p>
          <p className="text-foreground/70">Don’t miss it</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="solid"
          size="lg"
          justify="center"
          fullWidth
          className="sm:w-auto"
          onClick={buyNow}
        >
          Buy Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          justify="center"
          fullWidth
          className="border-primary text-primary hover:bg-primary/10 sm:w-auto"
          onClick={addToCart}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
