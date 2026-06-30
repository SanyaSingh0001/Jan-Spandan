"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { createIssue, addPointsToUser } from "@/lib/firestore";
import { IssueCategory } from "@/lib/firestore";
import { categoryLabels, categoryIcons } from "@/lib/utils";
import {
  Camera,
  MapPin,
  Loader2,
  Sparkles,
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const categories: { value: IssueCategory; label: string }[] = [
  { value: "pothole", label: "Pothole" },
  { value: "water_leakage", label: "Water Leakage" },
  { value: "streetlight", label: "Street Light" },
  { value: "waste", label: "Waste / Garbage" },
  { value: "drainage", label: "Drainage" },
  { value: "road_damage", label: "Road Damage" },
  { value: "park", label: "Park / Garden" },
  { value: "other", label: "Other" },
];

const severityColors = ["", "bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];
const severityLabels = ["", "Minor", "Low", "Medium", "High", "Critical"];

export default function ReportIssuePage() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("pothole");
  const [severity, setSeverity] = useState(3);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<null | {
    category: string;
    severity: number;
    department: string;
    estimatedResolution: string;
    summary: string;
    priorityReason: string;
  }>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: location, 3: media, 4: review
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (f) => f.size < 10 * 1024 * 1024 // 10MB limit
    );
    if (validFiles.length < files.length) {
      toast.error("Some files exceed 10MB limit");
    }
    setMediaFiles((prev) => [...prev, ...validFiles].slice(0, 5));
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews((prev) => [...prev, e.target?.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        // Reverse geocode using Google Maps Geocoding API
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.coords.latitude},${pos.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            setAddress(data.results[0].formatted_address);
          } else {
            setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
        } catch {
          setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setLocating(false);
        toast.success("Location detected!");
      },
      () => {
        toast.error("Could not detect location. Please enter manually.");
        setLocating(false);
      }
    );
  };

  const runAiCategorization = async () => {
    if (!description && !title) {
      toast.error("Please add a description first");
      return;
    }
    setAiLoading(true);
    try {
      let imageBase64: string | undefined;
      let mimeType = "image/jpeg";
      if (mediaPreviews.length > 0) {
        const parts = mediaPreviews[0].split(",");
        imageBase64 = parts[1];
        const match = parts[0].match(/data:([^;]+);/);
        if (match) mimeType = match[1];
        else if (mediaFiles[0]?.type) mimeType = mediaFiles[0].type;
      }
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `${title ? title + ". " : ""}${description || title}`,
          imageBase64,
          mimeType,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "AI analysis failed");
      }
      setAiResult(data);
      if (data.category && categories.find((c) => c.value === data.category)) {
        setCategory(data.category as IssueCategory);
      }
      if (data.severity) setSeverity(data.severity);
      toast.success("AI analysis complete!");
    } catch {
      toast.error("AI analysis failed. Please categorize manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "community-hero/issues");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleSubmit = async () => {
    if (!title || !description || !address) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!userProfile) {
      toast.error("Please login to report issues");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Force AI Categorization to run if it hasn't, or if we now have images to analyze
      let finalAiResult = aiResult;
      if (!finalAiResult || mediaPreviews.length > 0) {
        toast("Running AI Analysis on your report...", { icon: "🤖" });
        try {
          let imageBase64: string | undefined;
          let mimeType = "image/jpeg";
          if (mediaPreviews.length > 0) {
            const parts = mediaPreviews[0].split(",");
            imageBase64 = parts[1];
            const match = parts[0].match(/data:([^;]+);/);
            if (match) mimeType = match[1];
            else if (mediaFiles[0]?.type) mimeType = mediaFiles[0].type;
          }
          const res = await fetch("/api/ai/categorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: `${title ? title + ". " : ""}${description || title}`,
              imageBase64,
              mimeType,
            }),
          });
          const aiData = await res.json();
          if (!res.ok || (aiData as { error?: string }).error) {
            throw new Error((aiData as { error?: string }).error || "AI categorization failed");
          }
          finalAiResult = aiData;
          setAiResult(aiData);
          if (aiData.category) {
            setCategory(aiData.category as IssueCategory);
          }
          if (aiData.severity) setSeverity(aiData.severity);
        } catch (e) {
          console.error("AI Categorization failed during submit", e);
        }
      }

      // Upload media files
      const mediaUrls: string[] = [];
      for (const file of mediaFiles) {
        try {
          const url = await uploadMedia(file);
          mediaUrls.push(url);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // Create issue
      const issueId = await createIssue({
        title,
        description,
        category: (finalAiResult?.category as IssueCategory) || category,
        status: "open",
        severity: finalAiResult?.severity || severity,
        location: {
          lat: lat || 28.6139,
          lng: lng || 77.209,
          address,
        },
        mediaUrls,
        reportedBy: userProfile.uid,
        reporterName: userProfile.displayName,
        upvotes: [],
        comments: 0,
        aiCategory: finalAiResult?.category,
        aiSeverity: finalAiResult?.severity,
        aiDepartment: finalAiResult?.department,
        estimatedResolution: finalAiResult?.estimatedResolution,
      });

      // Award points
      await addPointsToUser(userProfile.uid, 10);
      toast.success("Issue reported! You earned +10 points 🎉");
      router.push(`/citizen/issue/${issueId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Location" },
    { num: 3, label: "Media" },
    { num: 4, label: "Review" },
  ];

  return (
    
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            Report Community Issue
          </h1>
          <p className="text-[#6B5A3E]">Help your community by reporting infrastructure problems</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`flex items-center gap-2 ${s.num <= step ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s.num < step ? "bg-green-500 text-white" :
                  s.num === step ? "bg-orange-500 text-white" :
                  "bg-white text-[#9C876A]"
                }`}>
                  {s.num < step ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-sm hidden sm:block ${s.num === step ? "text-orange-400 font-medium" : "text-[#9C876A]"}`}>
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${s.num < step ? "bg-green-500" : "bg-white"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="glass-card p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Issue Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Large pothole on MG Road near Metro Station"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Describe the issue in detail — size, danger level, how long it's been there..."
                  />
                </div>

                {/* AI Categorization Button */}
                <button
                  onClick={runAiCategorization}
                  disabled={aiLoading || (!title && !description)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600/10 border border-purple-600/30 text-purple-600 hover:bg-purple-600/20 transition-all disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? "Analyzing with Gemini AI..." : "🤖 Auto-categorize with AI"}
                </button>

                {/* AI Result */}
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#C8601A]/5 border border-[#C8601A]/20 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#C8601A]" />
                      <span className="text-[#C8601A] font-semibold text-sm">AI Analysis Complete</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-[#9C876A]">Category:</span> <span className="text-[#2C2010] font-medium">{categoryLabels[aiResult.category] || aiResult.category}</span></div>
                      <div><span className="text-[#9C876A]">Severity:</span> <span className="text-[#2C2010] font-medium">{severityLabels[aiResult.severity]}</span></div>
                      <div><span className="text-[#9C876A]">Department:</span> <span className="text-[#2C2010] font-medium">{aiResult.department}</span></div>
                      <div><span className="text-[#9C876A]">Est. Resolution:</span> <span className="text-[#1A6B1A] font-medium">{aiResult.estimatedResolution}</span></div>
                    </div>
                    <p className="text-[#6B5A3E] text-xs mt-2">{aiResult.priorityReason}</p>
                  </motion.div>
                )}

                {/* Manual Category */}
                <div>
                  <label className="block text-sm font-medium text-[#6B5A3E] mb-2">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          category === cat.value
                            ? "border-orange-500 bg-orange-500/10 text-orange-400"
                            : "border-amber-200/60 bg-[#FFFDF8] text-[#6B5A3E] hover:border-amber-300/80"
                        }`}
                      >
                        <div className="text-lg">{categoryIcons[cat.value]}</div>
                        <div className="text-xs mt-0.5 leading-tight">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-[#6B5A3E] mb-2">
                    Severity: <span className="text-[#2C2010]">{severityLabels[severity]}</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeverity(s)}
                        className={`flex-1 h-8 rounded-lg transition-all ${
                          severity >= s ? severityColors[s] : "bg-white"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-[#9C876A] mt-1">
                    <span>Minor</span>
                    <span>Critical</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!title || !description) { toast.error("Please fill title and description"); return; }
                  setStep(2);
                }}
                className="btn-primary w-full justify-center py-3"
              >
                Next: Add Location
              </button>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="glass-card p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Location Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#9C876A]" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="input-field pl-10 resize-none"
                      placeholder="Enter the full address of the issue location..."
                    />
                  </div>
                </div>

                <button
                  onClick={detectLocation}
                  disabled={locating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  {locating ? "Detecting location..." : "📍 Auto-detect my location"}
                </button>

                {lat && lng && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-400 font-medium text-sm">Location Detected</p>
                      <p className="text-[#6B5A3E] text-xs mt-0.5">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
                    </div>
                  </div>
                )}

                {!lat && !lng && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-300 text-sm">
                      GPS coordinates help officers find the exact location. Please detect location or they&apos;ll use the address only.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3">Back</button>
                <button
                  onClick={() => {
                    if (!address) { toast.error("Please enter an address"); return; }
                    setStep(3);
                  }}
                  className="btn-primary flex-1 justify-center py-3"
                >
                  Next: Add Photos
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Media */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="glass-card p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">
                    Photos / Videos <span className="text-[#9C876A]">(optional, up to 5 files, 10MB each)</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/40 hover:bg-orange-500/5 transition-all"
                  >
                    <Camera className="w-10 h-10 text-[#9C876A] mx-auto mb-3" />
                    <p className="text-[#6B5A3E] mb-1">Click to upload photos or videos</p>
                    <p className="text-[#9C876A] text-xs">Supports: JPG, PNG, MP4, MOV</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {mediaPreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-[#F5EEDC]">
                          {mediaFiles[i]?.type.startsWith("video/") ? (
                            <video src={preview} className="w-full h-full object-cover" />
                          ) : (
                            <img src={preview} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center py-3">Back</button>
                <button onClick={() => setStep(4)} className="btn-primary flex-1 justify-center py-3">
                  Next: Review
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Review Your Report</h3>

                <div className="space-y-3">
                  <div className="flex gap-4 p-3 bg-[#FFFDF8] rounded-xl">
                    <span className="text-3xl">{categoryIcons[category]}</span>
                    <div>
                      <div className="font-semibold">{title}</div>
                      <div className="text-[#6B5A3E] text-sm mt-1">{description}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-[#FFFDF8] rounded-xl">
                      <div className="text-[#9C876A] text-xs mb-1">Category</div>
                      <div className="font-medium">{categoryLabels[category]}</div>
                    </div>
                    <div className="p-3 bg-[#FFFDF8] rounded-xl">
                      <div className="text-[#9C876A] text-xs mb-1">Severity</div>
                      <div className="font-medium">{severityLabels[severity]}</div>
                    </div>
                    <div className="p-3 bg-[#FFFDF8] rounded-xl col-span-2">
                      <div className="text-[#9C876A] text-xs mb-1">Location</div>
                      <div className="font-medium">📍 {address}</div>
                    </div>
                  </div>

                  {mediaPreviews.length > 0 && (
                    <div>
                      <div className="text-[#9C876A] text-xs mb-2">{mediaPreviews.length} file(s) attached</div>
                      <div className="flex gap-2">
                        {mediaPreviews.slice(0, 3).map((p, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-[#F5EEDC]">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResult && (
                    <div className="bg-purple-600/10 border border-purple-600/30 rounded-xl p-3">
                      <p className="text-purple-600 text-xs font-semibold mb-1">🤖 AI Dept: {aiResult.department}</p>
                      <p className="text-[#6B5A3E] text-xs">Est. Resolution: {aiResult.estimatedResolution}</p>
                    </div>
                  )}

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-orange-400">🎯</span>
                    <p className="text-orange-300 text-sm">You&apos;ll earn <strong>+10 points</strong> for reporting this issue!</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-secondary flex-1 justify-center py-3">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 justify-center py-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    
  );
}
