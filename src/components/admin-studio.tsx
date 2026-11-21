"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Watch as WatchIcon,
  Inbox,
  MessageSquare,
  Star,
  FileText,
  History,
  Plus,
  ArrowUpRight,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Check,
  Upload,
  X,
  Search,
  Archive,
  Mail,
  LoaderCircle,
} from "lucide-react";
import { Logo } from "./site-chrome";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import type { Watch, Submission, SiteContent } from "@/lib/types";
import { generateWriteUp, seoTitle, seoDescription } from "@/lib/seo";
import { brand as storeBrand } from "@/config/brand";
const seoContext = { siteName: storeBrand.name, location: storeBrand.location };
import { money } from "@/lib/demo";
type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
  watch?: { brand: string; model: string } | null;
};
type Activity = {
  id: string;
  action: string;
  entityId: string;
  detail: string | null;
  createdAt: string;
  actor?: { name: string };
};
type Data = {
  admin: { name: string; role: string };
  watches: Watch[];
  submissions: Submission[];
  enquiries: Enquiry[];
  content: SiteContent;
  activity: Activity[];
  email: { configured: boolean; queued: number };
};
const tabs = [
  ["overview", "Overview", LayoutDashboard],
  ["inventory", "Watch inventory", WatchIcon],
  ["submissions", "Pending submissions", Inbox],
  ["enquiries", "Customer enquiries", MessageSquare],
  ["featured", "Featured selection", Star],
  ["content", "Homepage content", FileText],
  ["activity", "Activity log", History],
] as const;
const blank: Watch = {
  id: "",
  slug: "",
  brand: "",
  model: "",
  reference: "",
  year: null,
  price: 0,
  currency: "NAD",
  condition: "Excellent",
  description: "",
  defects: "",
  diameter: "",
  movement: "",
  caseMaterial: "",
  dial: "",
  bracelet: "",
  waterResistance: "",
  writeUp: "",
  seoTitle: "",
  seoDescription: "",
  images: [],
  availability: "AVAILABLE",
  sellerType: "STORE",
  featured: false,
  published: false,
  box: false,
  papers: false,
};
const date = (value: string) =>
  new Intl.DateTimeFormat("en-NA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Windhoek",
  }).format(new Date(value));
