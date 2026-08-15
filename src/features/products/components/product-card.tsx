import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Product, WithContext } from "schema-dts";

import { PlaceholderImage } from "#/components/placeholder-image";
import { site } from "@/config/site";

type ProductCardProps = {
  name: string;
  price: number;
  salePrice: number | null;
  slug: string;
  category: string | null | undefined;
  unit?: string | null;
  images: Partial<{ url: string }[]>;
};

export function ProductCard({
  name,
  price,
  salePrice,
  slug,
  category,
  unit,
  images,
}: ProductCardProps) {
  const productUrl = `/shop/${slug}`;

  const firstImage = images[0];
  const secondImage = images[1];

  const discount = salePrice
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  const displayPrice = salePrice ?? price;

  const jsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: firstImage?.url || "/file.svg",
    description: `Buy ${name} at a great price!`,
    sku: slug,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: displayPrice,
      url: productUrl,
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        merchantReturnDays: 7,
      },
      availability: "InStock",
      seller: {
        "@type": "Organization",
        name: site.name,
      },
    },
    category: category || "General",
  };

  return (
    <article>
      <div className="relative aspect-square overflow-hidden bg-background">
        <Link to={productUrl} className="group block size-full">
          {firstImage?.url ? (
            <img
              src={firstImage.url}
              alt={name}
              width={600}
              height={600}
              className="size-full object-cover"
            />
          ) : (
            <PlaceholderImage className="size-full object-cover" />
          )}

          {secondImage?.url && (
            <img
              src={secondImage.url}
              alt=""
              aria-hidden="true"
              width={600}
              height={600}
              className="
          absolute inset-0
          size-full object-cover
          opacity-0
          transition-[opacity,transform]
          duration-500
          ease-out
          group-hover:scale-105
          group-hover:opacity-100
        "
            />
          )}

          {salePrice && (
            <span
              className="
          absolute top-3 left-3
          bg-background px-2 py-1
          text-[10px] font-semibold
          uppercase tracking-wider
        "
            >
              {discount}% off
            </span>
          )}
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          aria-label={`Add ${name} to wishlist`}
          className="
      absolute right-3 bottom-3
      flex size-9 items-center justify-center
      rounded-full bg-background
      shadow-sm
      opacity-0
      transition-all duration-200
      hover:scale-105 hover:bg-background
      group-hover:opacity-100
    "
        >
          <Heart className="size-4" />
        </button>
      </div>

      {/* Product information */}
      <div className="flex items-start justify-between gap-2 pt-3">
        <div className="min-w-0">
          <Link
            to={productUrl}
            className="block text-sm font-medium hover:underline"
          >
            {name}
          </Link>

          {unit && <p className="mt-1 text-xs text-muted-foreground">{unit}</p>}

          {/* {category && (
            <p className="mt-1 text-xs text-muted-foreground">{category}</p>
          )} */}
        </div>

        <div className="shrink-0 text-right text-sm">
          {salePrice ? (
            <div className="flex flex-col">
              <span className="font-medium">
                Rs. {salePrice.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                Rs. {price.toLocaleString()}
              </span>
            </div>
          ) : (
            <span>Rs. {price.toLocaleString()}</span>
          )}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </article>
  );
}
