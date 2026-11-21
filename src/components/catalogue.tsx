"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Search,
  SlidersHorizontal,
  X,
  Plus,
} from "lucide-react";
import type { Watch } from "@/lib/types";
import { filterWatches, isNewIn, money, type Filters } from "@/lib/demo";

export type BrandCount = { brand: string; count: number };
const CONDITIONS = ["Unworn", "Excellent", "Very good", "Good", "Fair"];
const SORTS = [
  ["newest", "Newest in"],
  ["price-low", "Price: low to high"],
  ["price-high", "Price: high to low"],
  ["brand-az", "Brand: A to Z"],
] as const;

export function WatchCard({
  watch,
  index = 0,
}: {
  watch: Watch;
  index?: number;
}) {
  const href = "/watches/" + watch.slug;
  const photos = watch.imageCount ?? watch.images.length;
  const badge =
    watch.availability === "RESERVED"
      ? { text: "Reserved", tone: "reserved" }
      : watch.demo
        ? { text: "Demo", tone: "demo" }
        : isNewIn(watch)
          ? { text: "New in", tone: "new" }
          : null;
  const extras = [
    watch.year ? String(watch.year) : "",
    watch.condition,
    watch.box && watch.papers ? "Box and papers" : watch.box ? "Box" : "",
  ].filter(Boolean);
  return (
    <article className="lt-card">
      <Link
        className="lt-card-photo"
        href={href}
        aria-label={"View " + watch.brand + " " + watch.model}
      >
        {watch.images[0] ? (
          <img
            src={watch.images[0]}
            alt={
              watch.demo
                ? "Unbranded concept illustration for " + watch.model
                : [watch.brand, watch.model, watch.reference]
                    .filter(Boolean)
                    .join(" ")
            }
            loading={index < 4 ? "eager" : "lazy"}
          />
        ) : (
          <span className="lt-card-nophoto">Photo coming soon</span>
        )}
        {badge && (
          <span className={"lt-badge lt-badge-" + badge.tone}>
            {badge.text}
          </span>
        )}
        {photos > 1 && (
          <span className="lt-photo-count" aria-label={photos + " photos"}>
            <Camera size={13} aria-hidden="true" /> {photos}
          </span>
        )}
      </Link>
      <div className="lt-card-body">
        <p className="lt-card-brand">{watch.brand}</p>
        <h3 className="lt-card-model">
          <Link href={href}>{watch.model}</Link>
        </h3>
        {watch.reference && (
          <p className="lt-card-ref">Ref. {watch.reference}</p>
        )}
        <p className="lt-card-meta">{extras.join(" · ")}</p>
        <p className="lt-card-price">{money(watch.price)}</p>
      </div>
    </article>
  );
}

const defaults = (brand = "All brands", search = ""): Filters => ({
  brand,
  search,
  condition: "All conditions",
  availability: "All availability",
  boxPapers: false,
  sort: "newest",
});

