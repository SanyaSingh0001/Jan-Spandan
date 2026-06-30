"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getIssue, addComment, getComments, upvoteIssue, addPointsToUser, Issue } from "@/lib/firestore";
import { formatTimeAgo, categoryIcons, categoryLabels, statusLabels, severityLabels, severityColors } from "@/lib/utils";
import { ThumbsUp, MessageSquare, Send, ArrowLeft, Clock, User, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const statusSteps = [
  { key: "reported", label: "Reported", icon: "🚨" },
  { key: "ai_verified", label: "AI Verified", icon: "🤖" },
  { key: "assigned", label: "Officer Assigned", icon: "👷" },
  { key: "in_progress", label: "In Progress", icon: "⚙️" },
  { key: "resolved", label: "Resolved", icon: "✅" },
];

const statusToStep: Record<string, number> = {
  open: 1,
  in_progress: 3,
  resolved: 4,
  closed: 4,
};

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userProfile } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Array<{ id: string; text: string; displayName: string; createdAt: unknown }>>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    getIssue(id).then((data) => { setIssue(data); setLoading(false); });
    getComments(id).then((c) => setComments(c as typeof comments));
  }, [id]);

  const handleUpvote = async () => {
    if (!issue?.id || !userProfile) return;
    await upvoteIssue(issue.id, userProfile.uid, issue.upvotes || []);
    // Refresh
    const updated = await getIssue(issue.id);
    setIssue(updated);
    // Points for first upvote
    if (!issue.upvotes?.includes(userProfile.uid)) {
      await addPointsToUser(userProfile.uid, 2);
      toast.success("+2 points for verifying!");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !issue?.id || !userProfile) return;
    setSubmittingComment(true);
    try {
      await addComment(issue.id, {
        text: commentText,
        uid: userProfile.uid,
        displayName: userProfile.displayName,
      });
      setCommentText("");
      // Re-fetch comments
      const updated = await getComments(issue.id);
      setComments(updated as typeof comments);
      // Add points for engagement
      await addPointsToUser(userProfile.uid, 1);
      toast.success("Comment added! +1 point");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const currentStep = statusToStep[issue?.status || "open"];
  const isUpvoted = issue?.upvotes?.includes(userProfile?.uid || "");

  if (loading) return (
    
      <div className="flex items-center justify-center h-full"><div className="spinner w-10 h-10" /></div>
    
  );

  if (!issue) return (
    
      <div className="p-8 text-center"><p className="text-[#6B5A3E]">Issue not found</p></div>
    
  );

  return (
    
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-[#6B5A3E] hover:text-[#C8601A] text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{categoryIcons[issue.category]}</span>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`badge badge-${issue.status}`}>{statusLabels[issue.status]}</span>
                  <span className="text-[#6B5A3E] text-sm">{categoryLabels[issue.category]}</span>
                  <span className={`text-sm font-medium ${severityColors[issue.severity]}`}>
                    Severity: {severityLabels[issue.severity]}
                  </span>
                </div>
                <h1 className="text-xl font-bold">{issue.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isUpvoted
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                    : "bg-[#FFFDF8] border-amber-200/60 text-[#6B5A3E] hover:border-orange-500/30 hover:text-orange-400"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="font-semibold">{issue.upvotes?.length || 0}</span>
              </button>
            </div>
          </div>

          <p className="text-[#6B5A3E] leading-relaxed">{issue.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-[#FFFDF8] rounded-xl">
              <div className="text-[#9C876A] text-xs mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Reported by</div>
              <div className="font-medium">{issue.reporterName}</div>
            </div>
            <div className="p-3 bg-[#FFFDF8] rounded-xl">
              <div className="text-[#9C876A] text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Reported</div>
              <div className="font-medium">{formatTimeAgo(issue.createdAt)}</div>
            </div>
            <div className="p-3 bg-[#FFFDF8] rounded-xl col-span-2 sm:col-span-1">
              <div className="text-[#9C876A] text-xs mb-1">📍 Location</div>
              <div className="font-medium text-xs">{issue.location.address}</div>
            </div>
          </div>

          {/* Media */}
          {issue.mediaUrls && issue.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {issue.mediaUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden aspect-video bg-[#F5EEDC] block hover:opacity-90 transition-opacity">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* AI Analysis */}
        {issue.aiCategory && (
          <div className="glass-card p-5 border-[#C8601A]/20 bg-[#C8601A]/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-[#C8601A]">
              🤖 AI Analysis (Gemini)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {issue.aiCategory && <div><span className="text-[#9C876A] text-xs block">Category</span><span className="font-medium text-[#2C2010]">{issue.aiCategory}</span></div>}
              {issue.aiDepartment && <div><span className="text-[#9C876A] text-xs block">Department</span><span className="font-medium text-[#2C2010]">{issue.aiDepartment}</span></div>}
              {issue.aiSeverity && <div><span className="text-[#9C876A] text-xs block">AI Severity</span><span className="font-medium text-[#2C2010]">{severityLabels[issue.aiSeverity]}</span></div>}
              {issue.estimatedResolution && <div><span className="text-[#9C876A] text-xs block">Est. Resolution</span><span className="text-[#1A6B1A] font-medium">{issue.estimatedResolution}</span></div>}
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-5">Issue Progress</h3>
          <div className="space-y-3">
            {statusSteps.map((step, i) => {
              const done = i <= currentStep;
              const current = i === currentStep;
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                    done ? "bg-green-500 text-white" : "bg-white text-[#9C876A]"
                  } ${current ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900" : ""}`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${done ? "text-[#2C2010]" : "text-[#9C876A]"}`}>
                      {step.icon} {step.label}
                    </span>
                  </div>
                  {done && <span className="text-[#1A6B1A] text-xs">✓</span>}
                </div>
              );
            })}
          </div>

          {issue.assignedOfficerName && (
            <div className="mt-4 pt-4 border-t border-amber-200/60 text-sm">
              <span className="text-[#9C876A]">Assigned Officer: </span>
              <span className="font-medium">👷 {issue.assignedOfficerName}</span>
            </div>
          )}
          {issue.resolutionNote && (
            <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <p className="text-green-400 text-xs font-semibold mb-1">Resolution Note</p>
              <p className="text-[#6B5A3E] text-sm">{issue.resolutionNote}</p>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Community Discussion ({comments.length})
          </h3>

          <div className="space-y-3 mb-5">
            {comments.length === 0 ? (
              <p className="text-[#9C876A] text-sm text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {c.displayName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-[#FFFDF8] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.displayName}</span>
                      <span className="text-[#9C876A] text-xs">{formatTimeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-[#6B5A3E] text-sm">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input — visible to all signed-in users */}
          {userProfile ? (
            <form onSubmit={handleComment} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 overflow-hidden flex items-center justify-center text-sm font-bold flex-shrink-0">
                {userProfile?.photoURL
                  ? <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                  : userProfile?.displayName?.[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Share your view on this issue..."
                />
                <button type="submit" disabled={submittingComment || !commentText.trim()} className="btn-primary px-4 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 border border-amber-200/60 rounded-xl bg-white/3">
              <p className="text-[#6B5A3E] text-sm">
                <a href="/auth/login" className="text-orange-400 hover:underline font-medium">Sign in</a> to join the community discussion
              </p>
            </div>
          )}
        </div>
      </div>
    
  );
}
