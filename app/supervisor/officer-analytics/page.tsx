"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getIssues, getOfficers, Issue } from "@/lib/firestore";
import { UserProfile } from "@/lib/auth-context";
import { statusLabels, categoryLabels, formatTimeAgo } from "@/lib/utils";
import { Loader2, TrendingUp, CheckCircle, Clock, AlertTriangle, ArrowLeft, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#f97316", "#a855f7", "#22c55e", "#3b82f6", "#eab308", "#ef4444", "#14b8a6", "#ec4899"];

type OfficerStats = {
  id: string;
  name: string;
  total: number;
  resolved: number;
  inProgress: number;
  open: number;
  resolutionRate: number;
};

function buildOfficerStats(officers: UserProfile[], issues: Issue[]): OfficerStats[] {
  const counts: Record<string, OfficerStats> = {};

  for (const officer of officers) {
    const id = (officer as UserProfile & { id?: string }).id || officer.uid;
    counts[id] = {
      id,
      name: officer.displayName || "Officer",
      total: 0,
      resolved: 0,
      inProgress: 0,
      open: 0,
      resolutionRate: 0,
    };
  }

  for (const issue of issues) {
    if (!issue.assignedTo || !counts[issue.assignedTo]) continue;
    counts[issue.assignedTo].total++;
    if (issue.status === "resolved" || issue.status === "closed") counts[issue.assignedTo].resolved++;
    if (issue.status === "in_progress") counts[issue.assignedTo].inProgress++;
    if (issue.status === "open") counts[issue.assignedTo].open++;
  }

  return Object.values(counts).map((officer) => ({
    ...officer,
    resolutionRate: officer.total > 0 ? Math.round((officer.resolved / officer.total) * 100) : 0,
  }));
}

function TeamOverview({ officers, issues }: { officers: UserProfile[]; issues: Issue[] }) {
  const officerStats = buildOfficerStats(officers, issues);
  const assignedIssues = issues.filter((i) => i.assignedTo);
  const total = assignedIssues.length;
  const resolved = assignedIssues.filter((i) => i.status === "resolved" || i.status === "closed").length;
  const inProgress = assignedIssues.filter((i) => i.status === "in_progress").length;
  const open = assignedIssues.filter((i) => i.status === "open").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const statusData = [
    { name: "Open", count: open },
    { name: "In Progress", count: inProgress },
    { name: "Resolved/Closed", count: resolved },
  ];

  const performanceData = officerStats
    .filter((o) => o.total > 0)
    .sort((a, b) => b.resolved - a.resolved)
    .slice(0, 8)
    .map((o) => ({ name: o.name.split(" ")[0], resolved: o.resolved, inProgress: o.inProgress }));

  const stats = [
    { label: "Officers Tracked", value: officers.length, color: "text-[#C8601A]", bg: "bg-transparent", border: "border-[#C8601A]/30", icon: Users },
    { label: "Assigned Issues", value: total, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: AlertTriangle },
    { label: "In Progress", value: inProgress, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
    { label: "Team Resolution Rate", value: `${resolutionRate}%`, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: TrendingUp },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 border ${stat.border}`}>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-[#2C2010] mb-1">{stat.value}</div>
              <div className="text-sm text-[#6B5A3E]">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold text-[#2C2010] mb-4">Overall Issue Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={["#f97316", "#eab308", "#22c55e"][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-[#2C2010] mb-4">Officer Workload</h3>
          {performanceData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#9C876A] text-sm">No assigned issues yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={performanceData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-amber-200/60 flex items-center justify-between">
          <h3 className="font-semibold text-[#2C2010]">Officer Performance Overview</h3>
          <Link href="/supervisor/officers" className="text-[#C8601A] text-sm hover:text-[#C8601A]">Manage Officers →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[#6B5A3E] uppercase bg-[#FFFDF8]">
              <tr>
                <th className="px-6 py-3 text-left">Officer</th>
                <th className="px-6 py-3 text-left">Assigned</th>
                <th className="px-6 py-3 text-left">In Progress</th>
                <th className="px-6 py-3 text-left">Resolved</th>
                <th className="px-6 py-3 text-left">Rate</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {officerStats.map((officer) => {
                const workStatus = officer.inProgress > 0
                  ? { label: "Working", className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" }
                  : officer.resolved > 0
                    ? { label: "Delivering", className: "text-green-400 bg-green-400/10 border-green-400/20" }
                    : officer.total > 0
                      ? { label: "Assigned", className: "text-blue-400 bg-blue-400/10 border-blue-400/20" }
                      : { label: "Available", className: "text-[#6B5A3E] bg-[#FFFDF8] border-amber-200/60" };

                return (
                  <tr key={officer.id} className="border-t border-amber-200/60 hover:bg-[#FFFDF8]">
                    <td className="px-6 py-3 font-medium text-[#2C2010]">{officer.name}</td>
                    <td className="px-6 py-3 text-[#6B5A3E]">{officer.total}</td>
                    <td className="px-6 py-3 text-yellow-400">{officer.inProgress}</td>
                    <td className="px-6 py-3 text-green-400">{officer.resolved}</td>
                    <td className="px-6 py-3 text-[#C8601A]">{officer.resolutionRate}%</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${workStatus.className}`}>
                        {workStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/supervisor/officer-analytics?id=${officer.id}&name=${encodeURIComponent(officer.name)}`} className="text-[#C8601A] hover:text-[#C8601A] text-xs">
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function OfficerAnalyticsContent() {
  const params = useSearchParams();
  const officerId = params.get("id");
  const officerName = params.get("name") || "Officer";

  const [issues, setIssues] = useState<Issue[]>([]);
  const [officers, setOfficers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getIssues(), getOfficers()])
      .then(([issuesData, officersData]) => {
        setIssues(issuesData);
        setOfficers(officersData as unknown as UserProfile[]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-[#C8601A] animate-spin" />
      </div>
    );
  }

  if (!officerId) {
    return <TeamOverview officers={officers} issues={issues} />;
  }

  const officerIssues = issues.filter((i) => i.assignedTo === officerId);
  const total = officerIssues.length;
  const resolved = officerIssues.filter(i => i.status === "resolved" || i.status === "closed").length;
  const inProgress = officerIssues.filter(i => i.status === "in_progress").length;
  const open = officerIssues.filter(i => i.status === "open").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const categoryData = Object.entries(
    officerIssues.reduce((acc: Record<string, number>, i) => {
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

  const stats = [
    { label: "Total Assigned", value: total, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: AlertTriangle },
    { label: "In Progress", value: inProgress, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
    { label: "Resolved/Closed", value: resolved, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle },
    { label: "Resolution Rate", value: `${resolutionRate}%`, color: "text-[#C8601A]", bg: "bg-transparent", border: "border-[#C8601A]/30", icon: TrendingUp },
  ];

  return (
    <>
      <div className="glass-card p-4 border-[#C8601A]/30 bg-[#C8601A]/5 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6B5A3E]">Viewing officer</p>
          <p className="text-lg font-semibold text-[#2C2010]">{officerName}</p>
        </div>
        <Link href="/supervisor/officer-analytics" className="btn-secondary py-2 px-4 text-sm border-[#C8601A]/30 text-[#C8601A]">
          View All Officers
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 border ${stat.border}`}>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-[#2C2010] mb-1">{stat.value}</div>
              <div className="text-sm text-[#6B5A3E]">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold text-[#2C2010] mb-4">Issues by Category</h3>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#9C876A] text-sm">No issues assigned yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {categoryData.map((entry, i) => (
                  <span key={entry.name} className="flex items-center gap-1 text-xs text-[#6B5A3E]">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-[#2C2010] mb-4">Issue Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={["#f97316", "#eab308", "#22c55e"][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-amber-200/60">
          <h3 className="font-semibold text-[#2C2010]">Assigned Issues History ({total})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[#6B5A3E] uppercase bg-[#FFFDF8]">
              <tr>
                <th className="px-6 py-3 text-left">Issue</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Reported</th>
              </tr>
            </thead>
            <tbody>
              {officerIssues.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-[#9C876A]">No issues assigned yet</td></tr>
              ) : (
                officerIssues.map(issue => (
                  <tr key={issue.id} className="border-t border-amber-200/60 hover:bg-[#FFFDF8]">
                    <td className="px-6 py-3 font-medium text-[#2C2010] truncate max-w-xs">{issue.title}</td>
                    <td className="px-6 py-3 text-[#6B5A3E]">{categoryLabels[issue.category]}</td>
                    <td className="px-6 py-3"><span className={`badge badge-${issue.status}`}>{statusLabels[issue.status]}</span></td>
                    <td className="px-6 py-3 text-[#9C876A]">{formatTimeAgo(issue.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function OfficerAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/supervisor/officers" className="p-2 rounded-lg bg-[#FFFDF8] hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#6B5A3E]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#C8601A]">Officer Performance</h1>
            <p className="text-[#6B5A3E] text-sm">Team-wide and individual officer analytics</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-10 h-10 text-[#C8601A] animate-spin" />
          </div>
        }>
          <OfficerAnalyticsContent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
