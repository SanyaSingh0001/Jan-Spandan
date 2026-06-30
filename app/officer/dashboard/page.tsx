"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getIssues, Issue, updateIssue } from "@/lib/firestore";
import { categoryIcons, statusLabels, categoryLabels, severityColors, formatTimeAgo } from "@/lib/utils";
import { ClipboardList, Map, CheckCircle, AlertCircle, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const isIssueLocked = (status: string) => status === "closed" || status === "resolved";

export default function OfficerDashboard() {
  const { userProfile } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIssues = async () => {
    if (!userProfile) return;
    setRefreshing(true);
    try {
      // In a real app, we'd query by assignedTo == uid. For the hackathon demo,
      // we'll fetch all issues and let the officer pick them up, or filter if assigned.
      const data = await getIssues();
      // For demo: if they have assigned issues, show them. Otherwise show open issues in their ward (mocked).
      const myAssigned = data.filter(i => i.assignedTo === userProfile.uid);
      const openToPick = data.filter(i => i.status === "open" || i.status === "in_progress");
      
      setIssues(myAssigned.length > 0 ? myAssigned : openToPick);
    } catch {
      toast.error("Failed to fetch issues");
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [userProfile]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedIssue?.id || !userProfile) return;
    if (isIssueLocked(selectedIssue.status)) {
      toast.error("This issue is closed and cannot be updated");
      return;
    }
    if (status === "resolved" && !resolutionNote) {
      toast.error("Please provide a resolution note");
      return;
    }
    
    setUpdating(true);
    try {
      await updateIssue(selectedIssue.id, {
        status: status as any,
        assignedTo: userProfile.uid,
        assignedOfficerName: userProfile.displayName,
        ...(status === "resolved" ? { resolutionNote } : {})
      });
      toast.success(`Issue marked as ${statusLabels[status]}`);
      setSelectedIssue(null);
      setResolutionNote("");
      fetchIssues();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (dataLoading) {
    return <div className="flex h-full items-center justify-center"><div className="spinner w-10 h-10"/></div>;
  }

  const assignedCount = issues.filter(i => i.assignedTo === userProfile?.uid).length;
  const inProgressCount = issues.filter(i => i.assignedTo === userProfile?.uid && i.status === "in_progress").length;
  const resolvedCount = issues.filter(i => i.assignedTo === userProfile?.uid && i.status === "resolved").length;

  return (
    
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold">Officer Workspace 👷</h1>
            <p className="text-[#6B5A3E] text-sm mt-1">Manage and resolve community issues</p>
          </div>
          <button onClick={fetchIssues} disabled={refreshing} className="btn-secondary px-3 py-1.5 text-sm">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "My Assignments", val: assignedCount, icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "In Progress", val: inProgressCount, icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Resolved by Me", val: resolvedCount, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-5 border-amber-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6B5A3E] text-sm">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
              </div>
              <div className="text-3xl font-bold">{stat.val}</div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mt-8 mb-4">Issues Needing Attention</h2>
        {issues.filter(issue => issue.status !== "resolved" && issue.status !== "closed").length === 0 ? (
          <div className="glass-card p-12 text-center border-amber-200/60">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2 text-[#2C2010]">All caught up!</h3>
            <p className="text-[#6B5A3E] max-w-md mx-auto">There are no pending issues requiring your attention at the moment. Great job keeping the community safe!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {issues.filter(issue => issue.status !== "resolved" && issue.status !== "closed").map(issue => (
              <div key={issue.id} className="glass-card p-5 hover:border-blue-500/30 transition-colors">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] flex items-center justify-center text-2xl flex-shrink-0">
                    {categoryIcons[issue.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs">
                      <span className={`badge badge-${issue.status}`}>{statusLabels[issue.status]}</span>
                      <span className="text-[#9C876A]">{formatTimeAgo(issue.createdAt)}</span>
                      <span className={severityColors[issue.severity]}>{issue.severity >= 4 ? "🚨 High Priority" : ""}</span>
                    </div>
                    <h3 className="font-semibold text-sm truncate mb-1">{issue.title}</h3>
                    <p className="text-[#6B5A3E] text-xs truncate">📍 {issue.location.address}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 pt-4 border-t border-amber-200/60">
                  {!isIssueLocked(issue.status) ? (
                    <button 
                      onClick={() => setSelectedIssue(issue)}
                      className="btn-primary flex-1 justify-center py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/20"
                    >
                      Update Status
                    </button>
                  ) : (
                    <div className="flex-1 py-2 text-sm text-center text-green-400 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {statusLabels[issue.status]}
                    </div>
                  )}
                  <Link href={`/citizen/issue/${issue.id}`} className="btn-secondary flex-1 justify-center py-2 text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Modal */}
        <AnimatePresence>
          {selectedIssue && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFDF8] border border-amber-200/60 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-xl font-bold mb-4">Update Issue Status</h3>
                
                <div className="p-3 bg-[#FFFDF8] rounded-xl mb-5 text-sm">
                  <div className="font-medium">{selectedIssue.title}</div>
                  <div className="text-[#6B5A3E] text-xs mt-1">Current Status: {statusLabels[selectedIssue.status]}</div>
                </div>

                <div className="space-y-4">
                  {!isIssueLocked(selectedIssue.status) && selectedIssue.status !== "in_progress" && (
                    <button 
                      onClick={() => handleUpdateStatus("in_progress")}
                      disabled={updating}
                      className="w-full btn-secondary py-3 justify-center text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                    >
                      Mark as In Progress
                    </button>
                  )}
                  
                  {!isIssueLocked(selectedIssue.status) && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm text-[#6B5A3E]">Resolution Note (Required for Resolved)</label>
                        <textarea 
                          value={resolutionNote}
                          onChange={e => setResolutionNote(e.target.value)}
                          className="input-field resize-none"
                          rows={3}
                          placeholder="e.g., Pothole filled with asphalt on [Date]."
                        />
                      </div>

                      <button 
                        onClick={() => handleUpdateStatus("resolved")}
                        disabled={updating}
                        className="w-full btn-primary py-3 justify-center bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/20"
                      >
                        Mark as Resolved
                      </button>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="w-full mt-4 text-[#6B5A3E] hover:text-[#C8601A] text-sm py-2"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    
  );
}
