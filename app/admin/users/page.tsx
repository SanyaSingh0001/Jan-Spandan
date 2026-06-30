"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAllUsers, updateUserRole } from "@/lib/firestore";
import { UserProfile } from "@/lib/auth-context";
import { Search, Loader2, CheckCircle, Clock, ShieldAlert, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then((data) => {
        setUsers(data as unknown as UserProfile[]);
      })
      .catch(() => {
        toast.error("Failed to load users list");
      })
      .finally(() => setLoading(false));
  };

  const handleApprove = async (uid: string, role: string) => {
    setUpdating(uid);
    try {
      await updateUserRole(uid, role); // updateUserRole also sets approved: true
      toast.success("User approved successfully!");
      fetchUsers(); // Refresh the list
    } catch {
      toast.error("Failed to approve user");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = 
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    
    if (roleFilter === "all") return matchesSearch;
    if (roleFilter === "pending") return matchesSearch && !u.approved && u.role !== "citizen";
    return matchesSearch && u.role === roleFilter;
  });

  const getRoleStyle = (role: string) => {
    switch(role) {
      case "citizen": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "officer": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "supervisor": return "bg-transparent text-[#C8601A] border-[#C8601A]/30";
      case "admin": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-[#6B5A3E] border-gray-500/20";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-red-400">User Management</h1>
            <p className="text-[#6B5A3E] text-sm">Approve officer accounts and manage user roles across the platform</p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-xs text-red-400 font-semibold uppercase tracking-wider">Pending Approvals</div>
              <div className="text-lg font-bold text-[#2C2010] leading-none">
                {users.filter(u => !u.approved && u.role !== "citizen").length}
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
              placeholder="Search by name or email..."
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { value: "all", label: "All Users" },
              { value: "pending", label: "Pending" },
              { value: "officer", label: "Officers" },
              { value: "supervisor", label: "Supervisors" },
              { value: "citizen", label: "Citizens" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  roleFilter === tab.value
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-[#FFFDF8] text-[#6B5A3E] hover:bg-white border border-amber-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden border-red-500/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#6B5A3E] uppercase bg-[#FFFDF8] border-b border-amber-200/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                      <div className="text-4xl mb-2">👥</div>
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((user) => (
                      <motion.tr
                        key={user.uid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-amber-200/60 hover:bg-[#FFFDF8] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-[#2C2010] flex-shrink-0">
                              {user.displayName?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="font-semibold text-[#2C2010]">{user.displayName}</div>
                              <div className="text-xs text-[#9C876A]">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleStyle(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.approved ? (
                            <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#6B5A3E] text-xs">
                          {/* Formatting createdAt if available, otherwise just N/A */}
                          {user.createdAt && typeof user.createdAt === 'object' && 'seconds' in user.createdAt 
                            ? new Date((user.createdAt as any).seconds * 1000).toLocaleDateString() 
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!user.approved && user.role !== "citizen" && (
                              <button
                                onClick={() => handleApprove(user.uid, user.role)}
                                disabled={updating === user.uid}
                                className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                {updating === user.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3" /> Approve</>}
                              </button>
                            )}
                            <button className="p-1.5 text-[#9C876A] hover:text-[#C8601A] bg-[#FFFDF8] hover:bg-white rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
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
