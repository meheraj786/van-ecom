"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { type CSSProperties, type MouseEvent, useRef, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";

interface ZoomImageProps {
	src: string;
	alt: string;
}

const ProductZoom = ({ src, alt }: ZoomImageProps) => {
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [isHovered, setIsHovered] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const { primaryColor } = useThemeStore();

	const dynamicStyles = {
		"--primary": primaryColor,
	} as CSSProperties;

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		if (!containerRef.current) return;

		const { left, top, width, height } =
			containerRef.current.getBoundingClientRect();
		const x = ((e.pageX - left) / width) * 100;
		const y = ((e.pageY - top) / height) * 100;

		setMousePos({ x, y });
	};

	return (
		<div
			ref={containerRef}
			role="tab"
			tabIndex={0}
			aria-label="Zoom product image"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onMouseMove={handleMouseMove}
			onKeyDown={(e) => e.key === "Enter" && setIsHovered(!isHovered)}
			style={dynamicStyles}
			className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] bg-[#f8f9fb] cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
		>
			<motion.div
				animate={{
					scale: isHovered ? 2 : 1,
					x: isHovered ? `${50 - mousePos.x}%` : 0,
					y: isHovered ? `${50 - mousePos.y}%` : 0,
				}}
				transition={{
					type: "spring",
					stiffness: 150,
					damping: 25,
					mass: 0.5,
				}}
				className="relative h-full w-full"
				style={{ originX: mousePos.x / 100, originY: mousePos.y / 100 }}
			>
				<Image
					src={src}
					alt={alt}
					fill
					priority
					className="object-cover"
					sizes="(max-width: 768px) 100vw, 50vw"
				/>
			</motion.div>

			{!isHovered && (
				<div className="absolute bottom-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm pointer-events-none">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<title>Zoom Icon</title>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="11" y1="8" x2="11" y2="14" />
						<line x1="8" y1="11" x2="14" y2="11" />
					</svg>
				</div>
			)}
		</div>
	);
};

export default ProductZoom;
