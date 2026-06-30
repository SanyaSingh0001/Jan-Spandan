"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToIssues, Issue, updateIssue } from "@/lib/firestore";
import { formatTimeAgo, categoryIcons, statusLabels, severityColors, severityLabels, categoryLabels } from "@/lib/utils";
import { Search, Loader2, Edit3, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";

const isIssueLocked = (status: string) => status === "closed" || status === "resolved";

export default function OfficerAssignedPage() {
  const { userProfile } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    // For officer, we show issues assigned to them
    const unsub = subscribeToIssues(setIssues, { assignedTo: userProfile.uid });
    return () => unsub();
  }, [userProfile]);

  useEffect(() => {
    let result = issues;
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (search) {
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.location.address.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [issues, statusFilter, search]);

  const handleStatusUpdate = async (issueId: string, newStatus: Issue['status'], currentStatus: Issue['status']) => {
    if (isIssueLocked(currentStatus)) {
      toast.error("This issue is closed and cannot be updated");
      return;
    }
    setUpdating(issueId);
    try {
      await updateIssue(issueId, { status: newStatus });
      toast.success("Issue status updated!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

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
          <h1 className="text-2xl font-bold mb-1">Assigned Issues</h1>
          <p className="text-[#6B5A3E] text-sm">Manage and update the issues assigned to you on the field</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "open", label: "New Tasks" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
            { value: "closed", label: "Closed ✅" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
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
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by title or location..."
          />
        </div>

        {/* Issues List */}
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center border-blue-500/10">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-[#6B5A3E]">No assigned issues found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filtered.map((issue, i) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Image / Icon */}
                    {issue.mediaUrls?.[0] ? (
                      <Link href={`/citizen/issue/${issue.id}`} className="block flex-shrink-0">
                        <img src={issue.mediaUrls[0]} alt="" className="w-24 h-24 rounded-xl object-cover" />
                      </Link>
                    ) : (
                      <Link href={`/citizen/issue/${issue.id}`} className="w-24 h-24 rounded-xl bg-[#FFFDF8] flex items-center justify-center text-4xl flex-shrink-0">
                        {categoryIcons[issue.category]}
                      </Link>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`badge badge-${issue.status}`}>{statusLabels[issue.status]}</span>
                        <span className="text-[#9C876A] text-xs">{categoryLabels[issue.category]}</span>
                        <span className={`text-xs font-medium ${severityColors[issue.severity]}`}>
                          {severityLabels[issue.severity]} Priority
                        </span>
                        {issue.aiCategory && (
                          <span className="text-xs text-purple-600 flex items-center gap-1">
                            🤖 AI Verified
                          </span>
                        )}
                      </div>
                      <Link href={`/citizen/issue/${issue.id}`}>
                        <h3 className="font-semibold text-lg hover:text-blue-400 transition-colors truncate">{issue.title}</h3>
                      </Link>
                      <p className="text-[#6B5A3E] text-sm mt-1 mb-2 line-clamp-2">{issue.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#9C876A]">
                        <span className="flex items-center gap-1"><MapPinIcon /> {issue.location.address}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(issue.createdAt)}</span>
                        <span>Reporter: {issue.reporterName}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 justify-end min-w-[140px]">
                      {!isIssueLocked(issue.status) && issue.status === "open" && (
                        <button
                          onClick={() => handleStatusUpdate(issue.id!, "in_progress", issue.status)}
                          disabled={updating === issue.id}
                          className="flex-1 btn-primary py-2 text-sm justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-500/20"
                        >
                          {updating === issue.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Start Work</>}
                        </button>
                      )}
                      
                      {!isIssueLocked(issue.status) && issue.status === "in_progress" && (
                        <button
                          onClick={() => handleStatusUpdate(issue.id!, "resolved", issue.status)}
                          disabled={updating === issue.id}
                          className="flex-1 btn-primary py-2 text-sm justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/20"
                        >
                          {updating === issue.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Resolve</>}
                        </button>
                      )}

                      {isIssueLocked(issue.status) && (
                        <div className="flex-1 py-2 text-sm text-center text-green-400 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center justify-center gap-1">
                           <CheckCircle className="w-4 h-4" /> {statusLabels[issue.status]}
                        </div>
                      )}

                      <Link
                        href={`/citizen/issue/${issue.id}`}
                        className="flex-1 btn-secondary py-2 text-sm justify-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
