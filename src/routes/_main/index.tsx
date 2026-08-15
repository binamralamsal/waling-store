import { Button } from "#/components/ui/button";
import { ProductCard } from "#/features/products/components/product-card";
import {
  allCategoriesOptions,
  allProductsOptions,
} from "#/features/products/products.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRightIcon,
  LeafIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";

const homeProductsOptions = allProductsOptions({
  values: { page: 1, pageSize: 8, status: ["published"] },
});
const homeCategoriesOptions = allCategoriesOptions({
  values: {
    page: 1,
    pageSize: 8,
  },
});

export const Route = createFileRoute("/_main/")({
  component: App,
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(homeProductsOptions),
      queryClient.ensureQueryData(homeCategoriesOptions),
    ]);
  },
});

function App() {
  const {
    data: { categories },
  } = useSuspenseQuery(homeCategoriesOptions);

  const {
    data: { products },
  } = useSuspenseQuery(homeProductsOptions);

  return (
    <main>
      <section className="container grid gap-4 sm:py-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative min-h-120 overflow-hidden bg-primary text-primary-foreground sm:min-h-150">
          <img
            src="/images/grocery-hero.png"
            alt="Fresh groceries in a canvas market bag"
            className="object-cover opacity-75 brightness-50 absolute"
          />
          <div className="relative flex min-h-120 flex-col justify-end gap-5 p-6 sm:min-h-150 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[.2em]">
              Good food, simply delivered
            </p>
            <h1 className="max-w-xl font-serif text-5xl leading-[.92] sm:text-7xl text-balance">
              Your best basket starts here.
            </h1>
            <p className="max-w-sm text-sm leading-6 text-primary-foreground/80">
              Fresh produce, pantry staples, and bakery favorites sourced from
              people who care.
            </p>
            <Button
              variant="secondary"
              className="w-fit"
              nativeButton={false}
              render={
                <Link to="/shop" className="group">
                  Shop the market{" "}
                  <ArrowRight
                    data-icon="inline-end"
                    className="group-hover:translate-x-0.5 transition"
                  />
                </Link>
              }
            ></Button>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-10 border border-border p-6 sm:p-10">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
              The Waling Store's Promise
            </p>
            <h2 className="max-w-md font-serif text-4xl leading-tight sm:text-5xl">
              A little closer to the source.
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              We work with small farms, independent makers, and neighborhood
              bakers to bring good ingredients to your door.
            </p>
            <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex gap-3">
                <LeafIcon className="text-primary" />
                <div>
                  <p className="text-sm font-medium">Picked with care</p>
                  <p className="text-xs text-muted-foreground">
                    Seasonal and fresh
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <TruckIcon className="text-primary" />
                <div>
                  <p className="text-sm font-medium">Easy delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your time
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheckIcon className="text-primary" />
                <div>
                  <p className="text-sm font-medium">Good ingredients</p>
                  <p className="text-xs text-muted-foreground">
                    Always know what&apos;s inside
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
              Browse the market
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl">Shop by aisle</h2>
          </div>
          <Link
            to="/shop"
            className="hidden items-center gap-2 text-sm underline underline-offset-4 sm:flex"
          >
            View everything <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              to="/shop"
              search={{ categories: [category.slug] }}
              key={category.slug}
              className="group"
            >
              <div className="relative aspect-[.84] overflow-hidden bg-muted">
                <img
                  src={category.image.url}
                  alt={category.name}
                  className=" relative object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="border-b border-border py-3">
                <p className="font-serif text-lg">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-14 md:py-16 lg:py-20">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
                Market favorites
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl">
                Good this week
              </h2>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm underline underline-offset-4"
            >
              Shop all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                category={product.category?.name}
                images={product.images}
                name={product.name}
                price={product.price}
                salePrice={product.salePrice}
                slug={product.slug}
                unit={product.unit}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 lg:py-20 container grid gap-8  lg:grid-cols-3">
        <div className="border-t border-border pt-5">
          <LeafIcon className="mb-5 text-primary" />
          <h3 className="font-serif text-2xl">Seasonal by nature</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The best food changes with the weather. Our selection follows the
            seasons, not the other way around.
          </p>
        </div>
        <div className="border-t border-border pt-5">
          <TruckIcon className="mb-5 text-primary" />
          <h3 className="font-serif text-2xl">Delivered your way</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Pick a delivery window that works for you, or collect from our
            neighborhood pantry.
          </p>
        </div>
        <div className="border-t border-border pt-5">
          <ChevronRightIcon className="mb-5 text-primary" />
          <h3 className="font-serif text-2xl">Need a hand?</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Our team is happy to help you find an ingredient, plan a meal, or
            choose a gift.
          </p>
        </div>
      </section>
    </main>
  );
}
