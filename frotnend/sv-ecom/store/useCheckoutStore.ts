import { create } from "zustand";

type Step = "shipping" | "payment" | "review" | "complete";

interface CheckoutState {
	currentStep: Step;
	setStep: (step: Step) => void;
	shippingDetails: {
		fullName: string;
		email: string;
		phone: string;
		address: string;
		city: string;
		zipCode: string;
		country: string;
	} | null;
	setShippingDetails: (details: {
		fullName: string;
		email: string;
		phone: string;
		address: string;
		city: string;
		zipCode: string;
		country: string;
	}) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
	currentStep: "shipping",
	setStep: (step) => set({ currentStep: step }),
	shippingDetails: null,
	setShippingDetails: (details) => set({ shippingDetails: details }),
}));
