"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getBadgesForPoints, BADGE_THRESHOLDS } from "@/lib/utils";
import { User, Camera, Loader2, CheckCircle, Star, Edit2, MapPin, Award, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function CitizenProfilePage() {
  const { userProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [ward, setWard] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setWard(userProfile.ward || "");
      setPhotoURL(userProfile.photoURL || null);
    }
  }, [userProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so same file can be re-selected after delete
    if (fileRef.current) fileRef.current.value = "";
    if (!file || !userProfile) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "community-hero/avatars");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await updateDoc(doc(db, "users", userProfile.uid), { photoURL: data.url });
      setPhotoURL(data.url);
      toast.success("Profile photo updated! 📸");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!userProfile || !photoURL) return;
    setUploading(true);
    try {
      await updateDoc(doc(db, "users", userProfile.uid), { photoURL: "" });
      setPhotoURL(null);
      // Reset input so it can fire onChange again immediately after deletion
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        displayName: displayName.trim(),
        ward: ward.trim(),
      });
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const badges = getBadgesForPoints(userProfile?.points || 0);
  const points = userProfile?.points || 0;
  const nextBadge = BADGE_THRESHOLDS.find((b) => b.minPoints > points);
  const progressPct = nextBadge
    ? Math.min((points / nextBadge.minPoints) * 100, 100)
    : 100;

  return (
    
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-orange-400" /> My Profile
          </h1>
          <p className="text-[#6B5A3E] mt-1 text-sm font-devanagari">मेरी प्रोफ़ाइल</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-orange-500/30 shadow-xl shadow-orange-500/10">
                  {photoURL ? (
                    <img src={photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-5xl font-bold text-[#2C2010]">
                      {userProfile?.displayName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center shadow-lg hover:bg-orange-400 transition-colors border-2 border-gray-950"
                  title="Change photo"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                {/* Remove photo button */}
                {photoURL && !uploading && (
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors border-2 border-gray-950"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>

              <div className="text-center sm:text-left flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#6B5A3E] mb-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="input-field text-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B5A3E] mb-1">Ward / Area <span className="text-[#9C876A]">(optional)</span></label>
                      <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        placeholder="e.g., Ward 42, Koramangala"
                        className="input-field"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 text-sm">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Save</>}
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-secondary py-2 px-4 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{userProfile?.displayName || "Citizen"}</h2>
                    <p className="text-[#6B5A3E] text-sm mt-1">{userProfile?.email}</p>
                    {userProfile?.ward && (
                      <p className="text-[#9C876A] text-sm flex items-center gap-1 mt-1 justify-center sm:justify-start">
                        <MapPin className="w-3 h-3" /> {userProfile.ward}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                      <span className="role-pill role-pill-citizen">Citizen · नागरिक</span>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-3 flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Points", value: points.toLocaleString("en-IN"), icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { label: "Badges Earned", value: badges.length, icon: Award, color: "text-orange-400", bg: "bg-orange-500/10" },
                { label: "Rank", value: badges.length > 0 ? badges[badges.length - 1].name : "New", icon: User, color: "text-purple-600", bg: "bg-purple-600/10" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`p-4 rounded-xl ${stat.bg} border border-amber-200/60 text-center`}>
                    <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                    <div className="font-bold text-lg">{stat.value}</div>
                    <div className="text-[#9C876A] text-xs">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Progress to Next Badge */}
            {nextBadge && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-[#6B5A3E] mb-2">
                  <span>Progress to <strong className="text-white">{nextBadge.icon} {nextBadge.name}</strong></span>
                  <span>{points} / {nextBadge.minPoints} pts</span>
                </div>
                <div className="w-full bg-[#FFFDF8] rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-2.5 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Badges Grid */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-400" /> Your Badges
              </h3>
              {badges.length === 0 ? (
                <div className="text-center py-6 bg-white/3 rounded-xl border border-amber-200/60">
                  <div className="text-4xl mb-2">🌱</div>
                  <p className="text-[#6B5A3E] text-sm">Report your first issue to earn badges!</p>
                  <p className="text-[#9C876A] text-xs mt-1">+10 points per report</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BADGE_THRESHOLDS.map((badge) => {
                    const earned = points >= badge.minPoints;
                    return (
                      <div
                        key={badge.name}
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          earned
                            ? "bg-yellow-500/10 border-yellow-500/20"
                            : "bg-white/3 border-amber-200/60 opacity-40 grayscale"
                        }`}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <div className="text-xs font-semibold">{badge.name}</div>
                          <div className="text-xs text-[#9C876A]">{badge.minPoints}+ pts</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-amber-200/60">
              <span className="text-[#6B5A3E]">Email</span>
              <span className="font-medium">{userProfile?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-amber-200/60">
              <span className="text-[#6B5A3E]">Role</span>
              <span className="role-pill role-pill-citizen">Citizen</span>
            </div>
            <div className="flex justify-between py-2 border-b border-amber-200/60">
              <span className="text-[#6B5A3E]">Account Status</span>
              <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B5A3E]">Ward / Area</span>
              <span>{userProfile?.ward || <span className="text-[#9C876A]">Not set</span>}</span>
            </div>
          </div>
        </div>
      </div>
    
  );
}
