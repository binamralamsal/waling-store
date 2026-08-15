import { LoaderCircleIcon } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { AdminPageWrapper } from "@/components/admin-page-wrapper";
import { useAppForm, useFormContext } from "@/components/form/hooks";
import { FormNavigationBlocker } from "@/components/form-navigation-blocker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { newUserClientSchema } from "@/features/auth/auth.schema";
import type {
  NewUserClientSchema,
  NewUserClientSchemaInput,
} from "@/features/auth/auth.schema";
import { useServerFn } from "@tanstack/react-start";
import { createUserFn } from "#/features/auth/server/functions/admin-user";
import { toast } from "#/components/ui/toast";

export const Route = createFileRoute("/admin/users_/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const createUser = useServerFn(createUserFn);
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async (response) => {
      if (response.status === "SUCCESS") {
        toast.add({ type: "success", description: response.message });
        navigate({
          to: "/admin/users",
        });
      } else {
        toast.add({ type: "error", description: response.message });
      }
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
    validators: {
      onChange: newUserClientSchema,
    },
    onSubmit: async ({ value }) => {
      await createUserMutation.mutateAsync({
        data: {
          email: value.email,
          name: value.name,
          password: value.password,
          role: value.role,
        },
      });
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FormNavigationBlocker />
        <AdminPageWrapper
          breadcrumbs={[{ label: "All Users", href: "/admin/users" }]}
          pageTitle="Add New User"
          rightSideContent={<ActionButtons />}
        >
          <Card className="container px-0">
            <CardHeader>
              <CardTitle>Add User</CardTitle>
              <CardDescription>
                Add a new user by entering their name, email, role, and password
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <form.FormGroup className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <field.FormLabel>Name</field.FormLabel>
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
                    <field.FormField className="md:col-span-2 lg:col-auto">
                      <field.FormLabel>Role</field.FormLabel>

                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as "user" | "admin")
                        }
                      >
                        <field.FormSelectTrigger
                          aria-label="Select a role suitable for this user"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select role">
                            {field.state.value === "admin"
                              ? "Administrator"
                              : field.state.value === "user"
                                ? "Normal User"
                                : null}
                          </SelectValue>
                        </field.FormSelectTrigger>

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
              </form.FormGroup>

              <form.FormGroup className="grid items-start gap-6 md:grid-cols-2">
                <form.AppField
                  name="password"
                  children={(field) => (
                    <field.FormField>
                      <field.FormLabel>Password</field.FormLabel>
                      <field.FormPasswordInput placeholder="********" />
                      <field.FormError />
                      <field.FormDescription>
                        Enter a suitable password with at least 8 characters,
                        one number, one uppercase letter, and one symbol.
                      </field.FormDescription>
                    </field.FormField>
                  )}
                />
                <form.AppField
                  name="confirmPassword"
                  children={(field) => (
                    <field.FormField>
                      <field.FormLabel>Confirm Password</field.FormLabel>
                      <field.FormPasswordInput placeholder="********" />
                      <field.FormError />
                    </field.FormField>
                  )}
                />
              </form.FormGroup>
            </CardContent>
          </Card>
          <div className="grid gap-2 xs:grid-cols-2 md:hidden">
            <ActionButtons />
          </div>
        </AdminPageWrapper>
      </form>
    </form.AppForm>
  );
}

function ActionButtons() {
  const {
    state: { isSubmitting },
  } = useFormContext();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        type="button"
        nativeButton={false}
        render={<Link to="/admin/users">Discard</Link>}
      />
      <Button size="sm" type="submit" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
        <span>Add User</span>
      </Button>
    </>
  );
}
