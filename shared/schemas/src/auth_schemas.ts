import { z } from "zod";

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;

export const UsernameSchema = z
  .string()
  .min(1, "Username is required")
  .regex(
    usernameRegex,
    "Username must start with a letter and contain only letters and numbers",
  );

export type Username = z.infer<typeof UsernameSchema>;

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*\W)[^\s]+$/;

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(
    passwordRegex,
    "Password must contain at least one letter, one number, and one special character, and no spaces",
  );

export type Password = z.infer<typeof PasswordSchema>;

export const EmailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required");

export type Email = z.infer<typeof EmailSchema>;

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export type Login = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema,
});

export type Register = z.infer<typeof RegisterSchema>;

export const AuthResultSchema = z.discriminatedUnion("success", [
  z
    .object({
      success: z.literal(true),
      userId: z.number(),
      email: EmailSchema,
      twoFA: z.boolean(),
    })
    .required(),
  z
    .object({
      success: z.literal(false),
      error: z.string(),
    })
    .required(),
]);

export type AuthResult = z.infer<typeof AuthResultSchema>;

export const Enable2FAResultSchema = z.discriminatedUnion("success", [
  z
    .object({
      success: z.literal(true),
      qrCode: z.string(),
      message: z.string(),
    })
    .required(),
  z
    .object({
      success: z.literal(false),
      error: z.string(),
    })
    .required(),
]);

export type Enable2FAResult = z.infer<typeof Enable2FAResultSchema>;
