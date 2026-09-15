"use client";

import { ChevronRight, LayoutGrid, List, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/components/clientComponents/product/ProductCard";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface ProductTableItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  tag?: string;
}

const FeaturedProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const { data: categoriesResponse } = useCategories(1, 100);
  const { data: productsResponse, isLoading: isFetchingProducts } = useProducts(
    {
      page: currentPage,
      limit: pageSize,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      categoryId: selectedCategoryId || undefined,
      subCategoryId: selectedSubCategoryId || undefined,
      inStock: inStockOnly || undefined,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      isFeatured: true,
      sortBy: sortBy as any,
    },
  );

  const categories = categoriesResponse?.data?.categories || [];
  const rawProducts = productsResponse?.data?.items || [];
  const totalProducts = productsResponse?.meta?.total || 0;

  const products: ProductTableItem[] = rawProducts.map((prod) => ({
    id: prod.id,
    name: prod.name,
    subtitle: prod.description?.slice(0, 50) || "e-com Premium Collection",
    price: 0,
    image:
      prod.baseImage ||
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=600",
    tag: "Featured",
  }));

  const handleClearFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
    setInStockOnly(false);
    setSortBy("newest");
    setSelectedColor("");
    setSelectedSize("");
  };

  const selectedCategoryObj = categories.find(
    (c) => c.id === selectedCategoryId,
  );
  const subCategories = selectedCategoryObj?.subCategories || [];

  return (
    <div className="bg-white min-h-screen pt-20">
      <div className="border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="mx-2" />
          <Link href="/shop" className="hover:text-blue-600 transition-colors">
            Shop
          </Link>
          <ChevronRight size={12} className="mx-2" />
          <span className="text-gray-900">Featured</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-[2rem] border bg-gray-50">
          <Image
            src="https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1200"
            alt="Featured Collection"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-10 text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight uppercase tracking-tight">
              Featured Collection
            </h1>
            <p className="text-sm font-medium text-white/80 uppercase tracking-widest mt-2">
              Handpicked premium selections by our designers
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-64 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Filters</h3>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Clear all
              </button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Category
              </h4>
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={cat.id}
                    checked={selectedCategoryId === cat.id}
                    onCheckedChange={() => {
                      setSelectedCategoryId(
                        selectedCategoryId === cat.id ? "" : cat.id,
                      );
                      setSelectedSubCategoryId("");
                    }}
                    className="border-gray-300 data-[state=checked]:bg-blue-600"
                  />
                  <label
                    htmlFor={cat.id}
                    className="text-sm font-medium text-gray-600 cursor-pointer"
                  >
                    {cat.name}
                  </label>
                </div>
              ))}
            </div>

            {selectedCategoryId && subCategories?.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Subcategory
                  </h4>
                  {subCategories.map((sub) => (
                    <div key={sub.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={sub.id}
                        checked={selectedSubCategoryId === sub.id}
                        onCheckedChange={() =>
                          setSelectedSubCategoryId(
                            selectedSubCategoryId === sub.id ? "" : sub.id,
                          )
                        }
                        className="border-gray-300 data-[state=checked]:bg-blue-600"
                      />
                      <label
                        htmlFor={sub.id}
                        className="text-sm font-medium text-gray-600 cursor-pointer"
                      >
                        {sub.name}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Price Range
              </h4>
              <Slider
                value={priceRange}
                onValueChange={(val) => setPriceRange(val)}
                max={5000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Color
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "Midnight",
                  "Ocean",
                  "Slate",
                  "Crimson Red",
                  "Sienna Tan",
                ].map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() =>
                      setSelectedColor(selectedColor === color ? "" : color)
                    }
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${
                      selectedColor === color
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-500 hover:border-gray-900"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Size
              </h4>
              <div className="flex flex-wrap gap-2">
                {["40mm", "42mm", "44mm", "S", "M", "L", "10"].map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() =>
                      setSelectedSize(selectedSize === size ? "" : size)
                    }
                    className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all ${
                      selectedSize === size
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-500 hover:border-gray-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                In Stock Only
              </h4>
              <Switch
                checked={inStockOnly}
                onCheckedChange={setInStockOnly}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500 font-medium">
                Showing{" "}
                <span className="text-gray-900">
                  {products?.length} of {totalProducts}
                </span>{" "}
                products
              </p>

              <div className="flex items-center space-x-6">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-none font-semibold text-sm focus:ring-0">
                    <span className="text-gray-400 mr-2 uppercase text-[10px] tracking-widest">
                      Sort By:
                    </span>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating-high">Highest Rated</SelectItem>
                    <SelectItem value="reviews-count">Most Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isFetchingProducts ? (
              <div className="flex h-[40vh] items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : products?.length === 0 ? (
              <p className="text-center py-20 text-slate-400 font-bold text-sm">
                No featured products found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductsPage;
