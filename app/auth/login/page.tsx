"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleRoleModal } from "@/components/auth/GoogleRoleModal";
import toast from "react-hot-toast";

const roleRoutes: Record<string, string> = {
  citizen: "/citizen/dashboard",
  officer: "/officer/dashboard",
  supervisor: "/supervisor/dashboard",
  admin: "/admin/dashboard",
};

function LoginContent() {
  const { login, loginWithGoogle, userProfile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleRoleLoading, setGoogleRoleLoading] = useState(false);

  // We need to access pendingGoogleUser and completeGoogleSignup
  const { pendingGoogleUser, completeGoogleSignup } = useAuth();

  useEffect(() => {
    if (!loading && userProfile) {
      const dest = redirect || roleRoutes[userProfile.role] || "/citizen/dashboard";
      router.replace(dest);
    }
  }, [userProfile, loading, router, redirect]);

  const setSessionCookie = async (role: string) => {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      // Session cookie set after userProfile loads via useEffect
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg.includes("invalid") ? "Invalid email or password" : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (!result.isNew) {
        toast.success("Welcome back!");
        // session cookie will be set when userProfile updates in useEffect
      }
    } catch (err: unknown) {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRoleSelect = async (selectedRole: string) => {
    setGoogleRoleLoading(true);
    try {
      // @ts-ignore
      await completeGoogleSignup(selectedRole);
      await setSessionCookie(selectedRole);
      toast.success("Welcome to Jan Spandan! 🎉");
      if (selectedRole !== "citizen") {
        toast("Your account is pending admin approval", { icon: "⏳" });
      }
      router.replace(roleRoutes[selectedRole] || "/citizen/dashboard");
    } catch {
      toast.error("Failed to complete signup. Please try again.");
    } finally {
      setGoogleRoleLoading(false);
    }
  };

  // Set session cookie when userProfile is set after login
  useEffect(() => {
    if (userProfile) {
      setSessionCookie(userProfile.role).then(() => {
        const dest = redirect || roleRoutes[userProfile.role] || "/citizen/dashboard";
        router.replace(dest);
      });
    }
  }, [userProfile]);

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #FFFDF8 0%, #F8F4EC 50%, #F5EEDC 100%)" }}>
      <AnimatePresence>
        {pendingGoogleUser && (
          <GoogleRoleModal
            onSelect={handleGoogleRoleSelect}
            isLoading={googleRoleLoading}
            displayName={pendingGoogleUser.displayName}
          />
        )}
      </AnimatePresence>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF8] via-[#F8F4EC] to-[#F5EEDC] z-0" />
        <div className="absolute inset-0 opacity-[0.04] mandala-bg z-0" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-md">
            🌟
          </div>
          <div>
            <span className="text-xl font-bold text-[#2C2010]">Jan Spandan</span>
            <div className="text-xs font-devanagari text-[#C8601A]">जन स्पंदन</div>
            <div className="tricolor-bar h-0.5 w-full" />
          </div>
        </Link>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="tricolor-bar w-16 mb-6" />
            <div className="text-2xl font-devanagari font-bold text-[#C8601A] mb-2">हर आवाज़ मायने रखती है</div>
            <h1 className="text-4xl font-bold leading-tight text-[#2C2010]">
              Making India&apos;s<br />
              <span className="gradient-text">communities better,</span><br />
              one report at a time
            </h1>
            <p className="text-[#6B5A3E] mt-4 text-lg">
              Join thousands of active citizens who are transforming their neighbourhoods.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "12,000+", label: "Issues Reported" },
              { value: "8,500+", label: "Issues Resolved" },
              { value: "50+", label: "Cities Active" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-[#6B5A3E] text-xs mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {["🕳️ Potholes", "💧 Water", "💡 Lights", "🗑️ Waste"].map((item) => (
              <span key={item} className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">{item}</span>
            ))}
          </div>
        </div>

        <p className="text-[#9C876A] text-sm relative z-10">
          © 2025 Jan Spandan · Built for India 🇮🇳
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-md">🌟</div>
            <div>
              <span className="text-xl font-bold text-[#2C2010]">Jan Spandan</span>
              <div className="text-xs font-devanagari text-[#C8601A]">जन स्पंदन</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-[#2C2010]">Welcome back 👋</h2>
            <p className="text-[#6B5A3E]">Sign in to your Jan Spandan account</p>
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full btn-secondary justify-center mb-6 py-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-amber-200/60" />
            <span className="text-[#9C876A] text-sm">or with email</span>
            <div className="flex-1 h-px bg-amber-200/60" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C876A] hover:text-[#6B5A3E]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary justify-center py-3 text-base mt-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[#6B5A3E] mt-6 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[#C8601A] hover:text-[#A84E12] font-medium">
              Sign up free
            </Link>
          </p>

          <p className="text-center text-[#9C876A] mt-3 text-xs">
            <Link href="/" className="hover:text-[#6B5A3E]">← Back to Home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#C8601A]" style={{ background: "#F8F4EC" }}><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
