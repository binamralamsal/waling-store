import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type {
  GetAllCategoriesSchema,
  GetAllProductsSchema,
} from "./products.schema";
import {
  getAllCategoriesFn,
  getCategoryByIdFn,
} from "./server/functions/categories";
import {
  getAllProductsFn,
  getProductByIdFn,
  getProductBySlugFn,
} from "./server/functions/products";

export const allCategoriesOptions = ({
  values,
}: {
  values: Partial<GetAllCategoriesSchema>;
}) =>
  queryOptions({
    queryKey: ["categories", values],
    queryFn: () => getAllCategoriesFn({ data: values }),
    placeholderData: keepPreviousData,
  });

export const categoryByIdOptions = ({ id }: { id: number }) =>
  queryOptions({
    queryKey: ["category", id],
    queryFn: () => getCategoryByIdFn({ data: id }),
  });

export const productByIdOptions = ({ id }: { id: number }) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProductByIdFn({ data: id }),
  });

export const productBySlugOptions = ({ slug }: { slug: string }) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlugFn({ data: slug }),
  });

export const allProductsOptions = ({
  values,
}: {
  values: Partial<GetAllProductsSchema>;
}) =>
  queryOptions({
    queryKey: ["categories", values],
    queryFn: () => getAllProductsFn({ data: values }),
    placeholderData: keepPreviousData,
  });
