"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, RotateCcw, ArrowUpDown } from "lucide-react";
import { WatchCard, WatchCardData } from "./watch-card";
import { BRAND, formatNAD } from "@/config/brand";

interface CollectionViewProps {
  initialWatches: WatchCardData[];
  initialBrand?: string;
  initialCondition?: string;
}

export function CollectionView({
  initialWatches,
  initialBrand = "All",
  initialCondition = "All",
}: CollectionViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedCondition, setSelectedCondition] = useState(initialCondition);
  const [selectedAvailability, setSelectedAvailability] = useState("ALL"); // ALL, AVAILABLE, RESERVED
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [maxPrice, setMaxPrice] = useState<number>(600000); // N$ 600,000

  // Extract unique brands from inventory + featured brands
  const brands = useMemo(() => {
    const set = new Set<string>(["All"]);
    BRAND.featuredBrands.forEach((b) => set.add(b));
    initialWatches.forEach((w) => set.add(w.brand));
    return Array.from(set);
  }, [initialWatches]);

  const conditions = ["All", ...BRAND.conditions];

  // Filtering and sorting logic
  const filteredWatches = useMemo(() => {
    return initialWatches
      .filter((w) => {
        // Search term (brand, model, reference)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchBrand = w.brand.toLowerCase().includes(q);
          const matchModel = w.model.toLowerCase().includes(q);
          const matchRef = w.referenceNumber?.toLowerCase().includes(q) || false;
          if (!matchBrand && !matchModel && !matchRef) return false;
        }

        // Brand filter
        if (selectedBrand !== "All" && w.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Condition filter
        if (selectedCondition !== "All" && w.condition !== selectedCondition) {
          return false;
        }

        // Availability filter
        if (selectedAvailability === "AVAILABLE" && w.status !== "AVAILABLE") {
          return false;
        }
        if (selectedAvailability === "RESERVED" && w.status !== "RESERVED") {
          return false;
        }

        // Price range filter (w.price is in minor units / cents)
        const priceInMajorUnits = w.price / 100;
        if (priceInMajorUnits > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        // Default newest: retain database order
        return 0;
      });
  }, [
    initialWatches,
    searchTerm,
    selectedBrand,
    selectedCondition,
    selectedAvailability,
    sortBy,
    maxPrice,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedBrand("All");
    setSelectedCondition("All");
    setSelectedAvailability("ALL");
    setSortBy("newest");
    setMaxPrice(600000);
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedBrand !== "All" ||
    selectedCondition !== "All" ||
    selectedAvailability !== "ALL" ||
    maxPrice < 600000;

  return (
    <div className="space-y-10">
      {/* Search & Main Controls Bar */}
      <div className="luxury-glass rounded-2xl p-6 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A59E]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brand, model, reference..."
            className="w-full bg-[#14171A] border border-white/[0.1] rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-[#A8A59E]/60 focus:outline-none focus:border-[#B79B6C] transition-colors"
          />
        </div>

        {/* Brand Horizontal Pills */}
        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {brands.slice(0, 6).map((brand) => {
            const active = selectedBrand.toLowerCase() === brand.toLowerCase();
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`text-xs uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#B79B6C] text-[#08090B] font-medium"
                    : "bg-[#14171A] text-[#A8A59E] hover:text-white border border-white/[0.06]"
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-auto flex items-center justify-end gap-3">
          <div className="flex items-center gap-2 bg-[#14171A] border border-white/[0.1] rounded-full px-4 py-2.5">
            <ArrowUpDown size={14} className="text-[#B79B6C]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs uppercase tracking-wider text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#14171A] text-white">Newest First</option>
              <option value="price-asc" className="bg-[#14171A] text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-[#14171A] text-white">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Ribbon: Condition, Availability, Price Slider */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-2 py-4 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-6">
          {/* Condition Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#A8A59E]">Condition:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-[#14171A] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#B79B6C]"
            >
              {conditions.map((c) => (
                <option key={c} value={c} className="bg-[#14171A] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#A8A59E]">Availability:</span>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="bg-[#14171A] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#B79B6C]"
            >
              <option value="ALL" className="bg-[#14171A] text-white">All Pieces</option>
              <option value="AVAILABLE" className="bg-[#14171A] text-white">Available Now</option>
              <option value="RESERVED" className="bg-[#14171A] text-white">Reserved</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-[#A8A59E]">
              Up to N$ {maxPrice.toLocaleString()}:
            </span>
            <input
              type="range"
              min="50000"
              max="600000"
              step="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-28 sm:w-36 accent-[#B79B6C] cursor-pointer"
            />
          </div>
        </div>

        {/* Active Filter Clear & Count */}
        <div className="flex items-center gap-4">
          <span className="text-xs tracking-wider text-[#A8A59E]">
            Showing <strong className="text-white">{filteredWatches.length}</strong> {filteredWatches.length === 1 ? "timepiece" : "timepieces"}
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#B79B6C] hover:text-white transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredWatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWatches.map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      ) : (
        <div className="text-center py-28 border border-white/[0.06] rounded-2xl bg-[#0C0E11] px-6">
          <h3 className="font-editorial text-2xl text-white font-normal mb-3">
            No Timepieces Match Your Selection
          </h3>
          <p className="text-sm text-[#A8A59E] max-w-md mx-auto mb-6">
            We regularly acquire and verify rare timepieces. Try adjusting your filters or enquire with our concierge for a bespoke sourcing request.
          </p>
          <button onClick={resetFilters} className="btn-gold">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
