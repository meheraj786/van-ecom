import * as z from "zod";

export const adminLoginSchema = z.object({
	email: z.string().email("Please enter a valid administrator email."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
