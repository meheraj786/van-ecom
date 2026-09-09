// src/components/checkout/CompleteStep.tsx

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CompleteStep = () => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			className="text-center py-20"
		>
			<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 text-green-500 mb-8">
				<CheckCircle2 size={48} />
			</div>
			<h2 className="text-5xl font-serif text-gray-900 mb-4">
				Thank You for Your Purchase!
			</h2>
			<p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
				Your order <span className="font-bold text-gray-900">#LX-99402</span>{" "}
				has been placed successfully and is being prepared for shipment.
			</p>

			<div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
				<Button className="h-14 px-10 rounded-xl font-bold">
					Track Your Order
				</Button>
				<Link href="/shop">
					<Button
						variant="outline"
						className="h-14 px-10 rounded-xl font-bold w-full"
					>
						Continue Shopping
					</Button>
				</Link>
			</div>
		</motion.div>
	);
};

export default CompleteStep;
