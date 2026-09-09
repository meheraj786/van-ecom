import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCheckoutStore } from "@/store/useCheckoutStore";

const ReviewStep = () => {
	const { setStep } = useCheckoutStore();

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
		>
			<h2 className="text-4xl font-serif text-gray-900 mb-2">
				Review Your Order
			</h2>
			<p className="text-gray-500 mb-10 font-medium">
				Please double-check your shipping and payment info.
			</p>

			<div className="space-y-6">
				<div className="p-8 bg-[#f8f9fb] rounded-3xl space-y-4">
					<div className="flex justify-between items-start">
						<h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
							Shipping To
						</h4>
						<button
							type="button"
							onClick={() => setStep("shipping")}
							className="text-xs font-bold text-[var(--primary)] underline"
						>
							Edit
						</button>
					</div>
					<p className="font-bold text-gray-900 leading-relaxed">
						John Doe <br /> 123 Luxury Lane, New York, NY 10001
					</p>
				</div>

				<div className="p-8 bg-[#f8f9fb] rounded-3xl space-y-4">
					<div className="flex justify-between items-start">
						<h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
							Payment Method
						</h4>
						<button
							type="button"
							onClick={() => setStep("payment")}
							className="text-xs font-bold text-[var(--primary)] underline"
						>
							Edit
						</button>
					</div>
					<p className="font-bold text-gray-900">Visa ending in •••• 4242</p>
				</div>
			</div>

			<div className="mt-12 flex gap-4">
				<Button
					variant="outline"
					onClick={() => setStep("payment")}
					className="h-14 px-8 rounded-xl"
				>
					Back
				</Button>
				<Button
					onClick={() => setStep("complete")}
					className="h-14 flex-1 rounded-xl font-bold"
				>
					Place Order
				</Button>
			</div>
		</motion.div>
	);
};

export default ReviewStep;