export function Catalogue({
  watches,
  compact = false,
  initialBrand = "All brands",
  initialSearch = "",
  focusSearch = false,
  remote = false,
  initialTotal = watches.length,
  allBrands = [],
  brandCounts = [],
}: {
  watches: Watch[];
  compact?: boolean;
  initialBrand?: string;
  initialSearch?: string;
  focusSearch?: boolean;
  remote?: boolean;
  initialTotal?: number;
  allBrands?: string[];
  brandCounts?: BrandCount[];
}) {
  const [filters, setFilters] = useState<Filters>(
      defaults(initialBrand, initialSearch),
    ),
    [shown, setShown] = useState(compact ? 4 : 12),
    [panelOpen, setPanelOpen] = useState(false),
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
          if (value !== undefined && value !== "" && value !== false)
            query.set(key, String(value));
        });
        query.set("page", String(page));
        const response = await fetch("/api/watches?" + query, {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "The watches couldn't be loaded.");
        setRows((previous) =>
          page === 1 ? result.watches : [...previous, ...result.watches],
        );
        setTotal(result.total);
        // Keep the address shareable: /collection?brand=Rolex
        const url = new URL(window.location.href);
        if (filters.brand && filters.brand !== "All brands")
          url.searchParams.set("brand", filters.brand);
        else url.searchParams.delete("brand");
        window.history.replaceState(null, "", url);
      } catch (error) {
        if (!controller.signal.aborted)
          setLoadError(
            error instanceof Error ? error.message : "Try again in a moment.",
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
  const counts: BrandCount[] = brandCounts.length
    ? brandCounts
    : (remote ? allBrands : [...new Set(watches.map((w) => w.brand))]).map(
        (brand) => ({
          brand,
          count: watches.filter((w) => w.brand === brand).length,
        }),
      );
  const totalAll = counts.reduce((sum, b) => sum + b.count, 0);
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setShown(compact ? 4 : 12);
    setPage(1);
  }
  const clear = () => {
    setFilters(defaults());
    setShown(compact ? 4 : 12);
    setPage(1);
  };
  const active =
    (filters.brand !== "All brands" ? 1 : 0) +
    (filters.condition !== "All conditions" ? 1 : 0) +
    (filters.availability !== "All availability" ? 1 : 0) +
    (filters.boxPapers ? 1 : 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.search ? 1 : 0);

  const grid = (
    <div
      aria-busy={loading}
      className={"lt-grid " + (compact ? "lt-grid-compact" : "")}
    >
      {(remote ? visible : visible.slice(0, shown)).map((w, i) => (
        <WatchCard key={w.id} watch={w} index={i} />
      ))}
      {!visible.length && (
        <div className="lt-empty">
          <h3>No watches match those filters</h3>
          <p>
            Try a different brand or price range. New watches are listed
            regularly.
          </p>
          <button className="lt-button" onClick={clear}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );

  if (compact)
    return (
      <>
        {grid}
        <div className="lt-more">
          <Link href="/collection" className="lt-link">
            Browse all watches <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </>
    );

  return (
    <div className="lt-browse">
      <aside
        className={"lt-sidebar " + (panelOpen ? "open" : "")}
        aria-label="Filters"
      >
        <div className="lt-sidebar-head">
          <h2>Filters</h2>
          <button
            className="lt-icon-button"
            onClick={() => setPanelOpen(false)}
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>
        <label className="lt-search">
          <Search size={16} aria-hidden="true" />
          <input
            ref={input}
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Brand, model or reference"
            aria-label="Search watches"
          />
          {filters.search && (
            <button onClick={() => set("search", "")} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </label>
        <section className="lt-filter-group">
          <h3>Shop by brand</h3>
          <ul className="lt-brand-list">
            <li>
              <button
                className={filters.brand === "All brands" ? "active" : ""}
                aria-pressed={filters.brand === "All brands"}
                onClick={() => set("brand", "All brands")}
              >
                All brands <span>{totalAll}</span>
              </button>
            </li>
            {counts.map((b) => (
              <li key={b.brand}>
                <button
                  className={filters.brand === b.brand ? "active" : ""}
                  aria-pressed={filters.brand === b.brand}
                  onClick={() => set("brand", b.brand)}
                >
                  {b.brand} <span>{b.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="lt-filter-group">
          <h3>Condition</h3>
          <select
            aria-label="Condition"
            value={filters.condition}
            onChange={(e) => set("condition", e.target.value)}
          >
            <option>All conditions</option>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </section>
        <section className="lt-filter-group">
          <h3>Price (N$)</h3>
          <div className="lt-price-range">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              aria-label="Minimum price"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                set(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Min"
            />
            <span aria-hidden="true">–</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              aria-label="Maximum price"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                set(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Max"
            />
          </div>
        </section>
        <section className="lt-filter-group">
          <h3>More</h3>
          <label className="lt-check">
            <input
              type="checkbox"
              checked={!!filters.boxPapers}
              onChange={(e) => set("boxPapers", e.target.checked)}
            />
            Box and papers
          </label>
          <label className="lt-check">
            <input
              type="checkbox"
              checked={filters.availability === "AVAILABLE"}
              onChange={(e) =>
                set(
                  "availability",
                  e.target.checked ? "AVAILABLE" : "All availability",
                )
              }
            />
            Hide reserved watches
          </label>
        </section>
        {active > 0 && (
          <button className="lt-clear" onClick={clear}>
            Clear all filters
          </button>
        )}
        <button
          className="lt-button lt-sidebar-done"
          onClick={() => setPanelOpen(false)}
        >
          Show {count} {count === 1 ? "watch" : "watches"}
        </button>
      </aside>
      <div className="lt-results">
        <div className="lt-toolbar">
          <p className="lt-count" aria-live="polite">
            {count} {count === 1 ? "result" : "results"}
            {loading ? " · updating" : ""}
          </p>
          <div className="lt-toolbar-actions">
            <button
              className="lt-filter-toggle"
              onClick={() => setPanelOpen(true)}
              aria-expanded={panelOpen}
            >
              <SlidersHorizontal size={15} aria-hidden="true" /> Filters
              {active > 0 && <span className="lt-dot">{active}</span>}
            </button>
            <label className="lt-sort">
              <span>Sort</span>
              <select
                value={filters.sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {loadError && (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        )}
        {grid}
        {(remote ? rows.length < total : visible.length > shown) && (
          <div className="lt-more">
            <button
              className="lt-button lt-button-outline"
              disabled={loading}
              onClick={() =>
                remote ? setPage((p) => p + 1) : setShown((n) => n + 12)
              }
            >
              Show more watches <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        )}
        {watches.some((w) => w.demo) && (
          <p className="lt-demo-note">
            Demo listings with illustrative photos, for preview only.
          </p>
        )}
      </div>
    </div>
  );
}
