import argon2 from "argon2";

export function hashPassword(password: string) {
  return argon2.hash(password);
}

export function verifyPassword({
  password,
  hashedPassword,
}: {
  password: string;
  hashedPassword: string;
}) {
  return argon2.verify(hashedPassword, password);
}
