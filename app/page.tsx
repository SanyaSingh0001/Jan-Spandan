"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import PublicNavbar from "@/components/layout/PublicNavbar";
import {
  ArrowRight,
  MapPin,
  Zap,
  Shield,
  BarChart3,
  Star,
  ChevronRight,
  Phone,
  Camera,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

// Animated counter component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const features = [
  {
    icon: Camera,
    title: "Photo & Video Reporting",
    hindi: "फ़ोटो और वीडियो रिपोर्टिंग",
    desc: "Capture the issue with your camera and attach geo-tagged media for clear, undeniable evidence.",
    color: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
    iconColor: "text-orange-500",
  },
  {
    icon: Zap,
    title: "AI-Powered Categorization",
    hindi: "AI-संचालित वर्गीकरण",
    desc: "Google Gemini AI automatically identifies issue type, severity, and the right municipal department.",
    color: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: MapPin,
    title: "Geo-Location & Mapping",
    hindi: "भू-स्थान और मानचित्रण",
    desc: "Issues are pinned on a live Google Map for precise location tracking and area-wide analysis.",
    color: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Users,
    title: "Community Verification",
    hindi: "सामुदायिक सत्यापन",
    desc: "Citizens upvote real issues to prioritize them, ensuring the most critical problems get attention first.",
    color: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
    iconColor: "text-green-500",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    hindi: "रीयल-टाइम ट्रैकिंग",
    desc: "Follow your issue from reporting to resolution with live status updates, comments, and notifications.",
    color: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/20",
    iconColor: "text-yellow-600",
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    hindi: "भविष्यसूचक अंतर्दृष्टि",
    desc: "AI analyzes historical patterns to predict future problem hotspots, enabling proactive maintenance.",
    color: "from-pink-500/10 to-pink-600/5",
    border: "border-pink-500/20",
    iconColor: "text-pink-500",
  },
  {
    icon: BarChart3,
    title: "Impact Dashboards",
    hindi: "प्रभाव डैशबोर्ड",
    desc: "Transparent analytics for citizens, field officers, and administrators with real resolution metrics.",
    color: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-600",
  },
  {
    icon: Star,
    title: "Gamification & Rewards",
    hindi: "गेमिफिकेशन और पुरस्कार",
    desc: "Earn points and badges for reporting and verifying issues. Climb the community leaderboard.",
    color: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-500",
  },
];

const steps = [
  {
    num: "01",
    icon: Camera,
    title: "Spot & Report",
    hindi: "देखें और रिपोर्ट करें",
    desc: "Take a photo or video of the issue. Add a description and drop a precise pin on the map.",
  },
  {
    num: "02",
    icon: Zap,
    title: "AI Categorizes",
    hindi: "AI वर्गीकरण",
    desc: "Gemini AI instantly categorizes the issue, assigns priority, and routes it to the right team.",
  },
  {
    num: "03",
    icon: CheckCircle,
    title: "Community Validates",
    hindi: "समुदाय सत्यापन",
    desc: "Other citizens upvote and verify the issue, increasing its priority in the official queue.",
  },
  {
    num: "04",
    icon: Shield,
    title: "Officers Resolve",
    hindi: "अधिकारी समाधान",
    desc: "Field officers get notified, respond on the ground, and update the status in real-time.",
  },
];

