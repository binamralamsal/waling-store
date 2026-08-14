import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import type { BreadcrumbItem } from "#/components/admin-page-wrapper";
import { FormNavigationBlocker } from "#/components/form-navigation-blocker";
import { useAppForm } from "#/components/form/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { useSidebar } from "#/components/ui/sidebar";
import { Skeleton } from "#/components/ui/skeleton";
import {
  currentUserOptions,
  getUserOptions,
} from "#/features/auth/auth.queries";
import { updateUserSchema } from "#/features/auth/auth.schema";
import type { UpdateUserSchemaInput } from "#/features/auth/auth.schema";
import { updateUserFn } from "#/features/auth/server/functions/admin-user";
import { cn } from "#/lib/utils";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users_/$id")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    queryClient.prefetchQuery(getUserOptions(Number(params.id)));
  },
});

const breadcrumb: BreadcrumbItem[] = [
  { href: "/admin/users", label: "All Users" },
];

function RouteComponent() {
  const params = Route.useParams();
  const { isPending, error } = useQuery(getUserOptions(Number(params.id)));

  if (isPending) return <UserDetailsLoading />;
  if (error) return <NotFoundState />;

  return (
    <AdminPageWrapper pageTitle="Edit User" breadcrumbs={breadcrumb}>
      <UserDetailsForm />
      <ActiveSessionsTable />
      <DangerZoneCard />
    </AdminPageWrapper>
  );
}

function NotFoundState() {
  return (
    <AdminPageWrapper pageTitle="User Not Found" breadcrumbs={breadcrumb}>
      <div className="container flex flex-col items-center justify-center py-12">
        <h2 className="text-3xl font-bold tracking-tight">User not found</h2>
        <p className="text-muted-foreground mt-4 text-center">
          The user you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          to="/admin/users"
          className="bg-primary text-primary-foreground mt-8 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
        >
          Go Back
        </Link>
      </div>
    </AdminPageWrapper>
  );
}

