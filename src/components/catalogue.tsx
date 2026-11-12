"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal, X, Plus } from "lucide-react";
import type { Watch } from "@/lib/types";
import { filterWatches, money, type Filters } from "@/lib/demo";
export function WatchCard({
  watch,
  index = 0,
}: {
  watch: Watch;
  index?: number;
}) {
  return (
    <article className="watch-card">
      <Link
        className={
          "watch-image " +
          (watch.images[0]?.includes("hero") ? "dark-image" : "")
        }
        href={"/watches/" + watch.slug}
        aria-label={"View " + watch.brand + " " + watch.model}
      >
        <img
          src={watch.images[0]}
          alt={
            watch.demo
              ? "Unbranded concept illustration for " + watch.model
              : watch.brand + " " + watch.model
          }
          loading={index < 4 ? "eager" : "lazy"}
        />
        <span className="watch-badge">
          {watch.demo ? "DEMO PIECE" : watch.condition}
        </span>
        <span className="image-detail">
          <ArrowUpRight size={21} />
        </span>
      </Link>
      <div className="watch-card-copy">
        <div className="watch-brand">{watch.brand}</div>
        <h3>
          <Link href={"/watches/" + watch.slug}>{watch.model}</Link>
        </h3>
        <p className="watch-meta">
          {watch.condition}
          <span>?</span>
          {watch.year || "Year on request"}
        </p>
        <div className="watch-price">
          <strong>{money(watch.price)}</strong>
          <span
            className={
              "availability " +
              (watch.availability === "RESERVED" ? "reserved" : "")
            }
          >
            <i />
            {watch.availability === "RESERVED" ? "Reserved" : "Available"}
          </span>
        </div>
        <Link className="view-details" href={"/watches/" + watch.slug}>
          View details <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
export function Catalogue({
  watches,
  compact = false,
  initialBrand = "All brands",
  initialSearch = "",
  focusSearch = false,
  remote = false,
  initialTotal = watches.length,
  allBrands = [],
}: {
  watches: Watch[];
  compact?: boolean;
  initialBrand?: string;
  initialSearch?: string;
  focusSearch?: boolean;
  remote?: boolean;
  initialTotal?: number;
  allBrands?: string[];
}) {
  const [filters, setFilters] = useState<Filters>({
      brand: initialBrand,
      search: initialSearch,
      condition: "All conditions",
      availability: "All availability",
      sort: "newest",
    }),
    [shown, setShown] = useState(compact ? 4 : 9),
    [expanded, setExpanded] = useState(!compact),
    input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focusSearch) input.current?.focus();
  }, [focusSearch]);
  const [rows, setRows] = useState(watches),
    [total, setTotal] = useState(initialTotal),
    [page, setPage] = useState(1),
    [loading, setLoading] = useState(false),
    [loadError, setLoadError] = useState("");
  const first = useRef(true);
  useEffect(() => {
    if (!remote) return;
    if (first.current) {
      first.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setLoadError("");
      try {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "")
            query.set(key, String(value));
        });
        query.set("page", String(page));
        const response = await fetch("/api/watches?" + query, {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error || "The collection could not be loaded.",
          );
        setRows((previous) =>
          page === 1 ? result.watches : [...previous, ...result.watches],
        );
        setTotal(result.total);
      } catch (error) {
        if (!controller.signal.aborted)
          setLoadError(
            error instanceof Error ? error.message : "Please try again.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, page, remote]);
  const filtered = useMemo(
    () => filterWatches(watches, filters),
    [watches, filters],
  );
  const visible = remote ? rows : filtered;
  const count = remote ? total : visible.length;
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setShown(compact ? 4 : 9);
    setPage(1);
  }
  const clear = () => {
    setFilters({
      brand: "All brands",
      search: "",
      condition: "All conditions",
      availability: "All availability",
      sort: "newest",
    });
    setShown(compact ? 4 : 9);
    setPage(1);
  };
  return (
    <>
      <div className="catalogue-toolbar">
        <div className="brand-filters">
          {[
            "All brands",
            ...(remote ? allBrands : [...new Set(watches.map((w) => w.brand))]),
          ].map((b) => (
            <button
              key={b}
              onClick={() => set("brand", b)}
              className={filters.brand === b ? "active" : ""}
              aria-pressed={filters.brand === b}
            >
              {b === "All brands" ? "All timepieces" : b}
            </button>
          ))}
        </div>
        <div className="catalogue-actions">
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
          <select
            aria-label="Sort watches"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="newest">Newest arrivals</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>
      {expanded && (
        <div className="catalogue-filter-panel">
          <label className="catalogue-search">
            <Search size={17} />
            <input
              ref={input}
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder="Search a brand, model or reference"
              aria-label="Search timepieces"
            />
            {filters.search && (
              <button
                onClick={() => set("search", "")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </label>
          <label>
            Condition
            <select
              aria-label="Filter by condition"
              value={filters.condition}
              onChange={(e) => set("condition", e.target.value)}
            >
              <option>All conditions</option>
              {["Unworn", "Excellent", "Very good", "Good", "Fair"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Availability
            <select
              aria-label="Filter by availability"
              value={filters.availability}
              onChange={(e) => set("availability", e.target.value)}
            >
              <option>All availability</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
            </select>
          </label>
          <label>
            Minimum (N$)
            <input
              type="number"
              min="0"
              aria-label="Minimum price"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                set(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Any"
            />
          </label>
          <label>
            Maximum (N$)
            <input
              type="number"
              min="0"
              aria-label="Maximum price"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                set(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Any"
            />
          </label>
          <button className="clear-filters" onClick={clear}>
            Reset <X size={12} />
          </button>
        </div>
      )}
      {loadError && (
        <p className="form-error" role="alert">
          {loadError}
        </p>
      )}
      {loading && (
        <p className="field-note" role="status">
          Updating the collection?
        </p>
      )}
      <div
        aria-busy={loading}
        className={"watch-grid " + (compact ? "compact" : "")}
      >
        {(remote ? visible : visible.slice(0, shown)).map((w, i) => (
          <WatchCard key={w.id} watch={w} index={i} />
        ))}
        {!visible.length && (
          <div className="empty-state">
            <Search size={27} />
            <h3>No timepieces found.</h3>
            <p>Try another search, or take a fresh look at the collection.</p>
            <button className="button button-dark" onClick={clear}>
              Reset filters <ArrowUpRight size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="collection-bottom">
        <span>
          {count} considered timepiece{count === 1 ? "" : "s"}
          {watches.some((w) => w.demo)
            ? " ? Illustrative development inventory"
            : ""}
        </span>
        {(remote ? rows.length < total : visible.length > shown) ? (
          <button
            className="text-link"
            disabled={loading}
            onClick={() =>
              remote ? setPage((p) => p + 1) : setShown((n) => n + 9)
            }
          >
            Show more timepieces <Plus size={15} />
          </button>
        ) : compact ? (
          <Link href="/collection" className="text-link">
            Explore the full collection <ArrowUpRight size={15} />
          </Link>
        ) : null}
      </div>
    </>
  );
}
