"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getIssues, Issue } from "@/lib/firestore";
import { BarChart3, TrendingUp, AlertTriangle, Users, Sparkles, Loader2 } from "lucide-react";
import { categoryLabels, statusColors, statusLabels } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SupervisorDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{title: string, insight: string, action: string}[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    getIssues().then(data => {
      setIssues(data);
      setLoading(false);
    });
  }, []);

  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      const categoryBreakdown = issues.reduce((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusBreakdown = issues.reduce((acc, issue) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const highSeverityCount = issues.filter(i => i.severity >= 4).length;
      const avgSeverity = issues.length > 0
        ? issues.reduce((sum, i) => sum + (i.severity || 3), 0) / issues.length
        : 3;

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalIssues: issues.length,
          resolvedIssues: issues.filter(i => i.status === "resolved").length,
          closedIssues: issues.filter(i => i.status === "closed").length,
          openIssues: issues.filter(i => i.status === "open").length,
          inProgressIssues: issues.filter(i => i.status === "in_progress").length,
          highSeverityCount,
          avgSeverity,
          categoryBreakdown,
          statusBreakdown,
        })
      });
      const data = await res.json();
      if (data.insights) {
        const parsed = Array.isArray(data.insights)
          ? data.insights
          : typeof data.insights === "string"
            ? JSON.parse(data.insights)
            : [data.insights];
        setInsights(parsed.map((item: { title?: string; insight?: string; desc?: string; action?: string }) => ({
          title: item.title || "Insight",
          insight: item.insight || item.desc || "No details available.",
          action: item.action || "Review and take appropriate action.",
        })));
      } else {
        toast.error("No insights returned from AI");
      }
    } catch {
      toast.error("Failed to generate insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex h-full items-center justify-center"><div className="spinner w-10 h-10"/></div></DashboardLayout>;

  const openCount = issues.filter(i => i.status === "open").length;
  const inProgressCount = issues.filter(i => i.status === "in_progress").length;
  const resolvedCount = issues.filter(i => i.status === "resolved").length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#C8601A]">Supervisor Command Center 📊</h1>
          <p className="text-[#6B5A3E] text-sm mt-1">Area overview and analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Reported", val: issues.length, color: "text-[#2C2010]", bg: "bg-[#FFFDF8]" },
            { label: "Open Issues", val: openCount, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "In Progress", val: inProgressCount, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Resolved", val: resolvedCount, color: "text-green-400", bg: "bg-green-500/10" },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-5 border-amber-200/60">
              <div className="text-[#6B5A3E] text-sm mb-2">{stat.label}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.val}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Insights Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2 text-[#C8601A]">
                <Sparkles className="w-5 h-5" /> Gemini AI Predictive Insights
              </h2>
              <button 
                onClick={generateInsights} disabled={insightsLoading || issues.length === 0}
                className="btn-primary py-2 px-4 text-sm glow-saffron disabled:opacity-50"
              >
                {insightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate New Report"}
              </button>
            </div>

            {insights.length === 0 && !insightsLoading && (
              <div className="glass-card p-10 text-center border-[#C8601A]/30 bg-[#C8601A]/5">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-[#C8601A] font-medium mb-1">AI Predictive Intelligence is ready</p>
                <p className="text-[#6B5A3E] text-sm">Click "Generate New Report" to analyze city data.</p>
              </div>
            )}

            {insightsLoading && (
              <div className="glass-card p-12 text-center border-[#C8601A]/30">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8601A] mx-auto mb-4" />
                <p className="text-[#C8601A] animate-pulse">Analyzing community reports with Gemini 2.0 Flash...</p>
              </div>
            )}

            {!insightsLoading && insights.length > 0 && (
              <div className="grid gap-4">
                {insights.map((insight, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="glass-card p-5 border-[#C8601A]/30 bg-transparent"
                  >
                    <h3 className="font-bold text-[#C8601A] mb-2">{insight.title}</h3>
                    <p className="text-[#2C2010] text-sm mb-3">{insight.insight}</p>
                    <div className="flex items-start gap-2 bg-[#C8601A]/10 p-3 rounded-lg text-sm border border-[#C8601A]/30">
                      <span className="font-semibold text-[#C8601A]">Action:</span>
                      <span className="text-[#2C2010]">{insight.action}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Breakdown */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Issue Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(
                issues.reduce((acc, issue) => {
                  acc[issue.category] = (acc[issue.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{categoryLabels[cat] || cat}</span>
                    <span className="text-[#6B5A3E]">{count}</span>
                  </div>
                  <div className="w-full bg-[#FFFDF8] rounded-full h-1.5">
                    <div className="bg-[#C8601A] h-1.5 rounded-full" style={{ width: `${(count / issues.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
