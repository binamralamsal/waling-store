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
import { allCategoriesOptions } from "../products.queries";
import { deleteCategoryFn } from "../server/functions/categories";

export type Category = {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export const categoriesTableColumns: ColumnDef<StockFeatures, Category>[] = [
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
      const category = row.original;

      const queryClient = useQueryClient();
      const searchParams = useSearch({
        from: "/admin/product-categories",
      });

      const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
      const [actionsDropdownOpened, setActionsDropdownOpened] = useState(false);

      const deleteCategory = useServerFn(deleteCategoryFn);

      const deleteCategoryMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: async (response) => {
          toast.add({
            type: "success",
            description: response.message,
          });

          await queryClient.invalidateQueries(
            allCategoriesOptions({ values: searchParams }),
          );
        },
        onError: (error) => {
          toast.add({
            type: "error",
            description: error.message,
          });
        },
      });

      const nameWithId = `${category.name} #${category.id}`;

      async function handleDeleteCategory() {
        setDeleteDialogOpened(false);

        await deleteCategoryMutation.mutateAsync({
          data: category.id,
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
                      to="/admin/product-categories/$id/edit"
                      params={{ id: category.id.toString() }}
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
                  <strong>{nameWithId} category?</strong>
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
                  onClick={handleDeleteCategory}
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