const issueTypes = [
  { emoji: "🕳️", label: "Potholes", count: "3,200+" },
  { emoji: "💧", label: "Water Leakage", count: "1,800+" },
  { emoji: "💡", label: "Street Lights", count: "2,100+" },
  { emoji: "🗑️", label: "Waste Mgmt", count: "4,500+" },
  { emoji: "🌊", label: "Drainage", count: "980+" },
  { emoji: "🚧", label: "Road Damage", count: "1,400+" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    city: "Mumbai, Maharashtra",
    avatar: "👩",
    text: "I reported a dangerous pothole that was there for 2 years. Within 5 days, it was fixed! Jan Spandan actually works and brings true accountability.",
  },
  {
    name: "Rajesh Kumar",
    city: "Bengaluru, Karnataka",
    avatar: "👨",
    text: "The AI categorization is impressive. It knew exactly which department to route my water leakage complaint to, saving weeks of bureaucratic delays.",
  },
  {
    name: "Anita Desai",
    city: "Pune, Maharashtra",
    avatar: "👩",
    text: "I've earned the Jan Spandan Hero badge! 15 issues resolved in my ward. This app makes civic participation fun and deeply rewarding.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(180deg, #FFFDF8 0%, #F8F4EC 50%, #F5EEDC 100%)" }}>
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-28 lg:py-0 lg:pt-16 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDF8] via-[#F8F4EC] to-[#F5EEDC] z-0" />
        
        {/* Mandala Pattern */}
        <div className="absolute inset-0 opacity-[0.03] mandala-bg z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium"
                style={{ background: "rgba(200,96,26,0.08)", border: "1px solid rgba(200,96,26,0.2)", color: "#C8601A" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#C8601A] animate-pulse" />
                🇮🇳 Built for Indian Communities
              </motion.div>

              <div>
                <div className="font-devanagari text-2xl font-bold mb-3" style={{ color: "#C8601A" }}>
                  आपका शहर, आपकी आवाज़
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight" style={{ color: "#2C2010" }}>
                  Empowering
                  <br />
                  <span className="gradient-text">Citizens</span> to Fix
                  <br />
                  Their Cities
                </h1>
                <div className="tricolor-bar w-24 mt-5" />
              </div>

              <p className="text-xl leading-relaxed max-w-lg" style={{ color: "#6B5A3E" }}>
                Report potholes, water leakages, broken streetlights, and more.
                Jan Spandan uses <strong style={{ color: "#2C2010" }}>AI + community power</strong> to get infrastructure issues resolved fast and transparently.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/auth/signup" className="btn-primary text-base py-3.5 px-6 glow-saffron">
                  Start Reporting Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/#features" className="btn-secondary text-base py-3.5 px-6">
                  See How It Works
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: "rgba(200,160,80,0.2)" }}>
                {[
                  { value: 12847, label: "Issues Reported", suffix: "+" },
                  { value: 8934, label: "Issues Resolved", suffix: "+" },
                  { value: 52, label: "Cities Active", suffix: "" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold gradient-text">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs mt-1 font-medium" style={{ color: "#9C876A" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full mt-10 lg:mt-0"
            >
              <div className="relative z-20 w-full max-w-xs sm:max-w-sm lg:max-w-sm xl:max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-[4px]" style={{ borderColor: "rgba(255,253,248,0.8)" }}>
                <img src="/new2.png" alt="Jan Spandan" className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-700" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Issue type tags strip */}
        <div className="absolute bottom-0 left-0 right-0 border-t backdrop-blur-md" style={{ background: "rgba(255,253,248,0.6)", borderColor: "rgba(200,160,80,0.2)" }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-3 justify-center">
              {issueTypes.map((type) => (
                <div key={type.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm shadow-sm" style={{ background: "#FFFDF8", borderColor: "rgba(200,160,80,0.2)" }}>
                  <span>{type.emoji}</span>
                  <span className="font-medium" style={{ color: "#6B5A3E" }}>{type.label}</span>
                  <span className="font-bold text-xs" style={{ color: "#C8601A" }}>{type.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inspirational Quote Section */}
      <section className="py-16 px-4" style={{ background: "linear-gradient(90deg, #F5EEDC 0%, #EDE2CF 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-4 text-[#C8601A]/30">❝</div>
          <p className="hindi-quote mb-4 text-2xl md:text-3xl leading-relaxed">
            परिवर्तन की शुरुआत एक आवाज़ से होती है। आइए, मिलकर अपने शहर को बेहतर बनाएं।
          </p>
          <p className="text-[#6B5A3E] text-lg font-medium italic">
            "Change begins with a single voice. Let's come together to make our city better."
          </p>
          <div className="tricolor-bar w-16 mx-auto mt-6" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 max-w-7xl mx-auto" id="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-4 font-medium" style={{ background: "rgba(200,160,80,0.1)", color: "#C8601A", border: "1px solid rgba(200,160,80,0.2)" }}>
            Simple 4-step process
          </div>
          <h2 className="text-4xl font-bold mb-3" style={{ color: "#2C2010" }}>
            How <span className="gradient-text">Jan Spandan</span> Works
          </h2>
          <p className="font-devanagari mb-4" style={{ color: "#C8601A" }}>यह कैसे काम करता है?</p>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6B5A3E" }}>
            From spotting an issue to seeing it resolved — a transparent, AI-powered journey every step of the way. We bridge the gap between citizens and authorities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 relative group"
              >
                <div className="text-5xl font-black absolute top-4 right-4" style={{ color: "rgba(200,160,80,0.15)" }}>{step.num}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm" style={{ background: "linear-gradient(135deg, rgba(200,96,26,0.1) 0%, rgba(200,96,26,0.05) 100%)", border: "1px solid rgba(200,96,26,0.2)" }}>
                  <Icon className="w-6 h-6" style={{ color: "#C8601A" }} />
                </div>
                <h3 className="font-bold text-lg mb-1" style={{ color: "#2C2010" }}>{step.title}</h3>
                <p className="text-xs font-devanagari mb-3" style={{ color: "#C8601A" }}>{step.hindi}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#6B5A3E" }}>{step.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 z-10" style={{ color: "rgba(200,96,26,0.4)" }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 section-alt" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-4 font-medium" style={{ background: "rgba(26,107,26,0.1)", color: "#1A6B1A", border: "1px solid rgba(26,107,26,0.2)" }}>
              Powered by Google Technologies
            </div>
            <h2 className="text-4xl font-bold mb-3" style={{ color: "#2C2010" }}>
              Everything you need to <span className="gradient-text">drive change</span>
            </h2>
            <p className="font-devanagari mb-4" style={{ color: "#1A6B1A" }}>बदलाव लाने के लिए आवश्यक हर चीज़</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`p-5 rounded-xl bg-gradient-to-br ${feat.color} border ${feat.border} hover:scale-105 transition-all duration-300 cursor-pointer group bg-white/60 backdrop-blur-sm`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "#2C2010" }}>{feat.title}</h3>
                  <p className="text-[10px] font-devanagari mb-2 opacity-80" style={{ color: "#6B5A3E" }}>{feat.hindi}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#6B5A3E" }}>{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Google Tools Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 lg:p-12"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#2C2010" }}>Powered by <span className="gradient-text-blue">Google Technologies</span></h2>
            <p className="font-medium" style={{ color: "#6B5A3E" }}>Built on the best of Google's ecosystem for reliability, security, and intelligence</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Firebase Auth", icon: "🔐", desc: "Secure authentication" },
              { name: "Cloud Firestore", icon: "🔥", desc: "Real-time database" },
              { name: "Gemini AI", icon: "🤖", desc: "AI categorization" },
              { name: "Google Maps", icon: "🗺️", desc: "Geo-mapping" },
              { name: "Cloud Run", icon: "☁️", desc: "Deployment" },
              { name: "Google Fonts", icon: "✏️", desc: "Typography" },
            ].map((tool) => (
              <div key={tool.name} className="text-center p-4 rounded-xl transition-all group" style={{ background: "rgba(255,253,248,0.6)", border: "1px solid rgba(200,160,80,0.2)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(200,96,26,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,253,248,0.6)"}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">{tool.icon}</div>
                <div className="font-semibold text-xs" style={{ color: "#2C2010" }}>{tool.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#6B5A3E" }}>{tool.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 section-alt">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-3" style={{ color: "#2C2010" }}>
              Citizens making a <span className="gradient-text">difference</span>
            </h2>
            <p className="font-devanagari text-lg" style={{ color: "#C8601A" }}>नागरिक जो बदलाव ला रहे हैं</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6"
              >
                <div className="text-xl mb-3" style={{ color: "#C8601A" }}>{"★".repeat(5)}</div>
                <p className="text-sm leading-relaxed mb-4 italic" style={{ color: "#6B5A3E" }}>"{t.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm" style={{ background: "rgba(200,96,26,0.1)", border: "1px solid rgba(200,96,26,0.2)" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "#2C2010" }}>{t.name}</div>
                    <div className="text-xs font-medium" style={{ color: "#9C876A" }}>📍 {t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card-premium p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 pattern-overlay opacity-50 z-0" />
            <div className="relative z-10">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-4xl font-bold mb-3" style={{ color: "#2C2010" }}>
                Ready to be a <span className="gradient-text">Jan Spandan Hero?</span>
              </h2>
              <p className="font-devanagari text-xl mb-4" style={{ color: "#C8601A" }}>आज ही जुड़ें और बदलाव का हिस्सा बनें</p>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "#6B5A3E" }}>
                Join thousands of citizens already making their neighbourhoods better. It&apos;s free, easy, and makes a real, visible difference.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/signup" className="btn-primary text-base py-3.5 px-8 glow-saffron">
                  Join the Movement
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/auth/login" className="btn-secondary text-base py-3.5 px-8 bg-white">
                  Already a member? Sign In
                </Link>
              </div>
              <div className="tricolor-bar w-32 mx-auto mt-8" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 section-alt" style={{ borderTop: "1px solid rgba(200,160,80,0.3)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-md">🌟</div>
                <span className="font-bold text-lg" style={{ color: "#2C2010" }}>Jan Spandan</span>
              </div>
              <p className="text-sm leading-relaxed mb-2" style={{ color: "#6B5A3E" }}>
                Empowering Indian citizens to build better communities through technology and collaboration.
              </p>
              <p className="text-xs font-devanagari" style={{ color: "#C8601A" }}>जन सेवा, जन शक्ति</p>
              <div className="tricolor-bar w-20 mt-4" />
            </div>
            {[
              { title: "Platform", links: ["Report Issue", "Community Map", "Leaderboard", "Dashboard"] },
              { title: "Company", links: ["About Us", "How It Works", "Blog", "Careers"] },
              { title: "Support", links: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-4" style={{ color: "#2C2010" }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm transition-colors" style={{ color: "#6B5A3E" }} onMouseEnter={(e) => e.currentTarget.style.color = "#C8601A"} onMouseLeave={(e) => e.currentTarget.style.color = "#6B5A3E"}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(200,160,80,0.2)" }}>
            <p className="text-sm" style={{ color: "#9C876A" }}>© 2025 Jan Spandan. Built with ❤️ for India 🇮🇳</p>
            <p className="text-sm" style={{ color: "#9C876A" }}>Made for Coding Ninjas × Google Hackathon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
