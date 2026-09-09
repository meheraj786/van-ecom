import * as z from "zod";

export const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
	name: z.string().min(2, "Full name must be at least 2 characters."),
	email: z.string().email("Please enter a valid email address."),
	password: z.string().min(8, "Password must be at least 8 characters."),
	newsletter: z.boolean().default(false).optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
