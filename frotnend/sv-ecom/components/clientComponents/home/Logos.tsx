const Brands = () => {
	const brands = ["VOGUE", "HYPEBEAST", "GQ", "FORBES", "WIRED"];
	return (
		<div className="py-20 flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale contrast-125">
			{brands.map((brand) => (
				<span
					key={brand}
					className="text-2xl font-black tracking-tighter italic"
				>
					{brand}
				</span>
			))}
		</div>
	);
};

export default Brands;
