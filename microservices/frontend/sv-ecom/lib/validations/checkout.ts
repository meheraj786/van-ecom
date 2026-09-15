import * as z from "zod";

export const shippingSchema = z.object({
	fullName: z.string().min(2, "Full name is required"),
	email: z.string().email("Invalid email address"),
	phone: z
		.string()
		.regex(/^\d{10,15}$/, "Enter a valid phone number (10-15 digits)"),
	address: z.string().min(5, "Address is required"),
	city: z.string().min(2, "City is required"),
	zipCode: z.string().regex(/^\d{5,10}$/, "Zip code must be 5-10 digits"),
	country: z.string().min(1, "Country is required"),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