function UserDetailsLoading() {
  const sidebar = useSidebar();

  return (
    <AdminPageWrapper pageTitle="Loading User" breadcrumbs={breadcrumb}>
      <div className="bg-card text-card-foreground container rounded-lg border px-0 shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="p-6">
          <div
            className={cn(
              "grid grid-cols-1 gap-6 lg:grid-cols-[6rem_1fr_1fr_1fr]",
              sidebar.open
                ? "md:grid-cols-[6rem_1fr]"
                : "md:grid-cols-[6rem_1fr_1fr]",
            )}
          >
            <Skeleton
              className={cn(
                "h-24 w-24 justify-self-center rounded-full",
                sidebar.open ? "md:row-span-3" : "md:row-span-2",
                "lg:row-span-1",
              )}
            />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="-col-start-2 flex gap-6 justify-self-end">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground container rounded-lg border px-0 shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6">
          <div className="rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-4 w-[90%]" />
                  ))}
              </div>
            </div>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border-t p-4">
                  <div className="grid grid-cols-4 gap-4">
                    {Array(4)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-4 w-[90%]" />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="border-destructive/20 bg-card text-card-foreground container rounded-lg border px-0 shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6">
          <div className="border-destructive/20 rounded-md border p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}

export function UserDetailsForm() {
  const sidebar = useSidebar();

  const params = Route.useParams();
  const userId = parseInt(params.id);

  const { data } = useSuspenseQuery(getUserOptions(userId));
  const { data: currentUser } = useSuspenseQuery(currentUserOptions());

  const queryClient = useQueryClient();

  const updateUser = useServerFn(updateUserFn);

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async (response) => {
      toast.success(response.message);
      await queryClient.invalidateQueries(getUserOptions(userId));
      if (currentUser?.user.id === userId) {
        await queryClient.invalidateQueries(currentUserOptions());
      }
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: data?.name ?? "",
      email: data?.email ?? "",
      role: data?.role ?? "",
    } as UpdateUserSchemaInput,
    validators: {
      onChange: updateUserSchema,
    },
    onSubmit: async ({ value }) => {
      await updateUserMutation.mutateAsync({
        data: {
          data: value,
          id: userId,
        },
      });
    },
  });

  const userIntiail = data?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <Card className="container px-0">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>View and edit user information</CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <FormNavigationBlocker />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.FormGroup
              className={cn(
                "grid items-start gap-6 lg:grid-cols-[6rem_1fr_1fr_1fr]",
                sidebar.open
                  ? "md:grid-cols-[6rem_1fr]"
                  : "md:grid-cols-[6rem_1fr_1fr]",
              )}
            >
              <Avatar
                className={cn(
                  "h-24 w-24 justify-self-center",
                  sidebar.open ? "md:row-span-3" : "md:row-span-2",
                  "lg:row-span-1",
                )}
              >
                <AvatarImage src={"/placeholder.svg"} />
                <AvatarFallback className="text-3xl">
                  {userIntiail}
                </AvatarFallback>
              </Avatar>
              <form.AppField
                name="name"
                children={(field) => (
                  <field.FormField>
                    <field.FormLabel>Name</field.FormLabel>
                    <field.FormInput type="text" placeholder="John Smith" />
                    <field.FormError />
                  </field.FormField>
                )}
              />
              <form.AppField
                name="email"
                children={(field) => (
                  <field.FormField>
                    <field.FormLabel>Email</field.FormLabel>
                    <field.FormInput
                      type="email"
                      placeholder="email@website.com"
                    />
                    <field.FormError />
                  </field.FormField>
                )}
              />
              <form.AppField
                name="role"
                children={(field) => (
                  <field.FormField>
                    <field.FormLabel>Role</field.FormLabel>

                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as "admin" | "user")
                      }
                    >
                      <SelectTrigger
                        aria-label="Select a role suitable for this user"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Normal User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <field.FormError />
                    <field.FormDescription>
                      Admins can access the admin panel, and do whatever they
                      want.
                    </field.FormDescription>
                  </field.FormField>
                )}
              />
              <div className="col-span-full grid gap-2 md:grid-cols-2 md:justify-self-end">
                <ChangePasswordForm />
                <form.FormButton
                  disabled={form.state.isSubmitting}
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {form.state.isSubmitting && (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </form.FormButton>
              </div>
            </form.FormGroup>
          </form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const params = Route.useParams();
  const queryClient = useQueryClient();

  const changeUserPasswordMutation = useMutation(
    api.users.admin.changePassword.mutationOptions({
      onSuccess: async (response) => {
        setIsPasswordDialogOpen(false);

        toast.success(response.message);
        form.reset();
        queryClient.invalidateQueries(
          api.users.admin.get.queryOptions({ input: { params } }),
        );
      },
    }),
  );
  const form = useAppForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onChange: changePasswordClientSchema,
    },
    onSubmit: async ({ value }) => {
      await changeUserPasswordMutation.mutateAsync({
        body: { password: value.newPassword },
        params,
      });
    },
  });

  const id = useId();

  return (
    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full md:w-auto">
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter a new password for this user.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
          id={id}
        >
          <form.AppField
            name="newPassword"
            children={(field) => (
              <field.FormField>
                <field.FormLabel>New Password</field.FormLabel>
                <field.FormInput placeholder="********" type="password" />
                <field.FormError />
              </field.FormField>
            )}
          />
          <form.AppField
            name="confirmPassword"
            children={(field) => (
              <field.FormField>
                <field.FormLabel>Confirm Password</field.FormLabel>
                <field.FormInput placeholder="********" type="password" />
                <field.FormError />
              </field.FormField>
            )}
          />
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsPasswordDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button form={id} type="submit" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting && (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            )}
            Save Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ActiveSessionsTable() {
  const params = Route.useParams();
  const navigate = useNavigate();

  const logoutUserMutation = useMutation(
    api.users.logout.mutationOptions({
      onSuccess: () => {
        navigate({ to: "/login" });
      },
    }),
  );

  const queryClient = useQueryClient();

  const terminateUserMutation = useMutation(
    api.users.admin.terminateSession.mutationOptions({
      onSuccess: async (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries(
          api.users.admin.get.queryOptions({ input: { params } }),
        );
      },
    }),
  );

  const { data: user } = useSuspenseQuery(
    api.users.admin.get.queryOptions({ input: { params } }),
  );

  return (
    <Card className="container px-0">
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          All devices where this user is currently logged in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-4">IP Address</TableHead>
                <TableHead className="p-4">Location</TableHead>
                <TableHead className="p-4">Browser</TableHead>
                <TableHead className="w-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
              {user.sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="p-4 font-medium">
                    {session.ip}
                    {session.isCurrent && (
                      <Badge variant="outline" className="ml-2">
                        Current
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="p-4">
                    {[session.city, session.region, session.country]
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="p-4">
                    {[session.browser, session.os].filter(Boolean).join(" / ")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {session.isCurrent ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => logoutUserMutation.mutateAsync({})}
                          >
                            Logout
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              terminateUserMutation.mutateAsync({
                                params: { id: session.id },
                              })
                            }
                          >
                            Terminate Session
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function DangerZoneCard() {
  const params = Route.useParams();
  const { data: user } = useSuspenseQuery(
    api.users.admin.get.queryOptions({ input: { params } }),
  );
  const { data: currentUser } = useSuspenseQuery(
    api.users.current.user.queryOptions(),
  );
  const navigate = useNavigate();

  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);

  const isDeletingCurrentUser = currentUser?.user.id === user?.id;
  const deleteUserMutation = useMutation(
    api.users.admin.delete.mutationOptions({
      onSuccess: async (data) => {
        setDeleteDialogOpened(false);
        toast.success(data.message);
        navigate({ to: "/admin/users" });
      },
    }),
  );

  if (!user || !currentUser) return null;

  return (
    <Card className="border-destructive/20 container px-0">
      <CardHeader className="text-destructive">
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription className="text-destructive/80">
          Destructive actions that cannot be undone
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-destructive/20 rounded-md border p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-medium">
                  Delete {isDeletingCurrentUser ? "Your" : "User"} Account
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isDeletingCurrentUser
                    ? "Permanently delete your account and all of your data"
                    : "Permanently delete this user and all of their data"}
                </p>
              </div>
              <AlertDialog
                open={deleteDialogOpened}
                onOpenChange={setDeleteDialogOpened}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2Icon className="h-4 w-4" />
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{" "}
                      {isDeletingCurrentUser ? "your" : "the user"} account and
                      remove all associated data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={() => deleteUserMutation.mutateAsync({ params })}
                    >
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
