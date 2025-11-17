export type CartItem = {
  id: string;
  slug: string;
  title: string;
  imageSrc: string;
  priceMinor: number;
  qty: number;
};

export type AddCartItemInput = {
  slug: string;
  title: string;
  imageSrc: string;
  priceMinor: number;
  qty?: number;
};
