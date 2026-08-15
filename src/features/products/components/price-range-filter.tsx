import { useCallback, useEffect, useMemo } from "react";

import { getRouteApi, useNavigate } from "@tanstack/react-router";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "#/components/ui/input";
import { Slider } from "#/components/ui/slider";

import { MAX_PRICE_RANGE, MIN_PRICE_RANGE } from "@/config/constants";
import { useSliderWithInput } from "@/hooks/use-slider-with-input";

function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const routeAPI = getRouteApi("/_main/shop");

export function PriceRangeFilter() {
  const searchParams = routeAPI.useSearch();
  const navigate = useNavigate();

  const initialValue = useMemo(() => [MIN_PRICE_RANGE, MAX_PRICE_RANGE], []);

  const getPriceRangeFromURL = useCallback(() => {
    const urlPriceRange = searchParams.priceRange;

    if (!urlPriceRange) {
      return initialValue;
    }

    const [min, max] = urlPriceRange;

    return [
      Math.max(MIN_PRICE_RANGE, min || MIN_PRICE_RANGE),
      Math.min(MAX_PRICE_RANGE, max || MAX_PRICE_RANGE),
    ];
  }, [initialValue, searchParams]);

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({
    minValue: MIN_PRICE_RANGE,
    maxValue: MAX_PRICE_RANGE,
    initialValue: getPriceRangeFromURL(),
  });

  const updateURLWithPriceRange = useCallback(
    (updatedPriceRange: [number, number]) => {
      const updatedSearchParams = {
        ...searchParams,
      };

      if (
        updatedPriceRange[0] === MIN_PRICE_RANGE &&
        updatedPriceRange[1] === MAX_PRICE_RANGE
      ) {
        delete updatedSearchParams.priceRange;
      } else {
        updatedSearchParams.priceRange = updatedPriceRange;
      }

      navigate({
        to: "/shop",
        search: updatedSearchParams,
        resetScroll: false,
      });
    },
    [navigate, searchParams],
  );

  const debouncedUpdateURLWithPriceRange = useMemo(
    () => debounce(updateURLWithPriceRange, 500),
    [updateURLWithPriceRange],
  );

  useEffect(() => {
    handleSliderChange(getPriceRangeFromURL());
  }, [getPriceRangeFromURL, handleSliderChange]);

  const handleSliderChangeWithURLUpdate = (newValue: [number, number]) => {
    handleSliderChange(newValue);
    debouncedUpdateURLWithPriceRange(newValue);
  };

  const handleInputBlurWithURLUpdate = (value: string, index: number) => {
    validateAndUpdateValue(value, index);

    debouncedUpdateURLWithPriceRange(sliderValue as [number, number]);
  };

  return (
    <AccordionItem
      value="price"
      className="border-b border-border last:border-b-0"
    >
      <AccordionTrigger
        className="
          py-4
          text-sm font-medium
          hover:no-underline
        "
      >
        Price range
      </AccordionTrigger>

      <AccordionContent className="pb-5">
        <div className="space-y-4">
          {/* Current range */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Price</span>

            <span className="font-medium">
              Rs. {sliderValue[0].toLocaleString()} –{" "}
              {sliderValue[1].toLocaleString()}
            </span>
          </div>

          {/* Slider */}
          <div className="px-1 py-1">
            <Slider
              className="w-full"
              value={sliderValue}
              onValueChange={(numbers) =>
                handleSliderChangeWithURLUpdate(numbers as [number, number])
              }
              min={MIN_PRICE_RANGE}
              max={MAX_PRICE_RANGE}
            />
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Input
              className="
                h-9 
                px-3
                text-sm
              "
              type="text"
              inputMode="decimal"
              value={inputValues[0]}
              onChange={(e) => handleInputChange(e, 0)}
              onBlur={() => handleInputBlurWithURLUpdate(inputValues[0], 0)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInputBlurWithURLUpdate(inputValues[0], 0);
                }
              }}
              aria-label="Enter minimum price"
            />

            <span className="text-sm text-muted-foreground">–</span>

            <Input
              className="
                h-9 
                px-3
                text-sm
              "
              type="text"
              inputMode="decimal"
              value={inputValues[1]}
              onChange={(e) => handleInputChange(e, 1)}
              onBlur={() => handleInputBlurWithURLUpdate(inputValues[1], 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInputBlurWithURLUpdate(inputValues[1], 1);
                }
              }}
              aria-label="Enter maximum price"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
