"use client";

import { useState } from "react";
import { useAuth, UserRole } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const roleRoutes: Record<string, string> = {
  citizen: "/citizen/dashboard",
  officer: "/officer/dashboard",
  supervisor: "/supervisor/dashboard",
  admin: "/admin/dashboard",
};

const roles = [
  {
    value: "citizen",
    label: "Citizen",
    hindiLabel: "नागरिक",
    icon: "👤",
    desc: "Report and track community issues",
  },
  {
    value: "officer",
    label: "Field Officer",
    hindiLabel: "क्षेत्र अधिकारी",
    icon: "👷",
    desc: "Handle assigned issues on ground",
  },
  {
    value: "supervisor",
    label: "Supervisor",
    hindiLabel: "पर्यवेक्षक",
    icon: "📊",
    desc: "Oversee officers and analytics",
  },
];

import { GoogleRoleModal } from "@/components/auth/GoogleRoleModal";

export default function SignupPage() {
  const { signup, loginWithGoogle, completeGoogleSignup, pendingGoogleUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleRoleLoading, setGoogleRoleLoading] = useState(false);

  const setSessionCookie = async (userRole: string) => {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: userRole }),
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await signup(email, password, name, role);
      await setSessionCookie(role);
      toast.success("Account created! Welcome to Jan Spandan 🎉");
      if (role !== "citizen") {
        toast("Your account is pending admin approval", { icon: "⏳" });
      }
      router.replace(roleRoutes[role]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      toast.error(msg.includes("email-already-in-use") ? "Email already in use" : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (!result.isNew) {
        // Existing user — just redirect
        toast.success("Welcome back! 🎉");
        // profile will be set, useEffect in auth-context will handle routing
        // We need to get role from the context
        await setSessionCookie("citizen"); // will be updated once userProfile loads
        router.replace("/citizen/dashboard");
      }
      // If new user, the modal will show via pendingGoogleUser
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRoleSelect = async (selectedRole: UserRole) => {
    setGoogleRoleLoading(true);
    try {
      await completeGoogleSignup(selectedRole);
      await setSessionCookie(selectedRole);
      toast.success("Welcome to Jan Spandan! 🎉");
      if (selectedRole !== "citizen") {
        toast("Your account is pending admin approval", { icon: "⏳" });
      }
      router.replace(roleRoutes[selectedRole]);
    } catch {
      toast.error("Failed to complete signup. Please try again.");
    } finally {
      setGoogleRoleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #FFFDF8 0%, #F8F4EC 50%, #F5EEDC 100%)" }}>
      {/* Google Role Modal */}
      <AnimatePresence>
        {pendingGoogleUser && (
          <GoogleRoleModal
            onSelect={handleGoogleRoleSelect}
            isLoading={googleRoleLoading}
            displayName={pendingGoogleUser.displayName}
          />
        )}
      </AnimatePresence>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF8] via-[#F8F4EC] to-[#F5EEDC] z-0" />

        {/* Mandala pattern */}
        <div className="absolute inset-0 opacity-[0.04] mandala-bg" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-md">
            🌟
          </div>
          <div>
            <span className="text-xl font-bold text-[#2C2010]">Jan Spandan</span>
            <div className="text-xs font-devanagari text-[#C8601A] leading-tight">जन स्पंदन</div>
            <div className="tricolor-bar h-0.5 w-full mt-0.5" />
          </div>
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="tricolor-bar w-16 mb-2" />
          <div className="text-3xl font-devanagari font-bold text-[#C8601A]">
            जन सेवा, जन शक्ति
          </div>
          <h1 className="text-3xl font-bold leading-tight text-[#2C2010]">
            People&apos;s Service,<br />
            People&apos;s Power
          </h1>
          <p className="text-[#6B5A3E] text-lg">
            Every issue reported brings us closer to a cleaner, safer, and more vibrant India.
          </p>

          <div className="space-y-3">
            {[
              { icon: "🗺️", text: "Geo-tag issues with precise location" },
              { icon: "🤖", text: "AI-powered categorization & priority" },
              { icon: "📡", text: "Real-time tracking & updates" },
              { icon: "🏆", text: "Earn badges & climb the leaderboard" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-[#6B5A3E]">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#9C876A] text-sm relative z-10">© 2025 Jan Spandan · Built for India 🇮🇳</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-md">🌟</div>
            <div>
              <span className="text-xl font-bold text-[#2C2010]">Jan Spandan</span>
              <div className="text-xs font-devanagari text-[#C8601A]">जन स्पंदन</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 text-[#2C2010]">Join the movement ✊</h2>
            <p className="text-[#6B5A3E]">Create your free Jan Spandan account</p>
          </div>

          {/* Google Signup */}
          <button onClick={handleGoogleSignup} disabled={submitting} className="w-full btn-secondary justify-center mb-5 py-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-amber-200/60" />
            <span className="text-[#9C876A] text-sm">or with email</span>
            <div className="flex-1 h-px bg-amber-200/60" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-[#6B5A3E] mb-2">I am a... <span className="text-[#9C876A] text-xs">(मैं हूँ...)</span></label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value as UserRole)}
                    className={`p-3 rounded-lg border text-center transition-all ${role === r.value
                        ? "border-[#C8601A] bg-orange-50 text-[#C8601A]"
                        : "border-amber-200/60 bg-white/70 text-[#6B5A3E] hover:border-amber-300"
                      }`}
                  >
                    <div className="text-2xl">{r.icon}</div>
                    <div className="text-xs font-medium mt-1">{r.label}</div>
                  </button>
                ))}
              </div>
              {role !== "citizen" && (
                <p className="text-amber-700/80 text-xs mt-2 flex items-center gap-1 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200/60">
                  ⚠️ Officer/Supervisor accounts require admin approval
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" placeholder="Rahul Sharma" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C876A] hover:text-[#6B5A3E]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pl-10" placeholder="Re-enter password" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full btn-primary justify-center py-3 text-base mt-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-[#6B5A3E] mt-5 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#C8601A] hover:text-[#A84E12] font-medium">Sign in</Link>
          </p>
          <p className="text-center text-[#9C876A] mt-2 text-xs">
            <Link href="/" className="hover:text-[#6B5A3E]">← Back to Home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
