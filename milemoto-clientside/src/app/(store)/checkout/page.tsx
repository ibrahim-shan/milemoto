import CheckoutClient from '@/features/checkout/components/CheckoutClient';

type CartItem = {
  id: string;
  title: string;
  imageSrc: string;
  priceMinor: number;
  qty: number;
  currency: string;
};

const CART: CartItem[] = [
  {
    id: 'spark',
    title: 'Spark Plug Set',
    imageSrc: '/images/spark.png',
    priceMinor: 4_500,
    qty: 1,
    currency: 'MWK',
  },
  {
    id: 'pads',
    title: 'Brake Pads',
    imageSrc: '/images/pads.png',
    priceMinor: 7_500,
    qty: 1,
    currency: 'MWK',
  },
];

export default function Page() {
  return (
    <CheckoutClient
      initialItems={CART}
      shippingMinor={1_500}
    />
  );
}
