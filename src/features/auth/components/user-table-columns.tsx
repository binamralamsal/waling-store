import { MoreHorizontalIcon, ShieldIcon, UserIcon } from "lucide-react";

import { useState } from "react";

import type { ColumnDef, StockFeatures } from "@tanstack/react-table";
import { Link, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { allUsersOptions, currentUserOptions } from "../auth.queries";
import { useServerFn } from "@tanstack/react-start";
import { deleteUserFn } from "../server/functions/admin-user";
import { toast } from "#/components/ui/toast";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
};

export const userTableColumns: ColumnDef<StockFeatures, User>[] = [
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => (
      <Badge className="inline-flex gap-1 py-1 capitalize">
        {row.original.role === "admin" ? (
          <ShieldIcon className="h-4 w-4" />
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
        <span>{row.original.role}</span>
      </Badge>
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
      const user = row.original;

      const queryClient = useQueryClient();
      const searchParams = useSearch({ from: "/admin/users" });

      const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
      const [actionsDropdownOpened, setActionsDropdownOpened] = useState(false);

      const { data } = useQuery(currentUserOptions());

      const isDeletingCurrentUser = data?.user.id === user.id;
      const nameWithId = `${row.original.name} #${row.original.id}`;

      const deleteUser = useServerFn(deleteUserFn);

      const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: async (response) => {
          toast.add({ type: "success", description: response.message });
          await queryClient.invalidateQueries(
            allUsersOptions({ values: searchParams }),
          );
        },
        onError: (response) => {
          toast.add({ type: "error", description: response.message });
        },
      });

      async function handleDeleteUser() {
        setDeleteDialogOpened(false);

        await deleteUserMutation.mutateAsync({
          data: user.id,
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
                      to="/admin/users/$id"
                      params={{ id: user.id.toString() }}
                    >
                      Edit
                    </Link>
                  }
                />

                {!isDeletingCurrentUser && (
                  <DropdownMenuItem
                    onClick={() => {
                      setActionsDropdownOpened(false);
                      setDeleteDialogOpened(true);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {!isDeletingCurrentUser && (
            <AlertDialog
              open={deleteDialogOpened}
              onOpenChange={setDeleteDialogOpened}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure you want to delete{" "}
                    <strong>{nameWithId} user?</strong>
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete{" "}
                    <strong>{nameWithId}</strong> from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                  <Button variant="destructive" onClick={handleDeleteUser}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      );
    },
  },
];
