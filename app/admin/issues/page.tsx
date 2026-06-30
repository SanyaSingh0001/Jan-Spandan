"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getIssues, Issue, updateIssue, getOfficers } from "@/lib/firestore";
import { UserProfile } from "@/lib/auth-context";
import { categoryLabels, statusLabels, severityColors, formatTimeAgo, severityLabels } from "@/lib/utils";
import { Search, Loader2, Filter, AlertTriangle, Shield, CheckCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [officers, setOfficers] = useState<{uid: string, name: string}[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [validating, setValidating] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getIssues(),
      getOfficers()
    ]).then(([issuesData, officersData]) => {
      setIssues(issuesData);
      setOfficers((officersData as unknown as UserProfile[]).map(o => ({ uid: o.uid || (o as any).id, name: o.displayName || 'Unknown' })));
      setLoading(false);
    }).catch(() => {
      toast.error("Failed to load data");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = issues;
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === statusFilter);
    }
    if (search) {
      result = result.filter(i => 
        i.title.toLowerCase().includes(search.toLowerCase()) || 
        i.location.address.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [issues, search, statusFilter]);

  const handleAssign = async (issueId: string, officerId: string) => {
    if (!officerId) return;
    setAssigning(issueId);
    try {
      const officer = officers.find(o => o.uid === officerId);
      await updateIssue(issueId, { 
        assignedTo: officerId,
        assignedOfficerName: officer?.name,
        status: "open" // Assuming assignment means it's ready to be worked on
      });
      toast.success(`Assigned to ${officer?.name}`);
      // Refresh local state
      setIssues(issues.map(i => i.id === issueId ? { ...i, assignedTo: officerId, assignedOfficerName: officer?.name, status: "open" } : i));
    } catch {
      toast.error("Failed to assign officer");
    } finally {
      setAssigning(null);
    }
  };

  const handleValidateClose = async (issueId: string) => {
    setValidating(issueId);
    try {
      await updateIssue(issueId, { status: "closed" });
      toast.success("Issue Validated & Closed");
      setIssues(issues.map(i => i.id === issueId ? { ...i, status: "closed" } : i));
    } catch {
      toast.error("Failed to close issue");
    } finally {
      setValidating(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-red-400 flex items-center gap-2">
              <Shield className="w-6 h-6" /> Platform Issues
            </h1>
            <p className="text-[#6B5A3E] text-sm">Master view of all reported issues. Assign to field officers.</p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-xs text-red-400 font-semibold uppercase tracking-wider">Unassigned</div>
              <div className="text-lg font-bold text-[#2C2010] leading-none">
                {issues.filter(i => !i.assignedTo && i.status !== 'resolved' && i.status !== 'closed').length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 border-red-500/10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C876A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 border-red-500/20 focus:border-red-500"
              placeholder="Search issues or locations..."
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-[#9C876A] mr-2" />
            {["all", "open", "in_progress", "resolved", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-[#FFFDF8] text-[#6B5A3E] hover:bg-white border border-amber-200/60"
                }`}
              >
                {status === "all" ? "All" : statusLabels[status as keyof typeof statusLabels]}
              </button>
            ))}
          </div>
        </div>

        {/* Issues List */}
        <div className="glass-card overflow-hidden border-red-500/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#6B5A3E] uppercase bg-[#FFFDF8] border-b border-amber-200/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">Issue Details</th>
                  <th className="px-6 py-4 font-semibold">Status & Severity</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Reported</th>
                  <th className="px-6 py-4 font-semibold text-right min-w-[200px]">Assignment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#6B5A3E]">
                      <div className="text-4xl mb-2">📋</div>
                      No issues found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((issue) => (
                      <motion.tr
                        key={issue.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-amber-200/60 hover:bg-[#FFFDF8] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#2C2010] mb-1 truncate max-w-xs" title={issue.title}>
                            {issue.title}
                          </div>
                          <div className="text-xs text-[#6B5A3E]">
                            {categoryLabels[issue.category]}
                          </div>
                        </td>
                        <td className="px-6 py-4 space-y-2">
                          <div><span className={`badge badge-${issue.status}`}>{statusLabels[issue.status]}</span></div>
                          <div><span className={`text-xs font-semibold ${severityColors[issue.severity]}`}>{severityLabels[issue.severity]}</span></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-[#6B5A3E] max-w-xs truncate" title={issue.location.address}>
                            {issue.location.address}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-[#6B5A3E]">{formatTimeAgo(issue.createdAt)}</div>
                          <div className="text-xs text-[#9C876A]">{issue.reporterName}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {issue.status === 'closed' ? (
                            <span className="text-xs text-[#9C876A] bg-[#FFFDF8] px-3 py-1 rounded-full">Closed</span>
                          ) : issue.status === 'resolved' ? (
                            <button
                                onClick={() => handleValidateClose(issue.id!)}
                                disabled={validating === issue.id}
                                className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 text-xs flex items-center justify-center gap-1 ml-auto transition-colors"
                            >
                                {validating === issue.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Validate & Close
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {assigning === issue.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-400 mr-2" />
                              ) : (
                                <select
                                  value={issue.assignedTo || ""}
                                  onChange={(e) => handleAssign(issue.id!, e.target.value)}
                                  className="bg-[#FFFDF8] border border-amber-200/60 text-white text-xs rounded-lg px-2 py-1.5 focus:border-red-500 outline-none w-36"
                                >
                                  <option value="" disabled className="bg-[#FFFDF8]">Unassigned</option>
                                  {officers.map(o => (
                                    <option key={o.uid} value={o.uid} className="bg-[#FFFDF8]">{o.name}</option>
                                  ))}
                                </select>
                              )}
                              {issue.assignedTo && <CheckCircle className="w-4 h-4 text-green-400" />}
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
