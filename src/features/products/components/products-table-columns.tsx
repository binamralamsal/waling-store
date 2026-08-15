import { MoreHorizontalIcon } from "lucide-react";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { ColumnDef, StockFeatures } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toast } from "#/components/ui/toast";
import { allProductsOptions } from "../products.queries";
import { deleteProductFn } from "../server/functions/products";

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  unit: string;
  status: string;
  category: {
    id: number | null;
    name: string | null;
    slug: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export const productsTableColumns: ColumnDef<StockFeatures, Product>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => `Rs. ${row.original.price}`,
  },
  {
    accessorKey: "salePrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sale Price" />
    ),
    cell: ({ row }) =>
      row.original.salePrice !== null
        ? `Rs. ${row.original.salePrice}`
        : "Null",
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge className="capitalize">{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => row.original.category?.name ?? "None",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {row.original.createdAt.toDateString()}
          </TooltipTrigger>
          <TooltipContent>
            {row.original.createdAt.toLocaleString()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {row.original.updatedAt.toDateString()}
          </TooltipTrigger>
          <TooltipContent>
            {row.original.updatedAt.toLocaleString()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      const product = row.original;

      const queryClient = useQueryClient();
      const searchParams = useSearch({
        from: "/admin/products",
      });

      const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
      const [actionsDropdownOpened, setActionsDropdownOpened] = useState(false);

      const deleteProduct = useServerFn(deleteProductFn);

      const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: async (response) => {
          toast.add({
            type: "success",
            description: response.message,
          });

          await queryClient.invalidateQueries(
            allProductsOptions({
              values: searchParams,
            }),
          );
        },
        onError: (error) => {
          toast.add({
            type: "error",
            description: error.message,
          });
        },
      });

      const nameWithId = `${product.name} #${product.id}`;

      async function handleDeleteProduct() {
        setDeleteDialogOpened(false);

        await deleteProductMutation.mutateAsync({
          data: product.id,
        });
      }

      return (
        <>
          <DropdownMenu
            open={actionsDropdownOpened}
            onOpenChange={setActionsDropdownOpened}
          >
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  nativeButton={false}
                  render={
                    <Link
                      to="/admin/products/$id/edit"
                      params={{ id: product.id.toString() }}
                    >
                      Edit
                    </Link>
                  }
                />

                <DropdownMenuItem
                  onClick={() => {
                    setActionsDropdownOpened(false);
                    setDeleteDialogOpened(true);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={deleteDialogOpened}
            onOpenChange={setDeleteDialogOpened}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure you want to delete{" "}
                  <strong>{nameWithId} product?</strong>
                </AlertDialogTitle>

                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  <strong>{nameWithId}</strong> from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <Button
                  variant="destructive"
                  onClick={handleDeleteProduct}
                  disabled={deleteProductMutation.isPending}
                >
                  {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