async function request(url: string, method = "GET", body?: unknown) {
  const response = await fetch(url, {
    method,
    headers:
      body instanceof FormData
        ? {}
        : body
          ? { "Content-Type": "application/json" }
          : {},
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "The request could not be completed.");
  return data;
}
function ListingFields({
  value,
  onChange,
}: {
  value: Watch;
  onChange: (watch: Watch) => void;
}) {
  return (
    <>
      <div className="form-grid">
        {(
          [
            ["brand", "Brand"],
            ["model", "Model"],
            ["reference", "Reference (optional)"],
            ["price", "Public selling price (N$)"],
            ["year", "Year (optional)"],
            ["diameter", "Case diameter"],
            ["movement", "Movement"],
            ["caseMaterial", "Case material"],
            ["dial", "Dial"],
            ["bracelet", "Bracelet or strap"],
            ["waterResistance", "Water resistance"],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              type={["price", "year"].includes(key) ? "number" : "text"}
              value={value[key] ?? ""}
              required={["brand", "model", "price"].includes(key)}
              min={key === "price" ? 0.01 : key === "year" ? 1900 : undefined}
              max={
                key === "price"
                  ? 99999999
                  : key === "year"
                    ? new Date().getFullYear() + 1
                    : undefined
              }
              step={key === "price" ? ".01" : undefined}
              onChange={(e) =>
                onChange({
                  ...value,
                  [key]:
                    key === "year"
                      ? e.target.value
                        ? Number(e.target.value)
                        : null
                      : key === "price"
                        ? Number(e.target.value)
                        : e.target.value,
                })
              }
            />
          </label>
        ))}
        <label>
          Condition
          <select
            value={value.condition}
            onChange={(e) => onChange({ ...value, condition: e.target.value })}
          >
            {["Unworn", "Excellent", "Very good", "Good", "Fair"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Seller notes (short description)
        <textarea
          rows={4}
          required
          maxLength={4000}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
      <fieldset className="seo-fields">
        <legend>Search engine listing</legend>
        <p className="field-note">
          Leave these empty to use the automatic versions shown in grey. The
          write-up only uses the details above, so check them first.
        </p>
        <label>
          Watch page write-up
          <textarea
            rows={8}
            maxLength={6000}
            value={value.writeUp || ""}
            placeholder={generateWriteUp(value, seoContext)}
            onChange={(e) => onChange({ ...value, writeUp: e.target.value })}
          />
        </label>
        <button
          type="button"
          className="button button-outline"
          onClick={() =>
            onChange({ ...value, writeUp: generateWriteUp(value, seoContext) })
          }
        >
          Fill from specs
        </button>
        <label>
          Search result title ({(value.seoTitle || seoTitle(value)).length}/60)
          <input
            maxLength={70}
            value={value.seoTitle || ""}
            placeholder={seoTitle(value)}
            onChange={(e) => onChange({ ...value, seoTitle: e.target.value })}
          />
        </label>
        <label>
          Search result description (
          {(value.seoDescription || seoDescription(value, seoContext)).length}
          /155)
          <textarea
            rows={2}
            maxLength={170}
            value={value.seoDescription || ""}
            placeholder={seoDescription(value, seoContext)}
            onChange={(e) =>
              onChange({ ...value, seoDescription: e.target.value })
            }
          />
        </label>
      </fieldset>
      <label>
        Condition notes / known defects
        <textarea
          rows={2}
          maxLength={1500}
          value={value.defects || ""}
          onChange={(e) => onChange({ ...value, defects: e.target.value })}
        />
      </label>
      <div className="admin-checkboxes">
        {(
          [
            ["box", "Original box"],
            ["papers", "Original papers"],
          ] as const
        ).map(([key, label]) => (
          <label className="checkbox-label" key={key}>
            <input
              type="checkbox"
              checked={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>
    </>
  );
}
export function AdminStudio() {
  const router = useRouter(),
    [tab, setTab] = useState("overview"),
    [data, setData] = useState<Data | null>(null),
    [content, setContent] = useState<SiteContent | null>(null),
    [loading, setLoading] = useState(true),
    [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [search, setSearch] = useState(""),
    [editor, setEditor] = useState<Watch | null>(null),
    [review, setReview] = useState<Submission | null>(null),
    [publicListing, setPublicListing] = useState<Watch>(blank),
    [selected, setSelected] = useState<number[]>([]),
    [note, setNote] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [archiveTarget, setArchiveTarget] = useState<Watch | null>(null),
    [uploading, setUploading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request("/api/admin");
      setData(result);
      setContent((c) => c ?? result.content);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load administration.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(timer);
  }, [notice]);
  const canEdit = ["OWNER", "EDITOR"].includes(data?.admin.role || ""),
    pending =
      data?.submissions.filter((s) =>
        ["PENDING_REVIEW", "INFO_REQUESTED"].includes(s.status),
      ) || [];
  async function mutate(action: () => Promise<unknown>, message: string) {
    setWorking(true);
    setError("");
    try {
      await action();
      setNotice(message);
      await load();
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The action could not be completed.",
      );
      return false;
    } finally {
      setWorking(false);
    }
  }
  function openReview(s: Submission) {
    setReview(s);
    setPublicListing({
      ...blank,
      brand: s.brand,
      model: s.model,
      reference: s.reference,
      year: s.year,
      price: s.price,
      condition: s.condition,
      description: s.description,
      defects: s.defects,
      box: s.box,
      papers: s.papers,
      sellerType: "THIRD_PARTY",
      published: true,
    });
    setSelected(s.images.map((_, i) => i));
    setNote(s.reviewNote || "");
    setConfirmed(false);
    setError("");
  }
  async function decide(action: "APPROVE" | "REJECT" | "REQUEST_INFO") {
    if (!review) return;
    if (action === "APPROVE" && !confirmed) {
      setError(
        "Please confirm the public details, price and selected photographs.",
      );
      return;
    }
    const ok = await mutate(
      () =>
        request("/api/admin/submissions/" + review.id, "POST", {
          action,
          note,
          selectedImages: selected.sort((a, b) => a - b),
          ...(action === "APPROVE"
            ? { listing: publicListing, confirmPublication: true }
            : {}),
        }),
      action === "APPROVE"
        ? "Watch approved and published. Seller notification queued."
        : action === "REJECT"
          ? "Submission rejected. Seller notification queued."
          : "Information requested. The submission remains private.",
    );
    if (ok) setReview(null);
  }
  async function upload(files: File[]) {
    if (!editor || !files.length) return;
    if (files.length + editor.images.length > 8) {
      setError("Use up to eight product photographs.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      files.forEach((f) => body.append("photos", f));
      const result = await request("/api/admin/uploads", "POST", body);
      setEditor((w) =>
        w ? { ...w, images: [...w.images, ...result.images] } : null,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "The photo upload failed.");
    } finally {
      setUploading(false);
    }
  }
  function inventory(rows: Watch[]) {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timepiece</th>
              <th>Price (NAD)</th>
              <th>Availability</th>
              <th>Publication</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id}>
                <td>
                  <div className="table-timepiece">
                    <img src={w.images[0]} alt="" />
                    <div>
                      <strong>{w.brand}</strong>
                      <span>{w.model}</span>
                      <small>
                        {w.sellerType === "STORE"
                          ? "Company inventory"
                          : "Approved third-party"}
                      </small>
                    </div>
                  </div>
                </td>
                <td>{money(w.price)}</td>
                <td>
                  <span className={"status " + w.availability.toLowerCase()}>
                    {w.availability.toLowerCase()}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      "status " + (w.published ? "published" : "draft")
                    }
                  >
                    {w.published ? "Published" : "Unpublished"}
                  </span>
                  {w.featured && <Star size={12} className="inline-star" />}
                </td>
                <td>
                  {canEdit && (
                    <div className="table-actions">
                      <button
                        onClick={() => {
                          setEditor({ ...w });
                          setError("");
                        }}
                        aria-label={"Edit " + w.model}
                      >
                        Edit <ArrowUpRight size={12} />
                      </button>
                      {w.availability !== "ARCHIVED" && (
                        <button
                          onClick={() => setArchiveTarget(w)}
                          aria-label={"Archive " + w.model}
                        >
                          <Archive size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state">
            <WatchIcon size={27} />
            <h3>No watches in this view.</h3>
            <p>Add a timepiece or adjust the search.</p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="studio">
      <aside className="studio-sidebar">
        <Logo dark />
        <span className="studio-label">BOUTIQUE ADMINISTRATION</span>
        <nav aria-label="Administration">
          {tabs
            .filter(([id]) => canEdit || !["featured", "content"].includes(id))
            .map(([id, label, Icon]) => (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => {
                  setTab(id);
                  setSearch("");
                  setError("");
                }}
              >
                <Icon size={17} />
                {label}
                {id === "submissions" && !!pending.length && (
                  <span>{pending.length}</span>
                )}
              </button>
            ))}
        </nav>
        <div className="studio-sidebar-bottom">
          <div className="admin-identity">
            <span>{data?.admin.name || "Administrator"}</span>
            <small>{data?.admin.role || "AUTHORIZED ACCESS"}</small>
          </div>
          <Link href="/">
            <ArrowLeft size={14} />
            View the website
          </Link>
          <button
            onClick={async () => {
              await request("/api/auth", "POST", { action: "logout" });
              router.push("/admin/login");
              router.refresh();
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="studio-main">
        <header className="studio-topbar">
          <span>
            Administration <i>/</i> {tabs.find((t) => t[0] === tab)?.[1]}
          </span>
          <button disabled={loading} onClick={load}>
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </header>
        <div className="studio-body">
          <div className="studio-heading">
            <div>
              <span className="eyebrow">YOUR BOUTIQUE, AT A GLANCE</span>
              <h1>
                {
                  (
                    {
                      overview: "Welcome to your watch house.",
                      inventory: "Watch inventory",
                      submissions: "Pending submissions",
                      enquiries: "Customer enquiries",
                      featured: "Featured selection",
                      content: "Homepage & contact details",
                      activity: "Administrative activity",
                    } as Record<string, string>
                  )[tab]
                }
              </h1>
            </div>
            {canEdit && ["overview", "inventory", "featured"].includes(tab) && (
              <button
                className="button button-dark"
                onClick={() => {
                  setEditor({ ...blank });
                  setError("");
                }}
              >
                <Plus size={16} />
                Add a watch
              </button>
            )}
          </div>
          {error && !editor && !review && (
            <div className="admin-error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}
          {loading && !data ? (
            <div className="empty-state">
              <LoaderCircle className="spin" />
              <p>Loading your boutique…</p>
            </div>
          ) : (
            data && (
              <>
                {!data.email.configured && (
                  <div className="mail-notice">
                    <Mail size={17} />
                    <div>
                      <strong>Email delivery is not configured.</strong>
                      <p>
                        {data.email.queued} notification
                        {data.email.queued === 1 ? "" : "s"} queued. Submissions
                        are saved; configure email delivery to send
                        notifications.
                      </p>
                    </div>
                  </div>
                )}
                {tab === "overview" && (
                  <>
                    <div className="studio-stats">
                      {[
                        [
                          "Published watches",
                          data.watches.filter(
                            (w) =>
                              w.published &&
                              !["SOLD", "ARCHIVED"].includes(w.availability),
                          ).length,
                        ],
                        ["Pending submissions", pending.length],
                        [
                          "Sold timepieces",
                          data.watches.filter((w) => w.availability === "SOLD")
                            .length,
                        ],
                        [
                          "Customer enquiries",
                          data.enquiries.filter((e) => e.status === "NEW")
                            .length,
                        ],
                      ].map(([label, count]) => (
                        <div key={label}>
                          <span>{label}</span>
                          <strong>{String(count).padStart(2, "0")}</strong>
                          <small>
                            {label === "Pending submissions"
                              ? "Awaiting your consideration"
                              : label === "Customer enquiries"
                                ? "New conversations"
                                : "In your boutique"}
                          </small>
                        </div>
                      ))}
                    </div>
                    <div className="studio-panel-heading">
                      <h2>Recent inventory</h2>
                      <button onClick={() => setTab("inventory")}>
                        View all watches <ArrowUpRight size={14} />
                      </button>
                    </div>
                    {inventory(
                      data.watches
                        .filter((w) => w.availability !== "ARCHIVED")
                        .slice(0, 5),
                    )}
                    <div className="studio-panel-heading">
                      <h2>Waiting for a closer look</h2>
                      <span>{pending.length} submissions</span>
                    </div>
                    {pending.length ? (
                      <div className="review-queue">
                        {pending.slice(0, 3).map((s) => (
                          <button key={s.id} onClick={() => openReview(s)}>
                            <img src={s.images[0]} alt="" />
                            <div>
                              <strong>
                                {s.brand} {s.model}
                              </strong>
                              <small>
                                {s.name} · {date(s.createdAt)}
                              </small>
                            </div>
                            <span className="status pending_review">
                              Review
                            </span>
                            <ArrowUpRight size={17} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="admin-empty-inline">
                        All caught up. New seller submissions will appear here.
                      </div>
                    )}
                    <div className="studio-panel-heading">
                      <h2>Recent activity</h2>
                    </div>
                    <div className="activity-list">
                      {data.activity.slice(0, 5).map((a) => (
                        <div key={a.id}>
                          <span className="activity-dot" />
                          <div>
                            <strong>
                              {a.action.replaceAll("_", " ").toLowerCase()}
                            </strong>
                            <p>{a.actor?.name}</p>
                          </div>
                          <time>{date(a.createdAt)}</time>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {["inventory", "featured"].includes(tab) && (
                  <>
                    <div className="admin-filter-bar">
                      <label>
                        <Search size={16} />
                        <input
                          aria-label="Search inventory"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search brand or model"
                        />
                      </label>
                      <span>
                        {tab === "featured"
                          ? "Edit a watch to feature or unfeature it."
                          : "Includes unpublished, reserved, sold and archived records."}
                      </span>
                    </div>
                    {inventory(
                      data.watches.filter(
                        (w) =>
                          (tab !== "featured" || w.featured) &&
                          [w.brand, w.model]
                            .join(" ")
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                      ),
                    )}
                  </>
                )}
                {tab === "submissions" && (
                  <div>
                    {data.submissions.map((s) => (
                      <article className="admin-submission" key={s.id}>
                        <img src={s.images[0]} alt="Private submitted watch" />
                        <div>
                          <span className="eyebrow">{s.brand}</span>
                          <h2>{s.model}</h2>
                          <p>
                            {s.name} · {s.email}
                          </p>
                          <small>
                            {date(s.createdAt)} · {money(s.price)} ·{" "}
                            {s.preferredContactMethod} preferred
                          </small>
                        </div>
                        <span className={"status " + s.status.toLowerCase()}>
                          {s.status.replaceAll("_", " ").toLowerCase()}
                        </span>
                        <button
                          className="button button-outline button-sm"
                          onClick={() => openReview(s)}
                        >
                          Review <ArrowUpRight size={15} />
                        </button>
                      </article>
                    ))}
                    {!data.submissions.length && (
                      <div className="empty-state">
                        <Inbox size={27} />
                        <h3>All caught up.</h3>
                        <p>
                          Private submissions will appear here, ready for
                          review.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {tab === "enquiries" && (
                  <div>
                    {data.enquiries.map((e) => (
                      <article className="enquiry-card" key={e.id}>
                        <div>
                          <span className="eyebrow">{date(e.createdAt)}</span>
                          <h2>{e.name}</h2>
                          <a href={"mailto:" + e.email}>{e.email}</a>
                          {e.phone && <p>{e.phone}</p>}
                          {e.watch && (
                            <span className="enquiry-watch">
                              {e.watch.brand} {e.watch.model}
                            </span>
                          )}
                          <p>{e.message}</p>
                        </div>
                        <label>
                          Enquiry status
                          <select
                            value={e.status}
                            aria-label={"Status for " + e.name}
                            disabled={working}
                            onChange={(event) =>
                              mutate(
                                () =>
                                  request(
                                    "/api/admin/enquiries/" + e.id,
                                    "PATCH",
                                    { status: event.target.value },
                                  ),
                                "Enquiry updated.",
                              )
                            }
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </label>
                      </article>
                    ))}
                    {!data.enquiries.length && (
                      <div className="empty-state">
                        <MessageSquare size={27} />
                        <h3>A conversation will start here.</h3>
                        <p>
                          Website enquiries are saved with the watch and
                          customer contact details.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {tab === "content" && content && (
                  <form
                    className="content-editor"
                    onSubmit={(e) => {
                      e.preventDefault();
                      mutate(
                        () => request("/api/admin/content", "PATCH", content),
                        "Website content saved.",
                      );
                    }}
                  >
                    <div className="content-editor-section">
                      <h2>Homepage & story</h2>
                      {(
                        [
                          ["heroTitle", "Hero headline"],
                          ["heroSubtitle", "Hero description"],
                          ["aboutTitle", "About headline"],
                          ["aboutText", "About description"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key}>
                          {label}
                          {key === "aboutText" || key === "heroSubtitle" ? (
                            <textarea
                              required
                              rows={4}
                              value={content[key]}
                              onChange={(e) =>
                                setContent({
                                  ...content,
                                  [key]: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <input
                              required
                              value={content[key]}
                              onChange={(e) =>
                                setContent({
                                  ...content,
                                  [key]: e.target.value,
                                })
                              }
                            />
                          )}
                        </label>
                      ))}
                    </div>
                    <div className="content-editor-section">
                      <h2>Business contact</h2>
                      {(
                        [
                          ["contactEmail", "Business email"],
                          ["contactPhone", "Phone"],
                          ["location", "Location"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            type={key === "contactEmail" ? "email" : "text"}
                            value={content[key]}
                            onChange={(e) =>
                              setContent({ ...content, [key]: e.target.value })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <button className="button button-dark" disabled={working}>
                      Save changes <Check size={16} />
                    </button>
                  </form>
                )}
                {tab === "activity" && (
                  <>
                    <div className="email-operations">
                      <div>
                        <h2>Notification delivery</h2>
                        <p>
                          {data.email.queued} notifications pending or requiring
                          attention. Provider{" "}
                          {data.email.configured
                            ? "configured"
                            : "not configured"}
                          .
                        </p>
                      </div>
                      {canEdit && (
                        <button
                          className="button button-outline button-sm"
                          disabled={working || !data.email.configured}
                          onClick={() =>
                            mutate(
                              () =>
                                request("/api/admin/notifications", "POST", {}),
                              "Notification retry completed. Check queue status.",
                            )
                          }
                        >
                          Retry notifications <RefreshCw size={14} />
                        </button>
                      )}
                    </div>
                    <div className="activity-list">
                      {data.activity.map((a) => (
                        <div key={a.id}>
                          <span className="activity-dot" />
                          <div>
                            <strong>
                              {a.action.replaceAll("_", " ").toLowerCase()}
                            </strong>
                            <p>
                              {a.actor?.name} · {a.detail || a.entityId}
                            </p>
                          </div>
                          <time>{date(a.createdAt)}</time>
                        </div>
                      ))}
                      {!data.activity.length && (
                        <div className="empty-state">
                          <History size={27} />
                          <h3>A clear record.</h3>
                          <p>
                            Review decisions and inventory changes will be
                            recorded here.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )
          )}
        </div>
      </main>
      {notice && (
        <div className="studio-toast" role="status">
          {notice}
        </div>
      )}
      <Dialog
        open={!!editor}
        onOpenChange={(open) => {
          if (!open && !working) setEditor(null);
        }}
      >
        <DialogContent className="admin-dialog">
          <DialogTitle className="dialog-heading">
            {editor?.id ? "Edit watch" : "Add a watch"}
          </DialogTitle>
          <DialogDescription>
            Confirm the details, photographs and publication status.
          </DialogDescription>
          {editor && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await mutate(
                  () =>
                    request(
                      "/api/admin/watches" + (editor.id ? "/" + editor.id : ""),
                      editor.id ? "PATCH" : "POST",
                      editor,
                    ),
                  "Watch saved.",
                );
                if (ok) setEditor(null);
              }}
            >
              <ListingFields value={editor} onChange={setEditor} />
              <div className="form-grid">
                <label>
                  Availability
                  <select
                    value={editor.availability}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        availability: e.target.value as Watch["availability"],
                        published: ["SOLD", "ARCHIVED"].includes(e.target.value)
                          ? false
                          : editor.published,
                      })
                    }
                  >
                    {["AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Ownership
                  <input
                    readOnly
                    value={
                      editor.sellerType === "STORE"
                        ? "Company inventory"
                        : "Approved third-party listing"
                    }
                  />
                </label>
              </div>
              <div className="admin-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editor.published}
                    disabled={["SOLD", "ARCHIVED"].includes(
                      editor.availability,
                    )}
                    onChange={(e) =>
                      setEditor({ ...editor, published: e.target.checked })
                    }
                  />
                  Publish on website
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editor.featured}
                    onChange={(e) =>
                      setEditor({ ...editor, featured: e.target.checked })
                    }
                  />
                  Feature on homepage
                </label>
              </div>
              <label className="admin-upload">
                <Upload size={18} />
                {uploading
                  ? "Processing photographs…"
                  : "Upload product photographs"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploading}
                  onChange={(e) => upload([...(e.target.files || [])])}
                />
              </label>
              <p className="field-note">
                Up to 8 photos, 4 MB each. Images are optimized and stripped of
                embedded metadata.
              </p>
              <div className="admin-photo-previews">
                {editor.images.map((url, i) => (
                  <div key={url}>
                    <img src={url} alt={"Product photograph " + (i + 1)} />
                    <button
                      type="button"
                      aria-label={"Remove photo " + (i + 1)}
                      onClick={() =>
                        setEditor({
                          ...editor,
                          images: editor.images.filter((_, j) => i !== j),
                        })
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button-dark full"
                disabled={working || uploading}
              >
                Save watch <Check size={16} />
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!review}
        onOpenChange={(open) => {
          if (!open && !working) setReview(null);
        }}
      >
        <DialogContent className="admin-dialog review-dialog">
          <DialogTitle className="dialog-heading">
            {review?.brand} {review?.model}
          </DialogTitle>
          <DialogDescription>
            Private submission review. Seller details stay private.
          </DialogDescription>
          {review && (
            <>
              <span className={"status " + review.status.toLowerCase()}>
                {review.status.replaceAll("_", " ")}
              </span>
              <dl className="detail-specs">
                {[
                  ["Seller", review.name],
                  ["Email", review.email],
                  ["Phone", review.phone],
                  ["Preferred contact", review.preferredContactMethod],
                  ["Submitted", date(review.createdAt)],
                  ["Requested price", money(review.price)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="admin-section-title">
                Photographs for public display
              </h3>
              <p className="field-note">
                Deselect personal documents, identifying details and unsuitable
                photos. Only selected images will be published.
              </p>
              <div className="review-photos">
                {review.images.map((url, i) => (
                  <label key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={"Open submitted photo " + (i + 1)}
                    >
                      <img
                        src={url}
                        alt={"Private submitted photo " + (i + 1)}
                      />
                      <ArrowUpRight size={15} />
                    </a>
                    <span>
                      <input
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, i]
                              : selected.filter((n) => n !== i),
                          )
                        }
                      />
                      Publish photograph {i + 1}
                    </span>
                  </label>
                ))}
              </div>
              {["PENDING_REVIEW", "INFO_REQUESTED"].includes(review.status) ? (
                <>
                  <h3 className="admin-section-title">
                    Confirm the public listing
                  </h3>
                  <p className="field-note">
                    Edit the description and selling price before publishing.
                    The original private submission is retained.
                  </p>
                  <ListingFields
                    value={publicListing}
                    onChange={setPublicListing}
                  />
                  <label>
                    Message to seller / internal review note
                    <textarea
                      value={note}
                      rows={3}
                      maxLength={2000}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Required when requesting more information."
                    />
                  </label>
                  <label className="checkbox-label consent">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    I confirm the public price, description and selected
                    photographs are ready to publish.
                  </label>
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="review-actions">
                    <button
                      className="button button-outline"
                      disabled={working}
                      onClick={() => decide("REJECT")}
                    >
                      Reject
                    </button>
                    <button
                      className="button button-outline"
                      disabled={working}
                      onClick={() => decide("REQUEST_INFO")}
                    >
                      Request more information
                    </button>
                    <button
                      className="button button-dark"
                      disabled={working || !selected.length || !confirmed}
                      onClick={() => decide("APPROVE")}
                    >
                      Approve & publish <Check size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <p className="review-description">
                  Reviewed {review.reviewedAt ? date(review.reviewedAt) : ""}.{" "}
                  {review.reviewNote}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      >
        <DialogContent className="admin-dialog">
          <DialogTitle className="dialog-heading">
            Archive this listing?
          </DialogTitle>
          <DialogDescription>
            {archiveTarget?.brand} {archiveTarget?.model} will be removed from
            the public collection. Its record and activity history will be kept.
          </DialogDescription>
          <div className="review-actions">
            <button
              className="button button-outline"
              onClick={() => setArchiveTarget(null)}
            >
              Cancel
            </button>
            <button
              className="button button-dark"
              disabled={working}
              onClick={async () => {
                if (
                  archiveTarget &&
                  (await mutate(
                    () =>
                      request(
                        "/api/admin/watches/" + archiveTarget.id,
                        "DELETE",
                      ),
                    "Listing archived.",
                  ))
                )
                  setArchiveTarget(null);
              }}
            >
              Archive listing <Archive size={15} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
