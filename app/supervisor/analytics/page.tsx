"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getIssues, Issue } from "@/lib/firestore";
import { Loader2, TrendingUp, BarChart3, Clock, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { categoryLabels } from "@/lib/utils";

const COLORS = ["#f97316", "#a855f7", "#22c55e", "#3b82f6", "#eab308", "#ef4444", "#14b8a6", "#ec4899"];

export default function SupervisorAnalyticsPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<{title: string, desc: string, type: string}[]>([]);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    getIssues().then(data => {
      setIssues(data);
      setLoading(false);

      const total = data.length;
      const resolved = data.filter(i => i.status === "resolved").length;
      
      const statsData = {
        totalIssues: total,
        resolvedIssues: resolved,
        categoryBreakdown: data.reduce((acc: any, i) => {
          acc[i.category] = (acc[i.category] || 0) + 1;
          return acc;
        }, {})
      };

      fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statsData),
      })
        .then(res => res.json())
        .then(resData => {
          if (resData.insights) {
            setAiInsights(resData.insights);
          }
          setAiLoading(false);
        })
        .catch(() => setAiLoading(false));
    });
  }, []);

  const total = issues.length;
  const resolved = issues.filter(i => i.status === "resolved" || i.status === "closed").length;
  const open = issues.filter(i => i.status === "open").length;
  const inProgress = issues.filter(i => i.status === "in_progress").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Chart data
  const categoryData = Object.entries(
    issues.reduce((acc: Record<string, number>, i) => {
      const cat = categoryLabels[i.category] || i.category;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: "Open", count: open },
    { name: "In Progress", count: inProgress },
    { name: "Resolved/Closed", count: resolved },
  ];



  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2 text-[#C8601A]">
            <BarChart3 className="w-6 h-6" /> Performance Analytics
          </h1>
          <p className="text-[#6B5A3E] text-sm">Zone-wide metrics and AI-driven insights</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-[#C8601A] animate-spin" />
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Issues", value: total, icon: AlertTriangle, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { label: "Resolved", value: resolved, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                { label: "In Progress", value: inProgress, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                { label: "Resolution Rate", value: `${resolutionRate}%`, icon: TrendingUp, color: "text-[#C8601A]", bg: "bg-transparent", border: "border-[#C8601A]/30" },
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

            {/* AI Insights Panel */}
            <div className="glass-card p-6 border-[#C8601A]/30 bg-gradient-to-br from-[#C8601A]/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-transparent rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#C8601A]" />
                  Gemini AI Predictive Insights
                </h3>
                <span className="px-2 py-1 bg-[#C8601A]/10 text-[#C8601A] text-xs rounded border border-[#C8601A]/30 font-semibold">LIVE</span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 relative z-10">
                {aiLoading ? (
                  <div className="col-span-3 flex justify-center py-6">
                    <Loader2 className="w-6 h-6 text-[#C8601A] animate-spin" />
                  </div>
                ) : aiInsights.length > 0 ? (
                  aiInsights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="p-4 rounded-xl bg-[#FFFDF8] border border-amber-200/60"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {insight.type === "warning" ? "⚠️" : insight.type === "action" ? "🎯" : "📈"}
                        </span>
                        <span className="font-semibold text-sm text-[#2C2010]">{insight.title}</span>
                      </div>
                      <p className="text-[#2C2010] text-xs leading-relaxed">{insight.desc}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-[#9C876A] py-4 text-sm">
                    No insights available right now.
                  </div>
                )}
              </div>
            </div>

            {/* Charts Panel */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Pie Chart */}
              <div className="glass-card p-6 border-amber-200/60">
                <h3 className="font-semibold text-[#6B5A3E] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#C8601A]" /> Issues by Category
                </h3>
                {categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-[#9C876A] text-sm">No data available</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {categoryData.map((entry, i) => (
                        <span key={entry.name} className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                          {entry.name} ({entry.value})
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Status Bar Chart */}
              <div className="glass-card p-6 border-amber-200/60">
                <h3 className="font-semibold text-[#6B5A3E] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#C8601A]" /> Issue Status Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={statusData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                    <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]}>
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={["#f97316", "#eab308", "#22c55e"][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
