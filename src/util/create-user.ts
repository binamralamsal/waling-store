import pg from "pg";
import type { z } from "zod";
import { input, password, select } from "@inquirer/prompts";

import { db } from "@/config/db";
import { hashPassword } from "@/features/auth/server/use-cases/password";
import {
  emailSchema,
  nameSchema,
  newPasswordSchema,
} from "@/features/auth/auth.schema";

const { DatabaseError } = pg;

const validate = (input: string, zodSchema: z.Schema) => {
  const parsed = zodSchema.safeParse(input);
  if (parsed.success) return true;
  return parsed.error.issues[0].message;
};

const nameInput = await input({
  message: "👤 What name should I assign to the new user?",
  validate: (input) => validate(input, nameSchema),
});

const emailInput = await input({
  message: "📧 What email address should I use for the user?",
  validate: (input) => validate(input, emailSchema),
});

async function getPasswordWithConfirmation() {
  let passwordsMatch = false;
  let passwordInput = "";

  while (!passwordsMatch) {
    passwordInput = await password({
      message: "🔑 Please set a password for the user:",
      validate: (input) => validate(input, newPasswordSchema),
    });

    const confirmPasswordInput = await password({
      message: "🔄 Please confirm the password:",
    });

    if (passwordInput === confirmPasswordInput) {
      passwordsMatch = true;
    } else {
      console.log("❌ Passwords do not match. Please try again.");
    }
  }

  return passwordInput;
}

const userPassword = await getPasswordWithConfirmation();

const roleInput = await select({
  message: "👥 Select the user's role:",
  choices: [
    {
      name: "User",
      value: "user",
      description:
        "Standard users can browse, add items to the cart, and make purchases.",
    },
    {
      name: "Admin",
      value: "admin",
      description:
        "Admins can manage products, users, and access the admin dashboard.",
    },
  ] as const,
  default: "user",
});

const hashedPassword = await hashPassword(userPassword);

try {
  await db.transaction().execute(async (trx) => {
    const { id: userId } = await trx
      .insertInto("users")
      .values({
        name: nameInput,
        password: hashedPassword,
        role: roleInput,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    await trx
      .insertInto("emails")
      .values({ userId, email: emailInput })
      .executeTakeFirstOrThrow();
  });
  console.log("✅ User created successfully!");
} catch (err) {
  if (err instanceof DatabaseError && err.code === "23505") {
    console.error(
      "🚫 A user with this email address already exists. Please try a different email.",
    );
  } else if (err instanceof Error) {
    console.error(`❗ An error occurred: ${err.message}`);
  } else {
    console.error("⚠️ An unexpected error occurred.");
  }
} finally {
  process.exit(0);
}
