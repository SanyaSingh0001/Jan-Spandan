"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Camera, Loader2, CheckCircle, MapPin, Shield, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function OfficerProfilePage() {
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
    // Reset the input so it can be used again even for same file
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

  return (
    
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" /> Officer Profile
          </h1>
          <p className="text-[#6B5A3E] mt-1 text-sm font-devanagari">अधिकारी प्रोफ़ाइल</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 relative overflow-hidden border-blue-500/20"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-blue-500/30 shadow-xl shadow-blue-500/10">
                  {photoURL ? (
                    <img src={photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl font-bold text-[#2C2010]">
                      {userProfile?.displayName?.[0]?.toUpperCase() || "O"}
                    </div>
                  )}
                </div>
                {/* Upload button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  title="Change photo"
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:bg-blue-400 transition-colors border-2 border-gray-950"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                {/* Remove button */}
                {photoURL && !uploading && (
                  <button
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors border-2 border-gray-950"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              <div className="text-center sm:text-left flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#6B5A3E] mb-1">Full Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="input-field text-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B5A3E] mb-1">Assigned Ward / Department <span className="text-[#9C876A]">(optional)</span></label>
                      <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        placeholder="e.g., Ward 42 - PWD"
                        className="input-field"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 text-sm bg-gradient-to-r from-blue-500 to-indigo-600">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Save</>}
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-secondary py-2 px-4 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{userProfile?.displayName || "Field Officer"}</h2>
                    <p className="text-[#6B5A3E] text-sm mt-1">{userProfile?.email}</p>
                    {userProfile?.ward && (
                      <p className="text-[#9C876A] text-sm flex items-center gap-1 mt-1 justify-center sm:justify-start">
                        <MapPin className="w-3 h-3" /> {userProfile.ward}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                      <span className="role-pill role-pill-officer">Field Officer · अधिकारी</span>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <div className="glass-card p-6 border-amber-200/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6B5A3E]" /> Account Security
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-amber-200/60">
              <span className="text-[#6B5A3E]">Email</span>
              <span className="font-medium">{userProfile?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-amber-200/60">
              <span className="text-[#6B5A3E]">Role Verification</span>
              <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" /> Admin Approved</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B5A3E]">Assigned Ward</span>
              <span>{userProfile?.ward || <span className="text-[#9C876A]">Not assigned</span>}</span>
            </div>
          </div>
        </div>
      </div>
    
  );
}
