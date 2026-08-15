import { ArrowLeft, CheckIcon, MinusIcon, PlusIcon } from "lucide-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductImagesGallery } from "#/features/products/components/product-images-gallery";
import { productBySlugOptions } from "#/features/products/products.queries";
import { useState } from "react";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/_main/shop_/$slug")({
  component: RouteComponent,

  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(
      productBySlugOptions({
        slug: params.slug,
      }),
    );
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product } = useSuspenseQuery(
    productBySlugOptions({
      slug: params.slug,
    }),
  );

  return (
    <main className="container px-4 py-8 lg:px-8 lg:py-12">
      {/* Back to shop */}
      <Link
        to="/shop"
        className="
          mb-8 inline-flex items-center gap-2
          text-sm text-muted-foreground
          transition-colors
          hover:text-foreground
        "
      >
        <ArrowLeft className="size-4" />
        Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductImagesGallery
          images={product.images}
          inSale={Boolean(product.salePrice)}
          activeImageIndex={activeImageIndex}
          onActiveImageChange={setActiveImageIndex}
        />

        <div className="flex flex-col justify-center">
          {/* Category */}
          {product.category?.slug && (
            <Link
              to="/shop"
              search={{
                categories: [product.category.slug],
              }}
              className="
        w-fit
        text-xs font-semibold
        uppercase tracking-[0.2em]
        text-muted-foreground
        transition-colors
        hover:text-foreground
      "
            >
              {product.category.name}
            </Link>
          )}

          {/* Product name */}
          <h1
            className="
      mt-4
      max-w-xl
      font-serif
      text-4xl
      leading-[0.95]
      tracking-tight
      sm:text-5xl
      lg:text-6xl
    "
          >
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-medium">
                  Rs. {product.salePrice.toLocaleString()}
                </span>

                <span className="text-base text-muted-foreground line-through">
                  Rs. {product.price.toLocaleString()}
                </span>

                <span
                  className="
            bg-primary
            px-2.5 py-1
            text-[10px]
            font-semibold
            uppercase
            tracking-wider
            text-primary-foreground
          "
                >
                  {Math.round(
                    ((product.price - product.salePrice) / product.price) * 100,
                  )}
                  % off
                </span>
              </>
            ) : (
              <span className="text-2xl font-medium">
                Rs. {product.price.toLocaleString()}
              </span>
            )}

            {product.unit && (
              <span className="text-sm text-muted-foreground">
                / {product.unit}
              </span>
            )}
          </div>

          {product.description && (
            <p
              className="
        mt-7
        max-w-lg
        text-sm
        leading-7
        text-muted-foreground
      "
            >
              {product.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <div
              className="
        flex
        h-12
        items-center
        border border-border
      "
            >
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="
          flex h-full w-11
          items-center justify-center
          transition-colors
          hover:bg-muted
        "
              >
                <MinusIcon className="size-4" />
              </button>

              <span className="w-10 text-center text-sm">{quantity}</span>

              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="
          flex h-full w-11
          items-center justify-center
          transition-colors
          hover:bg-muted
        "
              >
                <PlusIcon className="size-4" />
              </button>
            </div>

            {/* Add to cart */}
            <Button
              type="button"
              // onClick={handleAddToCart}
              className="h-12 min-w-44 px-6"
            >
              <CheckIcon data-icon="inline-start" />
              Added to cart
            </Button>
          </div>

          <div
            className="
      mt-9
      grid
      gap-x-8
      gap-y-4
      border-t border-border
      pt-6
      text-sm
      text-muted-foreground
      sm:grid-cols-2
    "
          >
            <p>Freshness guaranteed</p>
            <p>Local delivery available</p>
            <p>Carefully packed</p>
            <p>Easy returns</p>
          </div>
        </div>
      </div>
    </main>
  );
}
