"use client";
import {
	HelpCircle,
	Mail,
	MessageCircle,
	Package,
	RotateCcw,
	Search,
	Truck,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SupportPage = () => {
	return (
		<div className="max-w-7xl mx-auto py-20 px-8">
			<section className="text-center space-y-8 mb-20">
				<h1 className="text-6xl font-serif text-gray-900">How can we help?</h1>
				<div className="max-w-7xl mx-auto relative">
					<Search
						size={20}
						className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
					/>
					<Input
						placeholder="Search for articles, orders, or policies..."
						className="h-16 pl-16 rounded-full bg-white border-gray-100 shadow-xl text-lg"
					/>
				</div>
				<div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
					<span>Popular:</span>
					<button type="button" className="text-[var(--primary)]">
						Track Order
					</button>
					<button type="button" className="text-[var(--primary)]">
						Return Policy
					</button>
				</div>
			</section>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-32">
				{[
					{
						title: "Shipping",
						icon: Truck,
						text: "Tracking, international delivery, expedited options.",
					},
					{
						title: "Returns",
						icon: RotateCcw,
						text: "Start a return, refund timeline, exchanges.",
					},
					{
						title: "Orders",
						icon: Package,
						text: "Modify an order, payment methods, gift cards.",
					},
					{
						title: "Product Care",
						icon: HelpCircle,
						text: "Cleaning guides, materials library, warranty info.",
					},
				].map((item) => (
					<div
						key={item.title}
						className="p-10 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-xl transition-all cursor-pointer group"
					>
						<div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-[var(--primary)] mb-8">
							<item.icon size={24} />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							{item.title}
						</h3>
						<p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
					</div>
				))}
			</div>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
				<div className="space-y-10">
					<h2 className="text-5xl font-serif leading-tight">
						Still need help?
					</h2>
					<p className="text-xl text-gray-500 leading-relaxed">
						Our concierge team is available 24/7 to assist you with any
						questions about our products or services.
					</p>
					<div className="flex gap-4">
						<Button
							size="lg"
							className="h-14 px-10 rounded-xl font-bold flex items-center gap-3"
						>
							<MessageCircle size={20} /> Live Chat
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-14 px-10 rounded-xl font-bold border-gray-200 flex items-center gap-3"
						>
							<Mail size={20} /> Email Support
						</Button>
					</div>
				</div>
				<div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
					<Image
						src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200"
						alt="Support"
						fill
						className="object-cover"
					/>
					<div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-white/20">
						<p className="text-2xl font-black text-gray-900">2 minute wait</p>
						<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
							Average response time for chat
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};

export default SupportPage;
