"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Watch as WatchIcon,
  Inbox,
  MessageSquare,
  History,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  AlertCircle,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { formatNAD, BRAND } from "@/config/brand";

interface AdminDashboardProps {
  initialData: {
    admin: { id: string; email: string; name: string; role: string };
    metrics: {
      totalPublished: number;
      pendingSubmissions: number;
      soldWatches: number;
      totalEnquiries: number;
      totalInventoryValue: number;
    };
    watches: any[];
    submissions: any[];
    enquiries: any[];
    activities: any[];
  };
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "submissions" | "enquiries" | "activity">("overview");

  // Local state for live mutations
  const [watches, setWatches] = useState(initialData.watches);
  const [submissions, setSubmissions] = useState(initialData.submissions);
  const [enquiries, setEnquiries] = useState(initialData.enquiries);
  const [activities, setActivities] = useState(initialData.activities);
  const [metrics, setMetrics] = useState(initialData.metrics);

  // Search & Filter state for Inventory
  const [watchSearch, setWatchSearch] = useState("");
  const [watchStatusFilter, setWatchStatusFilter] = useState("ALL");

  // Add / Edit Watch Modal state
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [editingWatchId, setEditingWatchId] = useState<string | null>(null);
  const [watchForm, setWatchForm] = useState({
    brand: "",
    model: "",
    referenceNumber: "",
    year: "",
    condition: BRAND.conditions[0],
    price: "",
    description: "",
    diameter: "40mm",
    movement: "Automatic",
    status: "AVAILABLE",
    ownershipType: "COMPANY",
    box: true,
    papers: true,
    featured: false,
    published: true,
    images: [] as string[],
  });
  const [isSavingWatch, setIsSavingWatch] = useState(false);
  const [uploadingWatchPhoto, setUploadingWatchPhoto] = useState(false);

  // Review Submission Modal state
  const [reviewModalData, setReviewModalData] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "INFO_REQUESTED">("APPROVE");
  const [reviewNotes, setReviewNotes] = useState("");
  const [approvedPrice, setApprovedPrice] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  // Filtered watches
  const filteredWatches = watches.filter((w) => {
    if (watchStatusFilter !== "ALL" && w.status !== watchStatusFilter) return false;
    if (watchSearch.trim()) {
      const q = watchSearch.toLowerCase();
      return (
        w.brand.toLowerCase().includes(q) ||
        w.model.toLowerCase().includes(q) ||
        (w.referenceNumber && w.referenceNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Open Create Watch Modal
  const openCreateWatch = () => {
    setEditingWatchId(null);
    setWatchForm({
      brand: "",
      model: "",
      referenceNumber: "",
      year: "2023",
      condition: BRAND.conditions[0],
      price: "",
      description: "",
      diameter: "40mm",
      movement: "Automatic",
      status: "AVAILABLE",
      ownershipType: "COMPANY",
      box: true,
      papers: true,
      featured: false,
      published: true,
      images: ["/watches/daytona.webp"],
    });
    setShowWatchModal(true);
  };

  // Open Edit Watch Modal
  const openEditWatch = (w: any) => {
    setEditingWatchId(w.id);
    setWatchForm({
      brand: w.brand,
      model: w.model,
      referenceNumber: w.referenceNumber || "",
      year: w.year ? String(w.year) : "",
      condition: w.condition,
      price: String(w.price / 100), // major units
      description: w.description,
      diameter: w.diameter || "40mm",
      movement: w.movement || "Automatic",
      status: w.status,
      ownershipType: w.ownershipType || "COMPANY",
      box: w.box,
      papers: w.papers,
      featured: w.featured,
      published: w.published,
      images: w.images ? w.images.map((img: any) => img.imageUrl) : [],
    });
    setShowWatchModal(true);
  };

  // Handle Photo Upload for Watch
  const handleWatchPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingWatchPhoto(true);

    try {
      const fd = new FormData();
      Array.from(e.target.files).forEach((f) => fd.append("photos", f));

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setWatchForm((prev) => ({
        ...prev,
        images: [...prev.images, ...data.urls],
      }));
    } catch (err: any) {
      alert(err.message || "Failed to upload photo.");
    } finally {
      setUploadingWatchPhoto(false);
    }
  };

  // Save Watch (Create or Edit)
  const handleSaveWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWatch(true);

    try {
      const payload = {
        ...watchForm,
        price: Number(watchForm.price),
        year: watchForm.year ? Number(watchForm.year) : null,
      };

      if (editingWatchId) {
        // Edit
        const res = await fetch("/api/admin/watches", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingWatchId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setWatches((prev) =>
          prev.map((w) => (w.id === editingWatchId ? data.watch : w)),
        );
      } else {
        // Create
        const res = await fetch("/api/admin/watches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setWatches((prev) => [data.watch, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          totalPublished: prev.totalPublished + 1,
        }));
      }

      setShowWatchModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save watch.");
    } finally {
      setIsSavingWatch(false);
    }
  };

  // Toggle Featured Quick Action
  const toggleFeatured = async (watch: any) => {
    try {
      const res = await fetch("/api/admin/watches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: watch.id, featured: !watch.featured }),
      });
      if (res.ok) {
        setWatches((prev) =>
          prev.map((w) => (w.id === watch.id ? { ...w, featured: !w.featured } : w)),
        );
      }
    } catch {
      alert("Failed to toggle featured state.");
    }
  };

  // Delete Watch
  const handleDeleteWatch = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/watches?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWatches((prev) => prev.filter((w) => w.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete watch.");
      }
    } catch {
      alert("Error deleting watch.");
    }
  };

