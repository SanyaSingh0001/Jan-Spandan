"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getOfficers, getIssues, Issue } from "@/lib/firestore";
import { UserProfile } from "@/lib/auth-context";
import { Search, Loader2, MapPin, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SupervisorOfficersPage() {
  const [officers, setOfficers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [issuesByOfficer, setIssuesByOfficer] = useState<Record<string, { total: number; resolved: number; inProgress: number }>>({});

  useEffect(() => {
    Promise.all([getOfficers(), getIssues()])
      .then(([officersData, allIssues]) => {
        setOfficers(officersData as unknown as UserProfile[]);

        // Build per-officer issue counts
        const counts: Record<string, { total: number; resolved: number; inProgress: number }> = {};
        for (const issue of allIssues as Issue[]) {
          if (!issue.assignedTo) continue;
          if (!counts[issue.assignedTo]) {
            counts[issue.assignedTo] = { total: 0, resolved: 0, inProgress: 0 };
          }
          counts[issue.assignedTo].total++;
          if (issue.status === "resolved" || issue.status === "closed") counts[issue.assignedTo].resolved++;
          if (issue.status === "in_progress") counts[issue.assignedTo].inProgress++;
        }
        setIssuesByOfficer(counts);
      })
      .catch(() => toast.error("Failed to load officers list"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = officers.filter(
    (o) =>
      o.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.ward?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-[#C8601A]">Field Officers</h1>
          <p className="text-[#6B5A3E] text-sm">Monitor and manage the officers working under your supervision</p>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 border-[#C8601A]/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 border-[#C8601A]/30 focus:border-purple-500"
              placeholder="Search by name, email, or ward..."
            />
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#2C2010]">{officers.length}</div>
              <div className="text-[#9C876A] text-xs uppercase tracking-wider">Total Officers</div>
            </div>
            <div className="w-px h-10 bg-white" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{officers.filter(o => o.approved).length}</div>
              <div className="text-[#9C876A] text-xs uppercase tracking-wider">Active</div>
            </div>
          </div>
        </div>

        {/* Officers Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-[#C8601A] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center border-[#C8601A]/30">
            <div className="text-5xl mb-3">👷‍♂️</div>
            <p className="text-[#6B5A3E]">No officers found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((officer, i) => {
                const officerId = officer.uid || (officer as UserProfile & { id?: string }).id || "";
                const stats = issuesByOfficer[officerId] || { total: 0, resolved: 0, inProgress: 0 };
                const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                const workStatus = stats.inProgress > 0
                  ? { label: "In Progress", className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock }
                  : stats.resolved > 0
                    ? { label: "Active", className: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle }
                    : stats.total > 0
                      ? { label: "Assigned", className: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: TrendingUp }
                      : { label: "Available", className: "text-[#6B5A3E] bg-[#FFFDF8] border-amber-200/60", icon: MapPin };
                const WorkIcon = workStatus.icon;

                return (
                  <motion.div
                    key={officerId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 hover:border-[#C8601A]/30 transition-colors border-amber-200/60"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {officer.photoURL ? (
                        <img src={officer.photoURL} alt="" className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#C8601A]/20" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8601A]/20 to-[#C8601A]/5 flex items-center justify-center text-xl font-bold text-[#C8601A] flex-shrink-0 border border-[#C8601A]/20">
                          {officer.displayName?.[0]?.toUpperCase() || "O"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#2C2010] truncate">{officer.displayName}</h3>
                        <p className="text-[#6B5A3E] text-xs truncate">{officer.email}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${workStatus.className}`}>
                            <WorkIcon className="w-3 h-3" /> {workStatus.label}
                          </span>
                          {!officer.approved && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                              Awaiting Approval
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm bg-[#FFFDF8] rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5A3E] font-medium text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Active Region</span>
                        <span className="text-[#2C2010]">{officer.ward || "All Wards"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5A3E] font-medium text-xs">Total Assigned</span>
                        <span className="text-[#2C2010] font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5A3E] font-medium text-xs">In Progress</span>
                        <span className="text-[#C8601A] font-medium">{stats.inProgress}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5A3E] font-medium text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Resolution Rate</span>
                        <span className={`font-bold text-sm ${resolutionRate >= 70 ? "text-[#1A6B1A]" : resolutionRate >= 40 ? "text-[#C8601A]" : "text-red-600"}`}>
                          {resolutionRate}%
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/supervisor/officer-analytics?id=${encodeURIComponent(officerId)}&name=${encodeURIComponent(officer.displayName || "Officer")}`}
                      className="w-full mt-4 btn-secondary py-2 text-sm justify-center border-[#C8601A]/30 hover:bg-transparent hover:border-[#C8601A]/30 text-[#C8601A] flex items-center"
                    >
                      View Analytics
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
