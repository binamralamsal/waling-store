import { Separator } from "#/components/ui/separator";
import { ProductImagesGallery } from "#/features/products/components/product-images-gallery";
import { productBySlugOptions } from "#/features/products/products.queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_main/shop_/$slug")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(
      productBySlugOptions({ slug: params.slug }),
    );
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const { data: product } = useSuspenseQuery(
    productBySlugOptions({ slug: params.slug }),
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <section className="container grid gap-8 py-4 md:grid-cols-2 md:py-6 lg:gap-16 lg:py-8">
      <ProductImagesGallery
        images={product.images}
        inSale={Boolean(product.salePrice)}
        activeImageIndex={activeImageIndex}
        onActiveImageChange={setActiveImageIndex}
      />

      <div className="space-y-4 lg:space-y-6">
        <div className="space-y-2">
          {product.category && product.category.slug && (
            <Link
              to="/shop"
              search={{ categories: [product.category.slug] }}
              className="text-primary hover:text-primary/80 text-sm font-medium transition"
            >
              {product.category.name}
            </Link>
          )}

          <h2 className="text-2xl font-semibold text-balance md:text-3xl">
            {product.name}
          </h2>
        </div>
        <Separator />

        <div className="flex items-center gap-4">
          {product.salePrice ? (
            <>
              <p className="text-3xl font-bold text-gray-900">
                MRP Rs. {product.salePrice.toLocaleString()}
              </p>
              <p className="text-xl text-gray-500 line-through">
                Rs. {product.price.toLocaleString()}
              </p>
              <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-semibold text-green-700">
                {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
              </span>
            </>
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </p>
          )}
        </div>

        <p>{product.description}</p>
      </div>
    </section>
  );
}
