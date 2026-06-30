"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Map,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Users,
  BarChart3,
  Shield,
  Bell,
  ChevronRight,
  Settings,
  Home,
  Zap,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const citizenLinks = [
  { icon: LayoutDashboard, label: "Dashboard", hindiLabel: "होम", href: "/citizen/dashboard" },
  { icon: PlusCircle, label: "Report Issue", hindiLabel: "रिपोर्ट", href: "/citizen/report" },
  { icon: FileText, label: "My Reports", hindiLabel: "मेरी रिपोर्ट", href: "/citizen/my-reports" },
  { icon: Map, label: "Community Map", hindiLabel: "मानचित्र", href: "/citizen/map" },
  { icon: Trophy, label: "Leaderboard", hindiLabel: "लीडरबोर्ड", href: "/citizen/leaderboard" },
  { icon: User, label: "Profile", hindiLabel: "प्रोफ़ाइल", href: "/citizen/profile" },
];

const officerLinks = [
  { icon: LayoutDashboard, label: "Dashboard", hindiLabel: "होम", href: "/officer/dashboard" },
  { icon: ClipboardList, label: "Assigned Issues", hindiLabel: "कार्य", href: "/officer/assigned" },
  { icon: Map, label: "Area Map", hindiLabel: "क्षेत्र", href: "/officer/map" },
  { icon: User, label: "Profile", hindiLabel: "प्रोफ़ाइल", href: "/officer/profile" },
];

const supervisorLinks = [
  { icon: LayoutDashboard, label: "Dashboard", hindiLabel: "होम", href: "/supervisor/dashboard" },
  { icon: ClipboardList, label: "Issues", hindiLabel: "समस्याएं", href: "/supervisor/issues" },
  { icon: Users, label: "Officers", hindiLabel: "अधिकारी", href: "/supervisor/officers" },
  { icon: BarChart3, label: "Analytics", hindiLabel: "विश्लेषण", href: "/supervisor/analytics" },
  { icon: TrendingUp, label: "Officer Stats", hindiLabel: "अधिकारी आँकड़े", href: "/supervisor/officer-analytics" },
  { icon: Map, label: "Area Map", hindiLabel: "मानचित्र", href: "/supervisor/map" },
  { icon: User, label: "Profile", hindiLabel: "प्रोफ़ाइल", href: "/supervisor/profile" },
];

