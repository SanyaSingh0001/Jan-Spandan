"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStats } from "@/lib/firestore";
import { Loader2, TrendingUp, Users, CheckCircle, ShieldAlert, Activity } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => {
      toast.error("Failed to load system stats");
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2 text-red-400">
            <Activity className="w-6 h-6" /> System Analytics
          </h1>
          <p className="text-[#6B5A3E] text-sm">Platform-wide health metrics and user statistics</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* High Level Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users (Citizens)", value: stats?.citizens || 0, icon: Users, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                { label: "Total Issues", value: stats?.total || 0, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                { label: "Resolved Issues", value: stats?.resolved || 0, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                { label: "Overall Resolution Rate", value: stats?.total ? `${Math.round((stats.resolved / stats.total) * 100)}%` : "0%", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass-card p-5 border ${stat.border}`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-3xl font-bold text-[#2C2010] mb-1">{stat.value}</div>
                    <div className="text-sm text-[#6B5A3E]">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* System Health / API usage mock */}
            <div className="glass-card p-6 border-amber-200/60">
              <h3 className="text-lg font-bold mb-4">API & Service Health</h3>
              <div className="space-y-4">
                {[
                  { name: "Firebase Firestore", status: "Healthy", uptime: "99.99%" },
                  { name: "Google Gemini 2.0 Flash", status: "Healthy", uptime: "100%" },
                  { name: "Cloudinary Media", status: "Healthy", uptime: "99.95%" },
                  { name: "Google Maps SDK", status: "Healthy", uptime: "100%" },
                ].map(service => (
                  <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-[#FFFDF8] border border-amber-200/60">
                    <span className="font-medium">{service.name}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-[#6B5A3E] text-sm">Uptime: {service.uptime}</span>
                      <span className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" /> {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
