import { create } from "zustand";

interface HeroContent {
	badge: string;
	title: string;
	highlightText: string;
	description: string;
	primaryBtn: string;
	secondaryBtn: string;
	mainImage: string;
	stats: { label: string; value: string; subValue: string };

	linkPath?: string;
}
export interface Product {
	id: string;
	name: string;
	subtitle: string;
	price: number;
	image: string;
	isNew?: boolean;
}

export interface Testimonial {
	id: number;
	quote: string;
	author: string;
	role: string;
	rating: number;
}

interface HomeState {
	hero: HeroContent;
	categories: {
		id: number;
		title: string;
		subtitle?: string;
		image: string;
		size: "large" | "small" | "wide";
	}[];
	trendingProducts: Product[];
	testimonials: Testimonial[];
}

export const useHomeStore = create<HomeState>(() => ({
	hero: {
		badge: "SPRING COLLECTION 2026",
		title: "Elevate Your",
		highlightText: "Everyday",
		description:
			"Experience the fusion of technical precision and lifestyle elegance. Crafted for those who appreciate world-class minimalist design.",
		primaryBtn: "Shop The Collection",
		secondaryBtn: "Learn More",
		mainImage:
			"https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", // Minimalist White Watch
		stats: {
			label: "NEW ARRIVAL",
			value: "9.8/10",
			subValue: "Unmatched Performance",
		},
	},
	categories: [
		{
			id: 1,
			title: "Modern Living",
			subtitle: "Redefine your workspace with elegance.",
			image:
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", // Premium Headphones/Workspace
			size: "large",
		},
		{
			id: 2,
			title: "Tech Essentials",
			image:
				"https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&auto=format&fit=crop", // Minimalist Laptop/Tech
			size: "small",
		},
		{
			id: 3,
			title: "Accessories",
			image:
				"https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop", // Premium Leather Bag/Accessory
			size: "small",
		},
		{
			id: 4,
			title: "Sustainable Wear",
			image:
				"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop", // Premium T-shirt/Clothing
			size: "wide",
		},
	],
	trendingProducts: [
		{
			id: "1",
			name: "Aero Flow Sneaker",
			subtitle: "Cloud White / Silver",
			price: 180,
			image:
				"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop", // Red/White Sports Sneaker
			isNew: true,
		},
		{
			id: "2",
			name: "Nomad Tech Pack",
			subtitle: "Obsidian Black",
			price: 220,
			image:
				"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop", // Premium Backpack
		},
		{
			id: "3",
			name: "Titanium Flask",
			subtitle: "Brushed Sand",
			price: 65,
			image:
				"https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop", // Stainless Steel Flask
		},
		{
			id: "4",
			name: "Chronograph Minimalist",
			subtitle: "Matte Black / Tan",
			price: 299,
			image:
				"https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop", // Luxury Watch
			isNew: true,
		},
	],
	testimonials: [
		{
			id: 1,
			quote:
				"The quality of the Nomad Pack is beyond anything I've owned. Technical and beautiful.",
			author: "Marcus Chen",
			role: "Tech Enthusiast",
			rating: 5,
		},
		{
			id: 2,
			quote:
				"Minimalist design that actually works. LuxeCommerce is my new go-to for lifestyle essentials.",
			author: "Sarah Jenkins",
			role: "Interior Designer",
			rating: 5,
		},
		{
			id: 3,
			quote:
				"The customer service is as premium as the products. Absolutely seamless experience.",
			author: "David Ross",
			role: "Creative Director",
			rating: 5,
		},
	],
}));
