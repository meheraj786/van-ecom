"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCheckoutStore } from "@/store/useCheckoutStore";

type PaymentMethod = "card" | "cod" | "sslcommerz";

const PaymentStep = () => {
	const { setStep } = useCheckoutStore();
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
		>
			<h2 className="text-4xl font-serif text-gray-900 mb-2">Payment Method</h2>
			<p className="text-gray-500 mb-10 font-medium">
				Select how you&apos;d like to pay for your order.
			</p>

			<FieldGroup className="space-y-6">
				{/* Card Option */}
				<button
					type="button"
					onClick={() => setSelectedMethod("card")}
					className={`w-full p-6 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-colors ${
						selectedMethod === "card"
							? "border-[var(--primary)] bg-blue-50/20"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<div className="flex items-center gap-4">
						<div className="bg-white p-2 rounded-lg shadow-sm font-bold text-blue-600 italic">
							VISA
						</div>
						<p className="font-bold text-gray-900">Credit or Debit Card</p>
					</div>
					<div
						className={`h-5 w-5 rounded-full border-4 ${
							selectedMethod === "card"
								? "border-[var(--primary)] bg-white"
								: "border-gray-300"
						}`}
					/>
				</button>

				{/* Cash on Delivery Option */}
				<button
					type="button"
					onClick={() => setSelectedMethod("cod")}
					className={`w-full p-6 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-colors ${
						selectedMethod === "cod"
							? "border-[var(--primary)] bg-blue-50/20"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<div className="flex items-center gap-4">
						<div className="bg-white p-2 rounded-lg shadow-sm font-bold text-green-600 italic">
							COD
						</div>
						<p className="font-bold text-gray-900">Cash on Delivery</p>
					</div>
					<div
						className={`h-5 w-5 rounded-full border-4 ${
							selectedMethod === "cod"
								? "border-[var(--primary)] bg-white"
								: "border-gray-300"
						}`}
					/>
				</button>

				{/* SSL Commerz Option */}
				<button
					type="button"
					onClick={() => setSelectedMethod("sslcommerz")}
					className={`w-full p-6 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-colors ${
						selectedMethod === "sslcommerz"
							? "border-[var(--primary)] bg-blue-50/20"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<div className="flex items-center gap-4">
						<div className="bg-white p-2 rounded-lg shadow-sm font-bold text-purple-600 italic">
							SSL
						</div>
						<p className="font-bold text-gray-900">SSL Commerz</p>
					</div>
					<div
						className={`h-5 w-5 rounded-full border-4 ${
							selectedMethod === "sslcommerz"
								? "border-[var(--primary)] bg-white"
								: "border-gray-300"
						}`}
					/>
				</button>

				{/* Card input fields – visible only when card is selected */}
				{selectedMethod === "card" && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="grid grid-cols-2 gap-4 pt-2 overflow-hidden"
					>
						<Field>
							<FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
								Card Number
							</FieldLabel>
							<Input
								placeholder="0000 0000 0000 0000"
								className="h-12 rounded-xl"
							/>
						</Field>
						<Field>
							<FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
								CVV
							</FieldLabel>
							<Input placeholder="123" className="h-12 rounded-xl" />
						</Field>
					</motion.div>
				)}
			</FieldGroup>

			<div className="mt-12 flex gap-4">
				<Button
					variant="outline"
					onClick={() => setStep("shipping")}
					className="h-14 px-8 rounded-xl"
				>
					Back
				</Button>
				<Button
					onClick={() => setStep("review")}
					className="h-14 flex-1 rounded-xl font-bold bg-[var(--primary)] text-white"
				>
					Review Order
				</Button>
			</div>
		</motion.div>
	);
};

export default PaymentStep;
