import { z } from "zod";

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*\W)[^\s]+$/;

export const CredentialsSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(
      usernameRegex,
      "Username must start with a letter and contain only letters and numbers",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      passwordRegex,
      "Password must contain at least one letter, one number, and one special character, and no spaces",
    ),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

export const AuthResultSchema = z.discriminatedUnion("success", [
  z
    .object({
      success: z.literal(true),
      userId: z.number(),
      username: z.string(),
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
      twoFASecret: z.string(),
      qrCode: z.string(),
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
