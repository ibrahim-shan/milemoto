import Image from 'next/image';

import { CornerUpRight, CreditCard, Headphones, ShieldCheck, Truck } from 'lucide-react';

import { Button } from '@/ui/Button';
import { CategoryCard } from '@/ui/cards/CategoryCard';
import { ProductCard } from '@/ui/cards/ProductCard';
import { PromoTile } from '@/ui/cards/PromoTile';

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <section
        aria-label="Hero"
        className="relative flex min-h-[85vh] items-center"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/hero-placeholder.webp"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
          <div className="w-full">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Your One-Stop Shop for Quality Auto Parts
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              From engines to brakes, we provide top‑quality auto parts designed for durability,
              precision, and power. No matter your vehicle, we’ve got the perfect fit to keep you
              moving smoothly and safely.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                href="/shop"
                variant="solid"
                size="lg"
                justify="center"
              >
                Shop Now
              </Button>

              <Button
                href="/shop?sort=bestsellers"
                variant="outline"
                size="lg"
                justify="center"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Explore Bestsellers
                <CornerUpRight
                  className="h-4 w-4"
                  aria-hidden
                />
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-white/90">
              <div className="text-primary flex items-center gap-1">
                <span aria-hidden>★</span>
                <span aria-hidden>★</span>
                <span aria-hidden>★</span>
                <span aria-hidden>★</span>
                <span aria-hidden>★</span>
              </div>
              <p className="text-sm">
                Trusted by <span className="font-semibold">1000+ car owners</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        aria-label="Partner brands"
        className="bg-card relative hidden py-10 md:block md:py-12"
      >
        <div
          className="bg-border/40 absolute inset-x-0 top-0 h-px"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6">
          <h2 className="text-foreground/80 mb-6 text-center text-base font-semibold">
            Some Of Our Partner Brands
          </h2>
          <div className="grid w-full grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-3 md:grid-cols-5">
            <Image
              src="/images/brands/bmw.webp"
              alt="Nissan"
              width={96}
              height={32}
              className="opacity-80 transition-opacity hover:opacity-100"
            />
            <Image
              src="/images/brands/nissan.webp"
              alt="Toyota"
              width={96}
              height={32}
              className="opacity-80 transition-opacity hover:opacity-100"
            />
            <Image
              src="/images/brands/mpower.webp"
              alt="Honda"
              width={96}
              height={32}
              className="opacity-80 transition-opacity hover:opacity-100"
            />
            <Image
              src="/images/brands/mercedes.webp"
              alt="BMW"
              width={96}
              height={32}
              className="opacity-80 transition-opacity hover:opacity-100"
            />
            <Image
              src="/images/brands/volkswagen.webp"
              alt="Ford"
              width={96}
              height={32}
              className="opacity-80 transition-opacity hover:opacity-100"
            />
          </div>
        </div>
      </section>
      {/* Shop By Categories */}
      <section
        aria-label="Shop by categories"
        className="bg-background"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-foreground text-xl font-semibold">Shop By Categories</h2>
            <Button
              href="/shop"
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
            >
              View All <CornerUpRight className="ml-1 inline-block h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            <CategoryCard
              title="Brake & Suspensions"
              href="/shop?cat=brakes"
              imageSrc="/images/categories/brakes.webp"
              imageAlt="Brake and suspension parts"
            />
            <CategoryCard
              title="Exhaust & Emissions"
              href="/shop?cat=exhaust"
              imageSrc="/images/categories/exhaust.webp"
              imageAlt="Exhaust and emissions parts"
            />
            <CategoryCard
              title="Tires & Wheels"
              href="/shop?cat=tires"
              imageSrc="/images/categories/tires.webp"
              imageAlt="Tires and wheels"
            />
            <CategoryCard
              title="Electrical Systems"
              href="/shop?cat=electrical"
              imageSrc="/images/categories/electrical.webp"
              imageAlt="Electrical system parts"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        aria-label="Featured products"
        className="bg-background"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-foreground text-xl font-semibold">Featured Products</h2>
            <Button
              href="/shop"
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
            >
              Explore More <CornerUpRight className="ml-1 inline-block h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            <ProductCard
              title="Spark Plug Set"
              href="/product/spark-plug-set"
              imageSrc="/images/products/spark-plug.webp"
              imageAlt="Spark plug set"
              priceMinor={4500000}
            />
            <ProductCard
              title="Brake Pads"
              href="/product/brake-pads"
              imageSrc="/images/products/brake-pads.webp"
              imageAlt="Brake pads"
              priceMinor={4500000}
            />
            <ProductCard
              title="Tire Wheels"
              href="/product/tire-wheels"
              imageSrc="/images/products/tires.webp"
              imageAlt="Tire wheels"
              priceMinor={4500000}
            />
            <ProductCard
              title="Alternator"
              href="/product/alternator"
              imageSrc="/images/products/alternator.webp"
              imageAlt="Alternator"
              priceMinor={4500000}
            />
          </div>
        </div>
      </section>
      {/* Deals / Promotions grid */}
      <section
        aria-label="Deals"
        className="bg-background"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PromoTile
              className="h-auto md:row-span-2 md:h-[400px]"
              title="10% Off"
              subtitle="Brake Pads"
              body="$450.00 $405.00"
              ctaHref="/shop?cat=brakes"
              ctaLabel="Grab This Deal"
              imageSrc="/images/deals/brake.webp"
              imageAlt="Brake pads"
              priority
            />
            <PromoTile
              className="md:col-span-2"
              title="30% Off All Engine Parts —"
              subtitle="Ends in 48 Hours"
              ctaHref="/shop?cat=engine"
              ctaLabel="Grab This Deal"
              imageSrc="/images/deals/sales.webp"
              imageAlt="Engine parts"
            />
            <PromoTile
              title="LED Headlight Bulbs"
              subtitle="New Arrivals"
              ctaHref="/shop?cat=lighting"
              ctaLabel="Shop Now"
              imageSrc="/images/deals/led-bulb.webp"
              imageAlt="LED bulb"
            />
            <PromoTile
              title="Starting From $450.00"
              subtitle="Air-Intake System"
              ctaHref="/shop?cat=intake"
              ctaLabel="Grab This Deal"
              imageSrc="/images/deals/intake.webp"
              imageAlt="Air intake"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section
        aria-label="Best sellers"
        className="bg-background"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-foreground text-xl font-semibold">Best Sellers</h2>
            <Button
              href="/shop"
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
            >
              Explore More <CornerUpRight className="ml-1 inline-block h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            <ProductCard
              title="Spark Plug Set"
              href="/product/spark-plug-set"
              imageSrc="/images/products/spark-plug.webp"
              imageAlt="Spark plug set"
              priceMinor={4500000}
            />
            <ProductCard
              title="Brake Pads"
              href="/product/brake-pads"
              imageSrc="/images/products/brake-pads.webp"
              imageAlt="Brake pads"
              priceMinor={4500000}
            />
            <ProductCard
              title="Tire Wheels"
              href="/product/tire-wheels"
              imageSrc="/images/products/tires.webp"
              imageAlt="Tire wheels"
              priceMinor={4500000}
            />
            <ProductCard
              title="Alternator"
              href="/product/alternator"
              imageSrc="/images/products/alternator.webp"
              imageAlt="Alternator"
              priceMinor={4500000}
            />
          </div>
        </div>
      </section>

      {/* Assurances / service features */}
      <section
        aria-label="Store assurances"
        className="bg-card/60"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          {/* CHANGE IS HERE:
      - Changed 'grid-cols-1' to 'grid-cols-2'
      - Removed 'sm:grid-cols-2' (it's no longer needed)
    */}
          <ul className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <li className="flex flex-col items-center">
              <ShieldCheck
                aria-hidden
                className="text-primary h-6 w-6"
              />
              <h3 className="text-foreground mt-3 text-sm font-semibold">
                Satisfaction Guaranteed
              </h3>
              <p className="text-foreground/70 mt-1 max-w-[22ch] text-sm">
                Quality auto parts you can trust with a hassle‑free return policy.
              </p>
            </li>
            <li className="flex flex-col items-center">
              <CreditCard
                aria-hidden
                className="text-primary h-6 w-6"
              />
              <h3 className="text-foreground mt-3 text-sm font-semibold">Easy & Secure Payment</h3>
              <p className="text-foreground/70 mt-1 max-w-[26ch] text-sm">
                Checkout securely with fast and reliable payment options.
              </p>
            </li>
            <li className="flex flex-col items-center">
              <Truck
                aria-hidden
                className="text-primary h-6 w-6"
              />
              <h3 className="text-foreground mt-3 text-sm font-semibold">Fast Delivery</h3>
              <p className="text-foreground/70 mt-1 max-w-[26ch] text-sm">
                Get your auto parts delivered quickly and on time.
              </p>
            </li>
            <li className="flex flex-col items-center">
              <Headphones
                aria-hidden
                className="text-primary h-6 w-6"
              />
              <h3 className="text-foreground mt-3 text-sm font-semibold">24/7 Support</h3>
              <p className="text-foreground/70 mt-1 max-w-[24ch] text-sm">
                Always here to help, reach out anytime you need us.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA band */}
      <section
        aria-label="Get the best auto parts"
        className="bg-background hidden md:block"
      >
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                Get the Best Auto Parts
                <br />
                Delivered Fast
              </h2>
              <Button
                href="/shop"
                variant="solid"
                size="lg"
                className="mt-6"
                justify="center"
              >
                Shop Quality Auto Parts Today
              </Button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src="/images/cta/engine.webp"
                alt="High-performance engine"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
