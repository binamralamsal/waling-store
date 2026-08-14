import { toast } from "sonner";

import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RegisterUserClientSchemaInput } from "../auth.schema";
import { registerUserClientSchema } from "../auth.schema";

import { useAppForm } from "@/components/form/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "#/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { registerUserFn } from "../server/functions/user";
import { currentUserOptions } from "../auth.queries";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: useServerFn(registerUserFn),
  });

  const redirectUrl = useSearch({
    from: "/_main/signup",
    select: (value) => value.redirect_url,
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies RegisterUserClientSchemaInput,
    validators: {
      onChange: registerUserClientSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword, ...registerData } = value;
      const response = await mutation.mutateAsync({ data: registerData });
      if (response.status === "SUCCESS") {
        form.reset();
        toast.success(response.message);
        navigate({
          href: redirectUrl || "/",
        });
        queryClient.invalidateQueries(currentUserOptions());
      } else {
        toast.error(response.message);
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.FormGroup>
              <form.AppField
                name="name"
                children={(field) => (
                  <field.FormField>
                    <field.FormLabel>Full Name</field.FormLabel>
                    <field.FormInput placeholder="John Doe" />
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
                      placeholder="john@example.com"
                      type="email"
                    />
                    <field.FormError />
                  </field.FormField>
                )}
              />

              {/* <form.AppField
                name="phone"
                children={(field) => (
                  <field.FormField>
                    <field.FormLabel>Phone Number</field.FormLabel>
                    <field.FormInput placeholder="98XXXXXXXX" type="tel" />
                    <field.FormError />
                  </field.FormField>
                )}
              /> */}

              <form.AppField
                name="password"
                children={(field) => (
                  <field.FormField>
                    <field.FormLabel>Password</field.FormLabel>
                    <field.FormPasswordInput placeholder="********" />
                    <field.FormError />
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

              <form.FormField>
                <form.FormButton type="submit">Create Account</form.FormButton>
                <form.FormDescription className="text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="hover:underline">
                    Sign in
                  </Link>
                </form.FormDescription>
              </form.FormField>
            </form.FormGroup>
          </form>
        </CardContent>
      </Card>
      <form.FormDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Privacy Policy
        </a>
        .
      </form.FormDescription>
    </div>
  );
}
