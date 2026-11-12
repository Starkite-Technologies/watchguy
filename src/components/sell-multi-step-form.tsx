"use client";

import { useState } from "react";
import {
  User,
  Watch as WatchIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Box,
  FileText,
} from "lucide-react";
import { BRAND, formatNAD } from "@/config/brand";

export function SellMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Seller info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"WHATSAPP" | "EMAIL" | "PHONE">("WHATSAPP");

  // Step 2: Watch info
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState(BRAND.conditions[0]);
  const [requestedPrice, setRequestedPrice] = useState("");
  const [description, setDescription] = useState("");
  const [defects, setDefects] = useState("");
  const [box, setBox] = useState(false);
  const [papers, setPapers] = useState(false);
  const [proof, setProof] = useState(false);

  // Step 3: Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Step 4: Consent & submission state
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedData, setSubmittedData] = useState<{
    submissionId: string;
    referenceCode: string;
  } | null>(null);

  // Handle file selection with client-side preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 8 MB.`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setPhotos((prev) => [...prev, ...validFiles].slice(0, 8));
    setPhotoPreviews((prev) => [...prev, ...validPreviews].slice(0, 8));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Step validation
  const validateStep1 = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please complete all required contact fields.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const validateStep2 = () => {
    if (!brand.trim() || !model.trim() || !requestedPrice || !description.trim()) {
      setErrorMsg("Please fill in the watch brand, model, asking price, and description.");
      return false;
    }
    if (Number(requestedPrice) <= 0) {
      setErrorMsg("Asking price in NAD must be greater than zero.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const validateStep3 = () => {
    if (photos.length === 0) {
      setErrorMsg("Please upload at least one photograph of your timepiece.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setErrorMsg("You must confirm you have the legal right to sell this watch.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("preferredContactMethod", preferredContactMethod);

      formData.append("brand", brand);
      formData.append("model", model);
      if (referenceNumber) formData.append("referenceNumber", referenceNumber);
      if (year) formData.append("year", year);
      formData.append("condition", condition);
      formData.append("requestedPrice", requestedPrice);
      formData.append("currency", "NAD");
      formData.append("description", description);
      if (defects) formData.append("defects", defects);
      formData.append("box", String(box));
      formData.append("papers", String(papers));
      formData.append("proof", String(proof));
      formData.append("consent", "true");

      photos.forEach((file) => {
        formData.append("photos", file);
      });

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please check your information.");
      }

      setSubmittedData({
        submissionId: data.submissionId,
        referenceCode: data.referenceCode,
      });
      setCurrentStep(5); // Confirmation screen
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Seller Details", icon: User },
    { number: 2, label: "Timepiece Specs", icon: WatchIcon },
    { number: 3, label: "Photographs", icon: Upload },
    { number: 4, label: "Review & Terms", icon: ShieldCheck },
  ];

  // Render Confirmation Screen
  if (currentStep === 5 && submittedData) {
    return (
      <div className="luxury-glass rounded-3xl p-8 md:p-14 border border-white/[0.1] text-center max-w-2xl mx-auto shadow-2xl bg-[#0C0E11]">
        <div className="w-20 h-20 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-[#B79B6C] font-medium block mb-2">
          Submission Received & Stored
        </span>

        <h2 className="font-editorial text-3xl sm:text-4xl text-white font-normal uppercase mb-4">
          Under Private Review
        </h2>

        <div className="inline-block bg-[#14171A] border border-white/[0.08] px-5 py-2.5 rounded-xl font-mono text-sm text-[#B79B6C] mb-6">
          Reference Code: {submittedData.referenceCode}
        </div>

        <p className="text-sm sm:text-base text-[#A8A59E] leading-relaxed mb-8 max-w-lg mx-auto">
          Thank you, <strong className="text-white">{fullName}</strong>. Your <strong className="text-white">{brand} {model}</strong> has been saved securely to our private evaluation vault.
        </p>

        <div className="bg-[#14171A]/70 rounded-2xl p-6 text-left border border-white/[0.06] mb-8 space-y-3 text-xs text-[#A8A59E]">
          <div className="text-white font-medium uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#B79B6C]" />
            <span>Next Steps in Our Curation Process:</span>
          </div>
          <p>
            1. Our senior watchmaker in Windhoek reviews your specifications and photographs against international market indices.
          </p>
          <p>
            2. We will contact you via <strong>{preferredContactMethod}</strong> ({phone || email}) within 24–48 business hours with an appraisal and consignment proposal.
          </p>
          <p>
            3. In accordance with strict boutique security, <em>third-party submissions are never publicly visible without full physical verification and your signed approval.</em>
          </p>
        </div>

        <button
          onClick={() => {
            setSubmittedData(null);
            setCurrentStep(1);
            setPhotos([]);
            setPhotoPreviews([]);
          }}
          className="btn-gold"
        >
          Submit Another Timepiece
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-white/[0.08] z-0" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <div key={s.number} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  disabled={currentStep < s.number}
                  onClick={() => {
                    if (s.number < currentStep) setCurrentStep(s.number);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-[#B79B6C] text-[#08090B] ring-4 ring-[#B79B6C]/20 shadow-lg"
                      : isCompleted
                      ? "bg-[#14171A] text-emerald-400 border border-emerald-500/40"
                      : "bg-[#14171A] text-[#A8A59E] border border-white/[0.08]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </button>
                <span
                  className={`text-[10px] uppercase tracking-wider mt-2 hidden sm:block ${
                    isCurrent ? "text-white font-medium" : "text-[#A8A59E]/60"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Multi-Step Container Card */}
      <div className="luxury-glass rounded-3xl p-8 md:p-12 border border-white/[0.08] bg-[#0C0E11] shadow-2xl">
        {/* Step 1: Seller Contact */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] font-medium">
                Step 1 of 4
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl text-white font-normal uppercase mt-1">
                Seller Contact Information
              </h2>
              <p className="text-sm text-[#A8A59E] mt-1">
                Your private contact details are kept strictly confidential and are never shared publicly.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Willem Steenkamp"
                  className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@example.na"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+264 81 234 5678"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "WHATSAPP", label: "WhatsApp" },
                    { id: "EMAIL", label: "Email" },
                    { id: "PHONE", label: "Phone Call" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPreferredContactMethod(m.id as any)}
                      className={`py-3 px-4 rounded-xl border text-xs uppercase tracking-wider transition-all ${
                        preferredContactMethod === m.id
                          ? "bg-[#B79B6C] text-[#08090B] border-[#B79B6C] font-semibold"
                          : "bg-[#14171A] text-[#A8A59E] border-white/[0.08] hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="btn-gold"
              >
                <span>Continue: Timepiece Specs</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Watch Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] font-medium">
                Step 2 of 4
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl text-white font-normal uppercase mt-1">
                Timepiece Details & Valuation
              </h2>
              <p className="text-sm text-[#A8A59E] mt-1">
                Provide accurate manufacturer information and your desired asking price in Namibian Dollars (N$).
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                    Watch Brand / Manufacture *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Rolex, Omega, Cartier"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Submariner Date, Speedmaster"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. 126610LN"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                    Year of Production
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2022"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                    Condition Grade *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  >
                    {BRAND.conditions.map((c) => (
                      <option key={c} value={c} className="bg-[#14171A] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                  Desired Asking Price (NAD / N$) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-medium text-sm">
                    N$
                  </span>
                  <input
                    type="number"
                    required
                    value={requestedPrice}
                    onChange={(e) => setRequestedPrice(e.target.value)}
                    placeholder="e.g. 175000"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>
                <p className="text-[11px] text-[#A8A59E]/60 mt-1">
                  Specify the net payout or asking price you wish to achieve in Namibian Dollars.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail provenance, service history, wear frequency, dial variant, or bracelet links..."
                  className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                  Known Flaws, Scratches or Servicing History
                </label>
                <input
                  type="text"
                  value={defects}
                  onChange={(e) => setDefects(e.target.value)}
                  placeholder="e.g. Minor hairline on bezel, unpolished case"
                  className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                />
              </div>

              {/* Set Flags: Box, Papers, Proof */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.08] bg-[#14171A] cursor-pointer hover:border-[#B79B6C]/40">
                  <input
                    type="checkbox"
                    checked={box}
                    onChange={(e) => setBox(e.target.checked)}
                    className="accent-[#B79B6C]"
                  />
                  <span className="text-xs text-white">Original Box Included</span>
                </label>
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.08] bg-[#14171A] cursor-pointer hover:border-[#B79B6C]/40">
                  <input
                    type="checkbox"
                    checked={papers}
                    onChange={(e) => setPapers(e.target.checked)}
                    className="accent-[#B79B6C]"
                  />
                  <span className="text-xs text-white">Original Papers / Card</span>
                </label>
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.08] bg-[#14171A] cursor-pointer hover:border-[#B79B6C]/40">
                  <input
                    type="checkbox"
                    checked={proof}
                    onChange={(e) => setProof(e.target.checked)}
                    className="accent-[#B79B6C]"
                  />
                  <span className="text-xs text-white">Proof of Purchase Available</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-ghost-luxury"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="btn-gold"
              >
                <span>Continue: Photographs</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photographs Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] font-medium">
                Step 3 of 4
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl text-white font-normal uppercase mt-1">
                High-Resolution Photographs
              </h2>
              <p className="text-sm text-[#A8A59E] mt-1">
                Upload clear photographs of your watch in natural lighting. Suggested angles: Front dial, Case back, Crown / Flank, Clasp, and Box/Papers.
              </p>
            </div>

            {/* Upload Drop Zone */}
            <div className="border-2 border-dashed border-white/[0.15] hover:border-[#B79B6C]/60 rounded-2xl p-8 text-center transition-colors bg-[#14171A]/40">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-[#1E2227] text-[#B79B6C] flex items-center justify-center shadow-md">
                  <Camera size={26} />
                </div>
                <div className="font-editorial text-lg text-white">
                  Click to Choose Photographs
                </div>
                <div className="text-xs text-[#A8A59E]">
                  JPG, PNG, or WebP up to 8 MB each (Maximum 8 photos)
                </div>
              </label>
            </div>

            {/* Photo Preview Grid */}
            {photoPreviews.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-[#A8A59E]">
                  Selected Photos ({photoPreviews.length}/8):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {photoPreviews.map((previewUrl, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-white/[0.1] bg-[#14171A] aspect-square flex items-center justify-center group"
                    >
                      <img
                        src={previewUrl}
                        alt={`Watch upload ${idx + 1}`}
                        className="max-h-full max-w-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-rose-400 hover:bg-rose-950 transition-colors opacity-90 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-ghost-luxury"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep3()) setCurrentStep(4);
                }}
                className="btn-gold"
              >
                <span>Continue: Final Review</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Review & Legal Consent */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] font-medium">
                Step 4 of 4
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl text-white font-normal uppercase mt-1">
                Review & Confirm Submission
              </h2>
              <p className="text-sm text-[#A8A59E] mt-1">
                Verify your details before submitting to our private curation queue.
              </p>
            </div>

            {/* Submission Summary Box */}
            <div className="bg-[#14171A] rounded-2xl p-6 border border-white/[0.08] space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-[#A8A59E] block mb-1">Seller</span>
                  <span className="text-white font-medium">{fullName}</span>
                </div>
                <div>
                  <span className="text-[#A8A59E] block mb-1">Contact Method</span>
                  <span className="text-white font-medium">{preferredContactMethod} ({phone})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-[#A8A59E] block mb-1">Brand & Model</span>
                  <span className="text-white font-medium">{brand} {model}</span>
                </div>
                <div>
                  <span className="text-[#A8A59E] block mb-1">Reference / Year</span>
                  <span className="text-white font-medium">{referenceNumber || "—"} / {year || "—"}</span>
                </div>
                <div>
                  <span className="text-[#A8A59E] block mb-1">Condition</span>
                  <span className="text-white font-medium">{condition}</span>
                </div>
                <div>
                  <span className="text-[#A8A59E] block mb-1">Asking Price</span>
                  <span className="text-[#B79B6C] font-medium text-sm">
                    {formatNAD(Number(requestedPrice) * 100)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#A8A59E] block mb-1">Attached Photographs</span>
                <span className="text-white">{photos.length} image files prepared for secure transmission</span>
              </div>
            </div>

            {/* Required Legal Consent */}
            <div className="p-4 rounded-xl border border-white/[0.1] bg-[#14171A]/50 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 accent-[#B79B6C]"
                />
                <span className="text-xs leading-relaxed text-[#A8A59E]">
                  I solemnly confirm that I am the lawful owner of this timepiece with full legal entitlement to offer it for valuation and consignment. I accept the submission policy and understand that third-party watches undergo authentication before publication.
                </span>
              </label>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setCurrentStep(3)}
                className="btn-ghost-luxury"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold px-8 py-3.5 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Transmitting Watch Data...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Watch For Review</span>
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
