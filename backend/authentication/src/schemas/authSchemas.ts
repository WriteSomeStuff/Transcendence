import { z } from "zod";

export const registerSchema = z.object({
	username: z.string()
		.min(3, "Username is required")
		.max(32, "Username too long"),
	password: z.string()
		.min(6, "Password too short")
		.max(64, "Password too long"),
})
.required();

export const loginSchema = z.object({
	username: z.string()
		.min(3, "Username too short")
		.max(32, "Username too long"),
	password: z.string()
		.min(6, "Password too short")
		.max(64, "Password too long"),
})
.required();