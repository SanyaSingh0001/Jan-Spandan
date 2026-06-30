"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToIssues, getStats, Issue } from "@/lib/firestore";
import { formatTimeAgo, categoryIcons, statusLabels, statusColors, getBadgesForPoints } from "@/lib/utils";
import {
  PlusCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
  Flame,
  Star,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CitizenDashboard() {
  const { userProfile } = useAuth();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, open: 0, citizens: 0 });

  useEffect(() => {
    if (!userProfile) return;
    const unsub = subscribeToIssues((data) => {
      setMyIssues(data);
    }, { reportedBy: userProfile.uid });
    getStats().then(setStats);
    return () => unsub();
  }, [userProfile]);

  const myResolved = myIssues.filter((i) => i.status === "resolved").length;
  const myOpen = myIssues.filter((i) => i.status === "open").length;
  const myInProgress = myIssues.filter((i) => i.status === "in_progress").length;
  const badges = getBadgesForPoints(userProfile?.points || 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, <span className="gradient-text">{userProfile?.displayName?.split(" ")[0] || "Citizen"}</span> 👋
            </h1>
            <p className="text-[#6B5A3E] mt-1">Here&apos;s what&apos;s happening in your community</p>
          </div>
          <Link href="/citizen/report" className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "My Reports", value: myIssues.length, icon: FileText, color: "from-orange-500/20 to-orange-600/10", border: "border-orange-500/20", iconColor: "text-orange-400" },
            { label: "Resolved", value: myResolved, icon: CheckCircle, color: "from-green-500/20 to-green-600/10", border: "border-green-500/20", iconColor: "text-green-400" },
            { label: "In Progress", value: myInProgress, icon: Clock, color: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-500/20", iconColor: "text-yellow-400" },
            { label: "My Points", value: userProfile?.points || 0, icon: Star, color: "from-purple-500/20 to-purple-600/10", border: "border-purple-600/30", iconColor: "text-purple-600" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`stat-card bg-gradient-to-br ${stat.color} border ${stat.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#6B5A3E] text-sm">{stat.label}</p>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <p className="text-3xl font-bold">{stat.value.toLocaleString("en-IN")}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Issues */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                My Recent Reports
              </h2>
              <Link href="/citizen/my-reports" className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {myIssues.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-[#6B5A3E] mb-4">You haven&apos;t reported any issues yet.</p>
                <Link href="/citizen/report" className="btn-primary">
                  <PlusCircle className="w-4 h-4" />
                  Report First Issue
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myIssues.slice(0, 5).map((issue) => (
                  <Link key={issue.id} href={`/citizen/issue/${issue.id}`}>
                    <div className="glass-card p-4 hover:border-orange-500/30 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{categoryIcons[issue.category] || "📋"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`badge badge-${issue.status}`}>
                              {statusLabels[issue.status]}
                            </span>
                            <span className="text-[#9C876A] text-xs">{formatTimeAgo(issue.createdAt)}</span>
                          </div>
                          <p className="font-medium text-sm truncate">{issue.title}</p>
                          <p className="text-[#9C876A] text-xs mt-1 truncate">📍 {issue.location.address}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[#9C876A] text-xs">👍 {issue.upvotes?.length || 0}</span>
                          <span className="text-[#9C876A] text-xs">💬 {issue.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Your Badges
              </h3>
              {badges.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[#9C876A] text-sm">Report issues to earn badges!</p>
                  <div className="text-4xl mt-2">🌱</div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <div key={badge.name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs">
                      <span>{badge.icon}</span>
                      <span className="text-yellow-300 font-medium">{badge.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-amber-200/60">
                <div className="flex justify-between text-xs text-[#9C876A] mb-1.5">
                  <span>Progress to next badge</span>
                  <span>{userProfile?.points || 0} pts</span>
                </div>
                <div className="w-full bg-[#FFFDF8] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(((userProfile?.points || 0) % 100) / 100 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Community Impact
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Total Issues", value: stats.total, color: "text-[#2C2010]" },
                  { label: "Resolved", value: stats.resolved, color: "text-green-400" },
                  { label: "In Progress", value: stats.inProgress, color: "text-yellow-400" },
                  { label: "Active Citizens", value: stats.citizens, color: "text-blue-400" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-[#6B5A3E] text-sm">{s.label}</span>
                    <span className={`font-bold ${s.color}`}>{s.value.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Report New Issue", href: "/citizen/report", icon: "🚨" },
                  { label: "View Community Map", href: "/citizen/map", icon: "🗺️" },
                  { label: "Check Leaderboard", href: "/citizen/leaderboard", icon: "🏆" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FFFDF8] cursor-pointer group transition-all">
                      <span className="text-lg">{action.icon}</span>
                      <span className="text-sm text-[#6B5A3E] group-hover:text-[#C8601A] flex-1">{action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9C876A] group-hover:text-orange-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