const adminLinks = [
  { icon: LayoutDashboard, label: "Dashboard", hindiLabel: "होम", href: "/admin/dashboard" },
  { icon: Users, label: "User Management", hindiLabel: "उपयोगकर्ता", href: "/admin/users" },
  { icon: Shield, label: "All Issues", hindiLabel: "सभी समस्याएं", href: "/admin/issues" },
  { icon: BarChart3, label: "Analytics", hindiLabel: "विश्लेषण", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", hindiLabel: "सेटिंग", href: "/admin/settings" },
];

const roleLinks: Record<string, typeof citizenLinks> = {
  citizen: citizenLinks,
  officer: officerLinks,
  supervisor: supervisorLinks,
  admin: adminLinks,
};

const roleConfig: Record<string, { color: string; bg: string; label: string; hindiLabel: string; emoji: string }> = {
  citizen: { color: "from-orange-600 to-amber-500", bg: "bg-orange-50", label: "Citizen", hindiLabel: "नागरिक", emoji: "👤" },
  officer: { color: "from-blue-700 to-blue-500", bg: "bg-blue-50", label: "Field Officer", hindiLabel: "अधिकारी", emoji: "👷" },
  supervisor: { color: "from-purple-700 to-violet-500", bg: "bg-purple-50", label: "Supervisor", hindiLabel: "पर्यवेक्षक", emoji: "📊" },
  admin: { color: "from-red-700 to-rose-500", bg: "bg-red-50", label: "Administrator", hindiLabel: "व्यवस्थापक", emoji: "🛡️" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, logout, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = userProfile?.role || "citizen";
  const links = roleLinks[role] || citizenLinks;
  const config = roleConfig[role] || roleConfig.citizen;

  // Only block on initial auth check — not on every layout remount when user is known
  if (loading && !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#F8F4EC" }}>
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-orange-500/20 border-t-orange-600 rounded-full mx-auto mb-4" />
          <div className="font-devanagari text-[#C8601A] text-sm font-semibold">जन स्पंदन</div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await logout();
      toast.success("Logged out. See you soon! 👋");
    } catch {
      toast.error("Logout failed");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo Area */}
      <div className="p-5 border-b border-amber-200/40 flex-shrink-0" style={{ background: "linear-gradient(135deg, #FFF9EE, #F8F4EC)" }}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
            🌟
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-[#2C2010] leading-tight">Jan Spandan</div>
            <div className="text-[10px] font-devanagari text-[#C8601A] leading-tight">जन स्पंदन</div>
            <div className="tricolor-bar mt-1 w-full" />
          </div>
        </Link>
      </div>

      {/* User Info Card */}
      <div className="px-4 py-4 border-b border-amber-200/30 flex-shrink-0">
        <div className={`p-3 rounded-xl ${config.bg} border border-amber-200/40`}>
          <div className="flex items-center gap-3">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt=""
                className={`w-10 h-10 rounded-full ring-2 ring-orange-400/30 object-cover flex-shrink-0`}
              />
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
                {userProfile?.displayName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#2C2010] truncate">
                {userProfile?.displayName || "User"}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs">{config.emoji}</span>
                <span className="text-xs text-[#6B5A3E]">{config.label}</span>
                <span className="text-[#9C876A] text-xs">·</span>
                <span className="text-xs text-[#9C876A] font-devanagari">{config.hindiLabel}</span>
              </div>
            </div>
            {role === "citizen" && (
              <div className="text-right flex-shrink-0">
                <div className="text-[#C8601A] font-bold text-sm">{(userProfile?.points || 0).toLocaleString("en-IN")}</div>
                <div className="text-[#9C876A] text-xs">pts</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[#9C876A] text-xs font-semibold uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
          <div className="flex-1 h-px bg-amber-200/40" />
          <span>Navigation</span>
          <div className="flex-1 h-px bg-amber-200/40" />
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn("sidebar-link group", isActive && "active")}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{link.label}</div>
                {link.hindiLabel && (
                  <div className="text-xs opacity-50 font-devanagari leading-none truncate">{link.hindiLabel}</div>
                )}
              </div>
              {isActive && <ChevronRight className="w-3 h-3 opacity-40 flex-shrink-0" />}
            </Link>
          );
        })}

        {/* Quick link to home */}
        <div className="pt-3 border-t border-amber-200/30 mt-3">
          <Link href="/" className="sidebar-link text-[#9C876A] hover:text-[#6B5A3E]">
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Logout — Prominent Bottom Section */}
      <div className="p-4 border-t border-amber-200/30 flex-shrink-0 space-y-2">
        <button
          id="logout-button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-300/50 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400/60 transition-all font-medium text-sm group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <div className="flex-1 text-left">
            <div>Sign Out</div>
            <div className="text-xs text-red-500/70 font-devanagari">लॉग आउट</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-red-400/60 group-hover:bg-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F5EEDC" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 shadow-lg" style={{ background: "#FFFDF8", borderRight: "1px solid rgba(200,160,80,0.22)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-[#2C2010]/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden flex flex-col shadow-2xl"
              style={{ background: "#FFFDF8", borderRight: "1px solid rgba(200,160,80,0.25)" }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-[#6B5A3E] hover:text-[#2C2010] hover:bg-amber-100/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="backdrop-blur-xl px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0 shadow-sm" style={{ background: "rgba(255,253,248,0.95)", borderBottom: "1px solid rgba(200,160,80,0.2)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-[#6B5A3E] hover:text-[#2C2010] hover:bg-amber-100/60 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb / Title */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-[#9C876A]">
            <span>🇮🇳</span>
            <span>Jan Spandan</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#2C2010] font-medium">
              {links.find((l) => pathname === l.href || pathname.startsWith(l.href + "/"))?.label || "Dashboard"}
            </span>
          </div>

          <div className="flex-1" />

          {/* AI Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs">
            <Zap className="w-3 h-3" />
            <span>Gemini AI</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-[#6B5A3E] hover:text-[#2C2010] hover:bg-amber-100/60 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C8601A] rounded-full animate-pulse" />
          </button>

          {/* Profile Avatar + Logout (Mobile) */}
          <div className="flex items-center gap-2">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-400/30" />
            ) : (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                {userProfile?.displayName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            {/* Mobile logout shortcut */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
