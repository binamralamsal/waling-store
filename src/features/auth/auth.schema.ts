import z from "zod";

import { DATATABLE_PAGE_SIZE } from "@/config/constants";

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address." })
  .min(5, { message: "Email must be at least 5 characters long." });
export type EmailSchema = z.infer<typeof emailSchema>;

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .max(255, { message: "Password must be less than 255 characters long." });
export type PasswordSchema = z.infer<typeof passwordSchema>;

export const newPasswordSchema = passwordSchema
  .regex(/[A-Z]/, {
    message: "Password must include at least one uppercase letter.",
  })
  .regex(/[a-z]/, {
    message: "Password must include at least one lowercase letter.",
  })
  .regex(/[0-9]/, { message: "Password must include at least one number." })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must include at least one special character.",
  });
export type NewPasswordSchema = z.infer<typeof newPasswordSchema>;

export const nameSchema = z
  .string()
  .trim()
  .min(3, { message: "Name must be at least 3 characters long." })
  .max(100, { message: "Name must be less than 100 characters long." })
  .regex(/^[a-zA-Z\s]*$/, {
    message: "Name can only contain letters and spaces.",
  });
export type NameSchema = z.infer<typeof nameSchema>;

export const roleSchema = z
  .enum(["admin", "user"], { message: "Role is required" })
  .default("user");
export type RoleSchema = z.infer<typeof roleSchema>;

export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginUserSchema = z.infer<typeof loginUserSchema>;
export type LoginUserSchemaInput = z.input<typeof loginUserSchema>;

export const updateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: roleSchema,
});
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type UpdateUserSchemaInput = z.input<typeof updateUserSchema>;

export const changePasswordClientSchema = z
  .object({
    newPassword: newPasswordSchema,
    confirmPassword: newPasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const getAllUsersSchema = z.object({
  page: z.number().int().min(1).optional().default(1).catch(1),
  pageSize: z
    .number()
    .int()
    .min(5)
    .optional()
    .default(DATATABLE_PAGE_SIZE)
    .catch(DATATABLE_PAGE_SIZE),
  search: z.string().optional(),
  role: z
    .array(z.enum(["admin", "user"]))
    .default([])
    .catch([]),
  sort: z
    .object({
      id: z.enum(["asc", "desc"]),
      name: z.enum(["asc", "desc"]),
      email: z.enum(["asc", "desc"]),
      role: z.enum(["asc", "desc"]),
      createdAt: z.enum(["asc", "desc"]),
      updatedAt: z.enum(["asc", "desc"]),
    })
    .partial()
    .default({ createdAt: "desc" })
    .catch({ createdAt: "desc" }),
});

export type GetAllUsersSchema = z.infer<typeof getAllUsersSchema>;

export const newUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: newPasswordSchema,
  role: roleSchema,
});
export type NewUserSchema = z.infer<typeof newUserSchema>;

export const newUserClientSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: newPasswordSchema,
    role: roleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type NewUserClientSchema = z.infer<typeof newUserClientSchema>;
export type NewUserClientSchemaInput = z.input<typeof newUserClientSchema>;

export const phoneSchema = z
  .string()
  .trim()
  .length(10, { message: "Phone number must be exactly 10 digits." })
  .regex(/^(98|97)\d{8}$/, {
    message: "Phone number must start with 98 or 97 and be 10 digits total.",
  });

export type PhoneSchema = z.infer<typeof phoneSchema>;

export const registerUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  // phone: phoneSchema,
  password: newPasswordSchema,
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

export const registerUserClientSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    // phone: phoneSchema,
    password: newPasswordSchema,
    confirmPassword: newPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterUserClientSchema = z.infer<typeof registerUserClientSchema>;
export type RegisterUserClientSchemaInput = z.input<
  typeof registerUserClientSchema
>;
