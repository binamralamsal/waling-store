import { useEffect } from "react";

import { PlaceholderImage } from "@/components/placeholder-image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";

import { cn } from "#/lib/utils";

interface ProductImage {
  id: number;
  url: string;
  name: string;
}

interface GalleryProps {
  images: ProductImage[];
  inSale?: boolean;
  activeImageIndex?: number;
  onActiveImageChange?: (index: number) => void;
}

const THUMBNAIL_SIZE = 80;

function Thumbnail({
  image,
  index,
  activeImageIndex,
  onActiveImageChange,
}: {
  image: ProductImage;
  index: number;
  activeImageIndex: number;
  onActiveImageChange: (index: number) => void;
}) {
  const { api } = useCarousel();

  useEffect(() => {
    if (!api) return;

    api.scrollTo(activeImageIndex);
  }, [api, activeImageIndex]);

  return (
    <CarouselItem
      className="
        basis-auto
        sm:basis-auto
        md:ml-1
      "
    >
      <button
        type="button"
        onClick={() => onActiveImageChange(index)}
        aria-label={`View ${image.name}`}
        className={cn(
          `
            relative
            size-20
            shrink-0
            overflow-hidden
            bg-muted
            transition
          `,
          activeImageIndex === index
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
            : "opacity-65 hover:opacity-100",
        )}
      >
        <img
          src={image.url}
          alt={image.name}
          width={THUMBNAIL_SIZE}
          height={THUMBNAIL_SIZE}
          className="size-full object-cover"
          loading="lazy"
        />
      </button>
    </CarouselItem>
  );
}

function ThumbnailNavigation() {
  const { canScrollNext, canScrollPrev } = useCarousel();

  if (!canScrollNext && !canScrollPrev) {
    return null;
  }

  return (
    <>
      <CarouselPrevious
        variant="ghost"
        className="
          left-1/2
          top-0
          size-7
          -translate-x-1/2
          -translate-y-1/2
          rotate-90
          rounded-full
          bg-background
          shadow-sm
          sm:left-1/2
        "
      />

      <CarouselNext
        variant="ghost"
        className="
          bottom-0
          left-1/2
          top-auto
          size-7
          -translate-x-1/2
          translate-y-1/2
          rotate-90
          rounded-full
          bg-background
          shadow-sm
          sm:left-1/2
        "
      />
    </>
  );
}

export function ProductImagesGallery({
  images,
  inSale = false,
  activeImageIndex: controlledIndex,
  onActiveImageChange,
}: GalleryProps) {
  const activeImageIndex = controlledIndex ?? 0;

  const activeImage = images[activeImageIndex] ?? images[0];

  if (!activeImage) {
    return <PlaceholderImage className="aspect-square w-full bg-muted" />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
      <div className="order-2 min-w-0 sm:order-1">
        <Carousel
          orientation="vertical"
          opts={{
            align: "start",
          }}
          className="hidden h-full sm:block"
        >
          <CarouselContent className="h-full max-h-160">
            {images.map((image, index) => (
              <Thumbnail
                key={image.id}
                image={image}
                index={index}
                activeImageIndex={activeImageIndex}
                onActiveImageChange={onActiveImageChange ?? (() => {})}
              />
            ))}
          </CarouselContent>

          <ThumbnailNavigation />
        </Carousel>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full sm:hidden"
        >
          <CarouselContent className="gap-2">
            {images.map((image, index) => (
              <Thumbnail
                key={image.id}
                image={image}
                index={index}
                activeImageIndex={activeImageIndex}
                onActiveImageChange={onActiveImageChange ?? (() => {})}
              />
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-1" />
          <CarouselNext className="right-1" />
        </Carousel>
      </div>

      <div className="order-1 relative aspect-square overflow-hidden bg-muted sm:order-2">
        <img
          src={activeImage.url}
          alt={activeImage.name}
          width={600}
          height={600}
          className="
            size-full
            object-contain
          "
        />

        {inSale && (
          <span
            className="
              absolute
              top-4 left-4
              bg-primary
              px-3 py-1
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-primary-foreground
            "
          >
            Sale
          </span>
        )}

        <span
          className="
            absolute
            right-4 bottom-4
            bg-background/85
            px-3 py-1
            text-xs
            backdrop-blur
          "
        >
          {activeImageIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}
