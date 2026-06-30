"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToIssues, Issue } from "@/lib/firestore";
import { formatTimeAgo, categoryIcons, statusLabels, categoryLabels, severityColors, severityLabels } from "@/lib/utils";
import { Filter, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyReportsPage() {
  const { userProfile } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!userProfile) return;
    const unsub = subscribeToIssues((data) => {
      setIssues(data);
    }, { reportedBy: userProfile.uid });
    return () => unsub();
  }, [userProfile]);

  useEffect(() => {
    let result = issues;
    if (statusFilter !== "all") result = result.filter((i) => i.status === statusFilter);
    if (search) result = result.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()) || i.location.address.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [issues, statusFilter, search]);

  const statusCounts = {
    all: issues.length,
    open: issues.filter((i) => i.status === "open").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    closed: issues.filter((i) => i.status === "closed").length,
  };

  return (
    
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Reports</h1>
          <p className="text-[#6B5A3E]">Track all the issues you&apos;ve reported</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "open", label: "Open" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
            { value: "closed", label: "Closed ✅" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-orange-500 text-white"
                  : "bg-[#FFFDF8] text-[#6B5A3E] hover:bg-white"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">
                {statusCounts[tab.value as keyof typeof statusCounts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by title or location..."
          />
        </div>

        {/* Issues Grid */}
        {issues.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-[#6B5A3E] text-lg font-medium">No issues reported yet</p>
            <p className="text-[#9C876A] text-sm mt-1">Report your first community issue to see it here</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-[#6B5A3E]">No issues match this filter</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((issue, i) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/citizen/issue/${issue.id}`}>
                  <div className="glass-card p-5 hover:border-orange-500/30 cursor-pointer">
                    <div className="flex items-start gap-4">
                      {issue.mediaUrls?.[0] ? (
                        <img src={issue.mediaUrls[0]} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#FFFDF8] flex items-center justify-center text-3xl flex-shrink-0">
                          {categoryIcons[issue.category]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`badge badge-${issue.status}`}>{statusLabels[issue.status]}</span>
                          <span className="text-[#9C876A] text-xs">{categoryLabels[issue.category]}</span>
                          <span className={`text-xs font-medium ${severityColors[issue.severity]}`}>
                            {severityLabels[issue.severity]} Risk
                          </span>
                        </div>
                        <h3 className="font-semibold mb-1 truncate">{issue.title}</h3>
                        <p className="text-[#9C876A] text-sm truncate">📍 {issue.location.address}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#9C876A]">
                          <span>👍 {issue.upvotes?.length || 0}</span>
                          <span>💬 {issue.comments || 0}</span>
                          <span>{formatTimeAgo(issue.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    
  );
}