  // Open Review Submission Modal
  const openReviewModal = (submission: any, action: "APPROVE" | "REJECT" | "INFO_REQUESTED") => {
    setReviewModalData(submission);
    setReviewAction(action);
    setApprovedPrice(String(submission.requestedPrice / 100));
    setReviewNotes(
      action === "APPROVE"
        ? "Listing approved and published to Atelier live catalogue."
        : action === "REJECT"
        ? "Condition or provenance does not align with current boutique requirements."
        : "Please provide high-resolution photos of the case back and balance movement.",
    );
  };

  // Submit Review Decision
  const handleReviewDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalData) return;
    setIsReviewing(true);

    try {
      const res = await fetch("/api/admin/submissions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: reviewModalData.id,
          action: reviewAction,
          reviewNotes,
          approvedPrice: reviewAction === "APPROVE" ? Number(approvedPrice) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === reviewModalData.id
            ? { ...s, status: reviewAction, reviewNotes }
            : s,
        ),
      );

      if (reviewAction === "APPROVE" && data.watch) {
        setWatches((prev) => [data.watch, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          pendingSubmissions: Math.max(0, prev.pendingSubmissions - 1),
          totalPublished: prev.totalPublished + 1,
        }));
      }

      setReviewModalData(null);
    } catch (err: any) {
      alert(err.message || "Failed to process submission decision.");
    } finally {
      setIsReviewing(false);
    }
  };

  // Update Enquiry Status
  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/enquiries/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
        );
      }
    } catch {
      alert("Failed to update enquiry status.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans-ui">
      
      {/* Top Application Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Atelier Studio Admin
            </h1>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>{initialData.admin.name}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                {initialData.admin.role}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink size={13} />
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar Tabs */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 shrink-0">
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              {
                id: "inventory",
                label: "Watch Inventory",
                icon: WatchIcon,
                count: watches.length,
              },
              {
                id: "submissions",
                label: "Pending Reviews",
                icon: Inbox,
                count: metrics.pendingSubmissions,
                highlight: metrics.pendingSubmissions > 0,
              },
              {
                id: "enquiries",
                label: "Customer Inquiries",
                icon: MessageSquare,
                count: enquiries.filter((e) => e.status === "NEW").length,
              },
              { id: "activity", label: "Audit Activity", icon: History },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.highlight
                          ? "bg-amber-400 text-slate-950"
                          : active
                          ? "bg-slate-800 text-slate-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Operational Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === "overview" && (
            <div className="space-y-8 max-w-6xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Operational Performance
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time inventory metrics, pending consignments, and customer communications in Namibia.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Published Watches
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {metrics.totalPublished}
                  </div>
                  <div className="text-xs text-emerald-600 mt-2 font-medium">
                    Live on public storefront
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
                    Pending Submissions
                  </div>
                  <div className="text-2xl font-bold text-amber-900">
                    {metrics.pendingSubmissions}
                  </div>
                  <div className="text-xs text-amber-700 mt-2 font-medium">
                    Awaiting curator evaluation
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Acquired / Sold
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {metrics.soldWatches}
                  </div>
                  <div className="text-xs text-slate-500 mt-2 font-medium">
                    Historical completed sales
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Customer Enquiries
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {metrics.totalEnquiries}
                  </div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    Client communication leads
                  </div>
                </div>
              </div>

              {/* Inventory Valuation Banner */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Active Vault Inventory Valuation (NAD)
                  </div>
                  <div className="text-3xl font-bold text-slate-900 font-mono">
                    {formatNAD(metrics.totalInventoryValue)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculated from current live available pieces in Windhoek.
                  </p>
                </div>
                <button
                  onClick={openCreateWatch}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Plus size={15} />
                  <span>Add New Watch Listing</span>
                </button>
              </div>

              {/* Quick Actions & Recent Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Submissions Queue */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Submissions Requiring Action
                    </h3>
                    <button
                      onClick={() => setActiveTab("submissions")}
                      className="text-xs text-slate-500 hover:text-slate-900"
                    >
                      View All →
                    </button>
                  </div>

                  {submissions.filter((s) => s.status === "PENDING_REVIEW").length > 0 ? (
                    <div className="space-y-3">
                      {submissions
                        .filter((s) => s.status === "PENDING_REVIEW")
                        .slice(0, 3)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {s.brand} {s.model}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                By {s.seller.fullName} • Asking {formatNAD(s.requestedPrice)}
                              </div>
                            </div>
                            <button
                              onClick={() => openReviewModal(s, "APPROVE")}
                              className="px-3 py-1 rounded bg-slate-900 text-white text-[11px] font-medium"
                            >
                              Review
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No pending submissions in queue.
                    </div>
                  )}
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">
                    Audit Trail & Actions
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {activities.slice(0, 5).map((act) => (
                      <div key={act.id} className="text-xs border-b border-slate-100 pb-2.5">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="font-semibold text-slate-700">
                            {act.action}
                          </span>
                          <span className="text-[10px]">
                            {new Date(act.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600">{act.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WATCH INVENTORY MANAGEMENT */}
          {activeTab === "inventory" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Watch Inventory Management
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Add, edit, change prices, feature on homepage, or archive luxury timepieces.
                  </p>
                </div>
                <button
                  onClick={openCreateWatch}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus size={15} />
                  <span>Add Timepiece</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={watchSearch}
                    onChange={(e) => setWatchSearch(e.target.value)}
                    placeholder="Search brand, model, ref..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-500">Status:</span>
                  <select
                    value={watchStatusFilter}
                    onChange={(e) => setWatchStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
              </div>

              {/* Watches Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Timepiece</th>
                        <th className="py-3 px-4">Condition</th>
                        <th className="py-3 px-4">Price (NAD)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Featured</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredWatches.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                <img
                                  src={w.images?.[0]?.imageUrl || "/watches/daytona.webp"}
                                  alt=""
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {w.brand} {w.model}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {w.referenceNumber || "No ref"} {w.year ? `• ${w.year}` : ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {w.condition}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                            {formatNAD(w.price)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                w.status === "AVAILABLE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : w.status === "RESERVED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-500">
                            {w.ownershipType === "COMPANY" ? "Boutique" : "Consignment"}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleFeatured(w)}
                              className={`p-1 rounded transition-colors ${
                                w.featured
                                  ? "text-amber-500 hover:text-amber-600"
                                  : "text-slate-300 hover:text-slate-400"
                              }`}
                              title={w.featured ? "Featured on homepage" : "Not featured"}
                            >
                              <Sparkles size={16} />
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/watches/${w.slug}`}
                                target="_blank"
                                className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                                title="View public page"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                onClick={() => openEditWatch(w)}
                                className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
                                title="Edit listing"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteWatch(w.id, `${w.brand} ${w.model}`)}
                                className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                                title="Delete listing"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENDING WATCH SUBMISSIONS (Consignment Review Queue) */}
          {activeTab === "submissions" && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Consignment Submissions Review Queue
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Examine third-party watch submissions. No submission is published without curator verification and approval.
                </p>
              </div>

              <div className="space-y-4">
                {submissions.map((sub) => {
                  const isPending = sub.status === "PENDING_REVIEW";
                  return (
                    <div
                      key={sub.id}
                      className={`bg-white rounded-xl border p-6 shadow-sm transition-all ${
                        isPending ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === "PENDING_REVIEW"
                                  ? "bg-amber-100 text-amber-900"
                                  : sub.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : sub.status === "REJECTED"
                                  ? "bg-rose-100 text-rose-900"
                                  : "bg-blue-100 text-blue-900"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {sub.id.substring(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              • Submitted {new Date(sub.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {sub.brand} {sub.model}
                          </h3>
                          <div className="text-xs text-slate-600 font-mono">
                            Ref: {sub.referenceNumber || "N/A"} • Year: {sub.year || "N/A"} • Condition: {sub.condition}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400 uppercase font-semibold">
                            Seller Asking Price
                          </div>
                          <div className="text-xl font-bold text-slate-900 font-mono">
                            {formatNAD(sub.requestedPrice)}
                          </div>
                        </div>
                      </div>

                      {/* Seller Identity Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-4">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Seller Name
                          </span>
                          <span className="font-semibold text-slate-800">
                            {sub.seller?.fullName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Email & Phone
                          </span>
                          <span className="text-slate-800">
                            {sub.seller?.email} • {sub.seller?.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Contact Preference
                          </span>
                          <span className="font-semibold text-slate-800">
                            {sub.seller?.preferredContactMethod}
                          </span>
                        </div>
                      </div>

                      {/* Description & Flaws */}
                      <div className="text-xs text-slate-600 space-y-1 mb-4 leading-relaxed">
                        <p><strong>Description:</strong> {sub.description}</p>
                        {sub.defects && (
                          <p className="text-rose-600"><strong>Reported Flaws:</strong> {sub.defects}</p>
                        )}
                        <p className="text-slate-500">
                          <strong>Included:</strong> Box: {sub.box ? "Yes" : "No"} • Papers: {sub.papers ? "Yes" : "No"} • Proof: {sub.proof ? "Yes" : "No"}
                        </p>
                      </div>

                      {/* Submitted Photographs Preview */}
                      {sub.images && sub.images.length > 0 && (
                        <div className="mb-4">
                          <div className="text-[11px] font-semibold text-slate-400 uppercase mb-2">
                            Seller Photographs ({sub.images.length})
                          </div>
                          <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {sub.images.map((img: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-100 p-1 shrink-0 flex items-center justify-center overflow-hidden"
                              >
                                <img
                                  src={img.storageKey}
                                  alt=""
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Review Actions Bar */}
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          {sub.reviewNotes && (
                            <span><strong>Review Note:</strong> {sub.reviewNotes}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openReviewModal(sub, "INFO_REQUESTED")}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                          >
                            Request More Info
                          </button>
                          <button
                            onClick={() => openReviewModal(sub, "REJECT")}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openReviewModal(sub, "APPROVE")}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            <span>Approve & Publish</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER ENQUIRIES */}
          {activeTab === "enquiries" && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Customer Enquiries & Sourcing Leads
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage website and specific timepiece enquiries from collectors.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {enquiries.map((enq) => (
                    <div key={enq.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {enq.customerName}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({enq.customerEmail} • {enq.customerPhone || "No phone"})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {new Date(enq.createdAt).toLocaleDateString()}
                          </span>
                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                            className={`px-2.5 py-1 rounded text-xs font-bold border focus:outline-none cursor-pointer ${
                              enq.status === "NEW"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : enq.status === "CONTACTED"
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                      </div>

                      {enq.watch && (
                        <div className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded inline-block mb-2">
                          Interested in: {enq.watch.brand} {enq.watch.model}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                        {enq.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === "activity" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Administrative Audit Trail
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete historic record of inventory additions, submission reviews, and pricing updates.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="text-xs border-b border-slate-100 pb-3 flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="font-bold text-slate-800">
                          {act.action}
                        </span>
                        <span className="text-[11px]">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600">{act.detail}</p>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Actor: {act.actorName || "System"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT WATCH MODAL */}
      {showWatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingWatchId ? "Edit Watch Listing" : "Add New Watch to Catalogue"}
              </h3>
              <button
                onClick={() => setShowWatchModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={watchForm.brand}
                    onChange={(e) => setWatchForm({ ...watchForm, brand: e.target.value })}
                    placeholder="e.g. Rolex"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={watchForm.model}
                    onChange={(e) => setWatchForm({ ...watchForm, model: e.target.value })}
                    placeholder="e.g. Submariner Date"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={watchForm.referenceNumber}
                    onChange={(e) => setWatchForm({ ...watchForm, referenceNumber: e.target.value })}
                    placeholder="e.g. 116610LN"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={watchForm.year}
                    onChange={(e) => setWatchForm({ ...watchForm, year: e.target.value })}
                    placeholder="2022"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={watchForm.condition}
                    onChange={(e) => setWatchForm({ ...watchForm, condition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                  >
                    {BRAND.conditions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price in NAD (N$) *
                  </label>
                  <input
                    type="number"
                    required
                    value={watchForm.price}
                    onChange={(e) => setWatchForm({ ...watchForm, price: e.target.value })}
                    placeholder="e.g. 185000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={watchForm.status}
                    onChange={(e) => setWatchForm({ ...watchForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={watchForm.description}
                  onChange={(e) => setWatchForm({ ...watchForm, description: e.target.value })}
                  placeholder="Detail case finish, dial variant, movement calibre..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                />
              </div>

              {/* Photos upload & current photos */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Photos ({watchForm.images.length})
                </label>
                <div className="flex items-center gap-3 mb-2 overflow-x-auto pb-1">
                  {watchForm.images.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded border bg-slate-50 p-1 shrink-0">
                      <img src={url} alt="" className="max-h-full max-w-full object-contain mx-auto" />
                      <button
                        type="button"
                        onClick={() =>
                          setWatchForm({
                            ...watchForm,
                            images: watchForm.images.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute top-0 right-0 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleWatchPhotoUpload}
                    className="hidden"
                    id="watch-photo-modal-input"
                  />
                  <label
                    htmlFor="watch-photo-modal-input"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-700"
                  >
                    <Upload size={13} />
                    <span>{uploadingWatchPhoto ? "Uploading..." : "Upload Photos"}</span>
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchForm.featured}
                    onChange={(e) => setWatchForm({ ...watchForm, featured: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span className="text-slate-700">Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchForm.published}
                    onChange={(e) => setWatchForm({ ...watchForm, published: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span className="text-slate-700">Published to Live Catalogue</span>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWatchModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWatch}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 shadow-sm"
                >
                  {isSavingWatch ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-amber-400" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingWatchId ? "Update Watch" : "Publish Watch"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW SUBMISSION DECISION MODAL */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {reviewAction === "APPROVE"
                  ? "Approve & Publish Watch"
                  : reviewAction === "REJECT"
                  ? "Reject Submission"
                  : "Request Additional Information"}
              </h3>
              <button
                onClick={() => setReviewModalData(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewDecision} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-800">
                  {reviewModalData.brand} {reviewModalData.model}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Seller: {reviewModalData.seller.fullName} ({reviewModalData.seller.email})
                </div>
              </div>

              {reviewAction === "APPROVE" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirmed Public Selling Price in NAD (N$) *
                  </label>
                  <input
                    type="number"
                    required
                    value={approvedPrice}
                    onChange={(e) => setApprovedPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    The watch will be immediately created as an active listing and the seller will be emailed confirmation.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {reviewAction === "APPROVE"
                    ? "Curator Internal Note"
                    : reviewAction === "REJECT"
                    ? "Rejection Reason (Emailed to seller)"
                    : "Information Requested (Emailed to seller)"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalData(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReviewing}
                  className={`px-5 py-2 rounded-lg text-white font-semibold flex items-center gap-2 shadow-sm ${
                    reviewAction === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : reviewAction === "REJECT"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {isReviewing ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Decision</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
