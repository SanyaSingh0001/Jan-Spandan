"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { ArrowRight, Target, Zap, Shield, Users, Heart, MapPin } from "lucide-react";

const team = [
  { name: "Aarav Mehta", role: "Full Stack Dev", emoji: "👨‍💻", city: "Delhi" },
  { name: "Priya Krishnan", role: "UI/UX Designer", emoji: "👩‍🎨", city: "Bengaluru" },
  { name: "Rohan Gupta", role: "AI Engineer", emoji: "👨‍🔬", city: "Mumbai" },
  { name: "Sneha Iyer", role: "Backend Dev", emoji: "👩‍💻", city: "Chennai" },
];

const milestones = [
  { year: "Jan 2025", label: "Project Kickoff", desc: "Ideation for Coding Ninjas × Google Hackathon" },
  { year: "Feb 2025", label: "MVP Built", desc: "Core reporting & Firebase integration complete" },
  { year: "Mar 2025", label: "AI Integration", desc: "Gemini 2.0 Flash added for smart categorization" },
  { year: "Apr 2025", label: "Beta Launch", desc: "52 cities onboarded, 1000+ issues resolved" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(180deg, #FFFDF8 0%, #F8F4EC 50%, #F5EEDC 100%)" }}>
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFFDF8 0%, #F8F4EC 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(200,96,26,0.07)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(26,107,26,0.06)" }} />
          <div className="absolute inset-0 opacity-[0.04] mandala-bg" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 font-medium" style={{ background: "rgba(200,96,26,0.08)", border: "1px solid rgba(200,96,26,0.2)", color: "#C8601A" }}
          >
            🇮🇳 Made in India, for India
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1
              className="text-5xl lg:text-7xl font-bold mb-4 font-devanagari gradient-text py-2 leading-[1.2]" 
              style={{ fontFamily: "var(--font-devanagari), serif" }}
            >
              जन सेवा, जन शक्ति
            </h1>
            <p className="text-xl mb-2" style={{ color: "#6B5A3E" }}>People&apos;s Service, People&apos;s Power</p>
            <div className="tricolor-bar w-32 mx-auto mt-4" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg mt-8 max-w-2xl mx-auto leading-relaxed" style={{ color: "#6B5A3E" }}
          >
            Jan Spandan was built to solve a fundamental problem in Indian civic life —
            citizens have no unified, transparent way to report local infrastructure issues and
            see them through to resolution.
          </motion.p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 lg:p-12 border-orange-500/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#2C2010" }}>The Problem</h2>
                <p className="text-sm font-devanagari" style={{ color: "#9C876A" }}>समस्या क्या है?</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "🔄", title: "Fragmented Systems", desc: "Citizens bounce between WhatsApp groups, Twitter, and helplines with no single platform to track issues." },
                { icon: "👁️", title: "Zero Transparency", desc: "Once a complaint is filed, it disappears. No updates, no accountability, no resolution timeline." },
                { icon: "🤝", title: "No Collaboration", desc: "Citizens and municipal bodies work in silos. Field officers have no real-time coordination tools." },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-xl" style={{ background: "rgba(255,253,248,0.8)", border: "1px solid rgba(200,160,80,0.2)" }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-2" style={{ color: "#2C2010" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B5A3E" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Our Solution */}
      <section className="py-10 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#2C2010" }}>Our <span className="gradient-text">Solution</span></h2>
          <p className="font-devanagari" style={{ color: "#9C876A" }}>हमारा समाधान</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, color: "orange", title: "AI-Powered", hindi: "AI संचालित", desc: "Google Gemini 2.0 Flash categorizes issues, estimates severity, and routes to the right department automatically." },
            { icon: MapPin, color: "blue", title: "Geo-Tagged", hindi: "भू-चिह्नित", desc: "Every report is pinned on Google Maps. Officers see exact locations, citizens see real-time status." },
            { icon: Users, color: "green", title: "Community Driven", hindi: "समुदाय संचालित", desc: "Citizens upvote real issues, creating democratic priority queues that ensure the most critical problems are solved first." },
            { icon: Shield, color: "purple", title: "Role-Based", hindi: "भूमिका आधारित", desc: "Separate workspaces for Citizens, Field Officers, Supervisors, and Admins with appropriate access control." },
            { icon: Heart, color: "pink", title: "Gamified", hindi: "गेमिफ़ाइड", desc: "Earn points and badges for reporting and verifying issues. Climb the leaderboard and become a Jan Spandan Hero." },
            { icon: Target, color: "amber", title: "Predictive AI", hindi: "भविष्यसूचक AI", desc: "Supervisors get AI insights on future problem hotspots, enabling proactive maintenance instead of reactive firefighting." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 hover-glow"
              >
                <div className={`w-11 h-11 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 text-${item.color}-400`} />
                </div>
                <h3 className="font-bold text-lg mb-0.5" style={{ color: "#2C2010" }}>{item.title}</h3>
                <p className="text-xs font-devanagari mb-2" style={{ color: "#9C876A" }}>{item.hindi}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#6B5A3E" }}>{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Google Technology Stack */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(180deg, #F5EEDC 0%, #EDE2CF 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#2C2010" }}>Powered by <span className="gradient-text-blue">Google</span></h2>
            <p className="font-devanagari" style={{ color: "#9C876A" }}>गूगल की तकनीक पर निर्मित</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "🔐", name: "Firebase Auth", desc: "Secure authentication with Email & Google Sign-In", color: "border-orange-500/20" },
              { icon: "🔥", name: "Cloud Firestore", desc: "Real-time NoSQL database with live updates", color: "border-orange-500/20" },
              { icon: "🤖", name: "Gemini 2.0 Flash", desc: "AI categorization, severity prediction & insights", color: "border-purple-500/20" },
              { icon: "🗺️", name: "Google Maps API", desc: "Interactive geo-mapping for every issue", color: "border-blue-500/20" },
              { icon: "☁️", name: "Cloud Run", desc: "Containerized deployment with autoscaling", color: "border-cyan-500/20" },
              { icon: "✏️", name: "Google Fonts", desc: "Inter + Noto Sans Devanagari typography", color: "border-pink-500/20" },
            ].map((tech) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`glass-card p-5 border ${tech.color} hover:scale-105 transition-transform`}
              >
                <div className="text-3xl mb-3">{tech.icon}</div>
                <div className="font-semibold text-sm mb-1" style={{ color: "#2C2010" }}>{tech.name}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#6B5A3E" }}>{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#2C2010" }}>Our <span className="gradient-text">Journey</span></h2>
          <p className="font-devanagari" style={{ color: "#9C876A" }}>हमारी यात्रा</p>
        </motion.div>
        <div className="space-y-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                {i < milestones.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-orange-500/50 to-transparent" />}
              </div>
              <div className="glass-card p-5 flex-1 mb-2">
                <div className="text-xs font-semibold mb-1" style={{ color: "#C8601A" }}>{m.year}</div>
                <div className="font-bold mb-1" style={{ color: "#2C2010" }}>{m.label}</div>
                <div className="text-sm" style={{ color: "#6B5A3E" }}>{m.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass-card p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-green-500/10" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🦸</div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#2C2010" }}>
              Ready to make your <span className="gradient-text">community better?</span>
            </h2>
            <p className="mb-8" style={{ color: "#6B5A3E" }}>Join thousands of citizens already making a difference.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/signup" className="btn-primary py-3 px-8 glow-saffron">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/help" className="btn-secondary py-3 px-8">
                Learn More
              </Link>
            </div>
            <div className="tricolor-bar w-24 mx-auto mt-8" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: "1px solid rgba(200,160,80,0.3)", background: "#F5EEDC" }}>
        <p className="text-sm" style={{ color: "#9C876A" }}>© 2025 Jan Spandan · Built with ❤️ for India 🇮🇳 · Coding Ninjas × Google Hackathon</p>
      </footer>
    </div>
  );
}
