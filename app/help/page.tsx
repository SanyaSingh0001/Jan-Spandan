"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { ChevronDown, Phone, Mail, MessageCircle, ArrowRight, Search } from "lucide-react";

const categories = [
  { id: "getting-started", label: "Getting Started", hindiLabel: "शुरुआत", emoji: "🚀" },
  { id: "reporting", label: "Reporting Issues", hindiLabel: "रिपोर्टिंग", emoji: "🚨" },
  { id: "tracking", label: "Tracking & Status", hindiLabel: "स्थिति", emoji: "📍" },
  { id: "points", label: "Points & Badges", hindiLabel: "पॉइंट्स", emoji: "🏆" },
  { id: "account", label: "Account & Login", hindiLabel: "अकाउंट", emoji: "👤" },
  { id: "technical", label: "Technical Issues", hindiLabel: "तकनीकी", emoji: "🔧" },
];

const faqs = [
  {
    category: "getting-started",
    question: "What is Community Hero?",
    answer: "Jan Spandan is a hyperlocal issue reporting platform built for Indian citizens. You can report infrastructure problems like potholes, water leakages, broken street lights, and garbage accumulation. The platform uses AI to categorize your reports and route them to the right municipal department, while keeping you updated in real-time."
  },
  {
    category: "getting-started",
    question: "Who can use Community Hero?",
    answer: "Anyone! Citizens can sign up for free to report and track issues. Field Officers use the platform to manage and resolve assigned issues. Supervisors oversee their area's performance and use AI-powered analytics. All roles are supported with role-specific dashboards."
  },
  {
    category: "getting-started",
    question: "Is Jan Spandan available in my city?",
    answer: "Jan Spandan works across India! We currently have active citizens in 52+ cities. Even if your city isn't listed, you can sign up and start reporting — your reports will help us establish the community in your area."
  },
  {
    category: "reporting",
    question: "How do I report an issue?",
    answer: "1. Sign in and go to 'Report Issue'\n2. Add a title and description of the problem\n3. Click 'Auto-categorize with AI' to let Gemini AI classify it automatically\n4. Add the location (auto-detect or type the address)\n5. Optionally attach photos or videos as evidence\n6. Review and submit — you'll earn 10 points!"
  },
  {
    category: "reporting",
    question: "Can I report issues anonymously?",
    answer: "No, you need a Jan Spandan account to report issues. This helps ensure accountability, allows officers to contact reporters if needed, and lets you earn points for your contributions. Sign up is free and takes 30 seconds!"
  },
  {
    category: "reporting",
    question: "What types of issues can I report?",
    answer: "You can report: Potholes & Road Damage, Water Leakage, Broken Street Lights, Waste & Garbage, Drainage Problems, Park & Garden Issues, and more under the 'Other' category."
  },
  {
    category: "reporting",
    question: "How does AI categorization work?",
    answer: "We use Google Gemini 2.0 Flash AI. When you describe your issue (and optionally attach a photo), Gemini analyzes it and suggests: the correct category, severity level (1-5), the responsible department, and estimated resolution time. You can accept the AI suggestion or manually override it."
  },
  {
    category: "tracking",
    question: "How can I track my reported issues?",
    answer: "Go to 'My Reports' to see all your issues with their current status. Click any issue for the full progress timeline showing: Reported → AI Verified → Officer Assigned → In Progress → Resolved."
  },
  {
    category: "tracking",
    question: "What do the status labels mean?",
    answer: "• Open: Issue received, awaiting assignment\n• In Progress: A field officer is actively working on it\n• Resolved: Issue has been fixed (with resolution note)\n• Closed: Issue closed (may be duplicate or out of scope)"
  },
  {
    category: "points",
    question: "How do I earn points?",
    answer: "• +10 points for reporting an issue\n• +2 points for upvoting/verifying another citizen's report\n• Points accumulate to unlock badges from First Reporter (10 pts) to City Champion (1000 pts)!"
  },
  {
    category: "points",
    question: "What are badges?",
    answer: "Badges are recognition for your civic contributions:\n🌱 First Reporter (10 pts)\n📢 Community Voice (50 pts)\n⭐ Active Citizen (100 pts)\n🏅 Change Maker (250 pts)\n🌟 Jan Spandan Hero (500 pts)\n🏆 City Champion (1000 pts)"
  },
  {
    category: "account",
    question: "Can I sign in with Google?",
    answer: "Yes! Click 'Continue with Google' on the signup or login page. If you're a new user, you'll be asked to select your role (Citizen, Field Officer, or Supervisor) before proceeding."
  },
  {
    category: "account",
    question: "I'm a Field Officer / Supervisor — why can't I access my dashboard?",
    answer: "Officer and Supervisor accounts require admin approval before access is granted. After signing up, an admin will review and approve your account. You'll receive access once approved. Citizens are approved instantly."
  },
  {
    category: "technical",
    question: "The map isn't loading — what should I do?",
    answer: "Make sure you've allowed location access in your browser settings. If the map still doesn't load, try refreshing the page or using a different browser (Chrome recommended). The map uses Google Maps API."
  },
  {
    category: "technical",
    question: "Photo upload isn't working",
    answer: "Photos are uploaded via Cloudinary. Make sure your file is under 10MB and is in JPG, PNG, or MP4 format. If upload fails, check your internet connection and try again. If the problem persists, you can submit the report without a photo — it's optional."
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden transition-colors" style={{ borderColor: "rgba(200,160,80,0.2)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,96,26,0.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span className="font-medium text-sm pr-4" style={{ color: "#2C2010" }}>{question}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "#9C876A" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 text-sm leading-relaxed pt-3 whitespace-pre-line" style={{ borderTop: "1px solid rgba(200,160,80,0.15)", color: "#6B5A3E" }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.filter((faq) => {
    if (search) {
      return (
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase())
      );
    }
    return faq.category === activeCategory;
  });

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(180deg, #FFFDF8 0%, #F8F4EC 50%, #F5EEDC 100%)" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFFDF8 0%, #F8F4EC 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(26,35,126,0.05)" }} />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(200,96,26,0.07)" }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🆘</div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Help <span className="gradient-text">Center</span>
            </h1>
            <p className="font-devanagari text-lg mb-4" style={{ color: "#9C876A" }}>सहायता केंद्र</p>
            <p className="text-lg mb-8" style={{ color: "#6B5A3E" }}>
              Find answers to common questions about Jan Spandan
            </p>
            <div className="tricolor-bar w-24 mx-auto mb-8" />

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help... (e.g., 'how to report')"
                className="input-field pl-12 py-4 text-base rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {!search && (
            <div className="flex gap-2 flex-wrap mb-8 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    activeCategory === cat.id
                      ? "bg-[#C8601A] text-white border-[#C8601A] shadow-lg"
                      : "text-[#6B5A3E] hover:text-[#2C2010] hover:border-amber-300"
                  }`}
                  style={activeCategory !== cat.id ? { background: "rgba(255,253,248,0.8)", borderColor: "rgba(200,160,80,0.3)" } : {}}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-60 font-devanagari">{cat.hindiLabel}</span>
                </button>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* FAQs */}
            <div className="lg:col-span-2">
              {search && (
                <p className="text-gray-400 text-sm mb-4">
                  {filteredFaqs.length} result(s) for &ldquo;{search}&rdquo;
                </p>
              )}
              {!search && (
                <h2 className="text-lg font-semibold mb-4" style={{ color: "#2C2010" }}>
                  {categories.find((c) => c.id === activeCategory)?.emoji}{" "}
                  {categories.find((c) => c.id === activeCategory)?.label}
                </h2>
              )}
              <div className="space-y-2">
                {filteredFaqs.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-sm" style={{ color: "#6B5A3E" }}>No results found for your search.</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <FAQItem question={faq.question} answer={faq.answer} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions & Contact */}
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  ⚡ Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Report an Issue", href: "/auth/signup", emoji: "🚨" },
                    { label: "Track My Reports", href: "/auth/login", emoji: "📍" },
                    { label: "View Leaderboard", href: "/auth/login", emoji: "🏆" },
                    { label: "About Jan Spandan", href: "/about", emoji: "ℹ️" },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 p-2.5 rounded-lg transition-all group" style={{ textDecoration: "none" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(200,96,26,0.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>{action.emoji}</span>
                      <span className="text-sm group-hover:text-[#2C2010] flex-1" style={{ color: "#6B5A3E" }}>{action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "#2C2010" }}>💬 Contact Support</h3>
                <p className="text-sm mb-4" style={{ color: "#6B5A3E" }}>Can&apos;t find your answer? Reach out to us!</p>
                <div className="space-y-3">
                  <a href="mailto:support@janspandan.in" className="flex items-center gap-3 text-sm transition-colors" style={{ color: "#6B5A3E" }}>
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-orange-400" />
                    </div>
                    support@janspandan.in
                  </a>
                  <a href="tel:+911800000000" className="flex items-center gap-3 text-sm text-[#6B5A3E] hover:text-[#C8601A] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    1800-000-0000 (Toll Free)
                  </a>
                  <div className="flex items-center gap-3 text-sm text-[#6B5A3E]">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    Live chat: Mon–Sat, 9am–6pm
                  </div>
                </div>
              </div>

              {/* How it works — quick visual */}
              <div className="glass-card p-6" style={{ background: "linear-gradient(135deg, rgba(200,96,26,0.06), rgba(26,107,26,0.04))", borderColor: "rgba(200,96,26,0.15)" }}>
                <h3 className="font-semibold mb-4" style={{ color: "#2C2010" }}>📖 How It Works</h3>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "Sign up for free" },
                    { step: "2", text: "Spot & report the issue" },
                    { step: "3", text: "AI categorizes it" },
                    { step: "4", text: "Community upvotes" },
                    { step: "5", text: "Officer resolves it" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(200,96,26,0.1)", color: "#C8601A", border: "1px solid rgba(200,96,26,0.2)" }}>
                        {s.step}
                      </div>
                      <span style={{ color: "#6B5A3E" }}>{s.text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup" className="btn-primary w-full justify-center mt-4 py-2.5 text-sm">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 text-center" style={{ borderTop: "1px solid rgba(200,160,80,0.3)", background: "#F5EEDC" }}>
        <p className="text-sm" style={{ color: "#9C876A" }}>© 2025 Jan Spandan · Built with ❤️ for India 🇮🇳</p>
      </footer>
    </div>
  );
}
