"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const roleRoutes: Record<string, string> = {
  citizen: "/citizen/dashboard",
  officer: "/officer/dashboard",
  supervisor: "/supervisor/dashboard",
  admin: "/admin/dashboard",
};

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Features", href: "/#features" },
    { label: "Help", href: "/help" },
  ];

  const isLoggedIn = !loading && !!userProfile;
  const dashboardHref = userProfile ? (roleRoutes[userProfile.role] || "/citizen/dashboard") : "/citizen/dashboard";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-xl border-b border-amber-200/60 shadow-md shadow-amber-100/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg group-hover:shadow-orange-400/30 transition-all">
              🌟
            </div>
            <div>
              <span className="font-bold text-[#2C2010] text-lg tracking-tight">Jan Spandan</span>
              <div className="text-[11px] font-devanagari text-[#6B5A3E] leading-none">जन स्पंदन</div>
              <div className="tricolor-bar h-0.5 w-full mt-0.5" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[#C8601A]"
                    : "text-[#6B5A3E] hover:text-[#2C2010]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons — context-aware */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href={dashboardHref}
                className="btn-primary text-sm py-2 px-5 flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.displayName?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                My Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#6B5A3E] hover:text-[#2C2010] hover:bg-amber-100/60"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-amber-200/50"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-[#6B5A3E] hover:text-[#2C2010] hover:bg-amber-50 text-base font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                {isLoggedIn ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary justify-center text-sm py-2.5"
                  >
                    Go to My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn-secondary justify-center text-sm py-2.5">Sign In</Link>
                    <Link href="/auth/signup" className="btn-primary justify-center text-sm py-2.5">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
