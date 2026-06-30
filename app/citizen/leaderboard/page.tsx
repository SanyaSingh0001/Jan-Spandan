"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getLeaderboard } from "@/lib/firestore";
import { getBadgesForPoints, BADGE_THRESHOLDS } from "@/lib/utils";
import { Trophy, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardUser {
  id: string;
  displayName: string;
  points: number;
  badges?: string[];
  photoURL?: string;
}

export default function LeaderboardPage() {
  const { userProfile } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(20).then((data) => {
      setLeaders(data as LeaderboardUser[]);
      setLoading(false);
    });
  }, []);

  const myRank = leaders.findIndex((l) => l.id === userProfile?.uid) + 1;

  return (
    
      <div className="p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Community Leaderboard
          </h1>
          <p className="text-[#6B5A3E]">Top citizens making their communities better</p>
        </div>

        {/* Podium Top 3 */}
        {leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-4 py-6">
            {/* 2nd */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-400/20 border-4 border-gray-400/50 overflow-hidden flex items-center justify-center text-2xl mx-auto mb-2">
                {leaders[1]?.photoURL ? <img src={leaders[1].photoURL} alt="" className="w-full h-full object-cover" /> : leaders[1]?.displayName?.[0]}
              </div>
              <div className="font-semibold text-sm truncate max-w-24">{leaders[1]?.displayName}</div>
              <div className="text-[#6B5A3E] text-xs">{leaders[1]?.points?.toLocaleString()} pts</div>
              <div className="mt-2 bg-gray-400/20 h-16 rounded-t-lg flex items-center justify-center text-2xl">🥈</div>
            </motion.div>
            {/* 1st */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center -mb-4">
              <div className="text-3xl mb-1">👑</div>
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-4 border-yellow-500/50 overflow-hidden flex items-center justify-center text-3xl mx-auto mb-2">
                {leaders[0]?.photoURL ? <img src={leaders[0].photoURL} alt="" className="w-full h-full object-cover" /> : leaders[0]?.displayName?.[0]}
              </div>
              <div className="font-bold truncate max-w-28">{leaders[0]?.displayName}</div>
              <div className="text-yellow-400 text-sm font-semibold">{leaders[0]?.points?.toLocaleString()} pts</div>
              <div className="mt-2 bg-yellow-500/20 h-24 rounded-t-lg flex items-center justify-center text-3xl">🥇</div>
            </motion.div>
            {/* 3rd */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-700/20 border-4 border-orange-700/50 overflow-hidden flex items-center justify-center text-2xl mx-auto mb-2">
                {leaders[2]?.photoURL ? <img src={leaders[2].photoURL} alt="" className="w-full h-full object-cover" /> : leaders[2]?.displayName?.[0]}
              </div>
              <div className="font-semibold text-sm truncate max-w-24">{leaders[2]?.displayName}</div>
              <div className="text-[#6B5A3E] text-xs">{leaders[2]?.points?.toLocaleString()} pts</div>
              <div className="mt-2 bg-orange-700/20 h-10 rounded-t-lg flex items-center justify-center text-2xl">🥉</div>
            </motion.div>
          </div>
        )}

        {/* My Rank Banner */}
        {myRank > 0 && (
          <div className="glass-card p-4 flex items-center gap-4 border-orange-500/30">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg font-bold text-orange-400">
              #{myRank}
            </div>
            <div>
              <p className="font-semibold">Your Position</p>
              <p className="text-[#6B5A3E] text-sm">{userProfile?.points || 0} points · {getBadgesForPoints(userProfile?.points || 0).length} badges earned</p>
            </div>
          </div>
        )}

        {/* Full List */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>
        ) : (
          <div className="space-y-2">
            {leaders.map((user, i) => {
              const isMe = user.id === userProfile?.uid;
              const userBadges = getBadgesForPoints(user.points || 0);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isMe
                      ? "bg-orange-500/10 border-orange-500/30"
                      : "bg-[#FFFDF8] border-amber-200/60 hover:bg-white/8"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                    i === 1 ? "bg-gray-400/20 text-[#6B5A3E]" :
                    i === 2 ? "bg-orange-700/20 text-orange-700" :
                    "bg-white text-[#6B5A3E]"
                  }`}>
                    {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.photoURL
                      ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      : user.displayName?.[0]?.toUpperCase()
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-1">
                      {user.displayName}
                      {isMe && <span className="text-orange-400 text-xs">(You)</span>}
                    </div>
                    <div className="flex gap-1 mt-0.5">
                      {userBadges.slice(0, 3).map((badge) => (
                        <span key={badge.name} title={badge.name} className="text-xs">{badge.icon}</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-orange-400">{user.points?.toLocaleString("en-IN") || 0}</div>
                    <div className="text-[#9C876A] text-xs">points</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Badge Guide */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Badge Guide
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {BADGE_THRESHOLDS.map((badge) => (
              <div key={badge.name} className="flex items-center gap-2 p-2 rounded-lg bg-[#FFFDF8]">
                <span className="text-xl">{badge.icon}</span>
                <div>
                  <div className="text-xs font-medium">{badge.name}</div>
                  <div className="text-[#9C876A] text-xs">{badge.minPoints}+ points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
  );
}
