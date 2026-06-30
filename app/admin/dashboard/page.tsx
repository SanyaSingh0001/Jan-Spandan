"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAllUsers, updateUserRole } from "@/lib/firestore";
import { UserProfile } from "@/lib/auth-context";
import { Shield, Check, X, UserCog, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data as unknown as UserProfile[]);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (uid: string, role: string) => {
    setUpdating(uid);
    try {
      await updateUserRole(uid, role);
      toast.success(`${role} approved successfully`);
      fetchUsers();
    } catch {
      toast.error("Failed to approve user");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <DashboardLayout><div className="flex h-full items-center justify-center"><div className="spinner w-10 h-10"/></div></DashboardLayout>;

  const pendingUsers = users.filter(u => u.approved === false);
  const activeUsers = users.filter(u => u.approved !== false);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-red-400">Admin Control Panel 🛡️</h1>
          <p className="text-[#6B5A3E] text-sm mt-1">Manage users, roles, and system settings</p>
        </div>

        {/* Pending Approvals */}
        <div className="glass-card p-6 border-red-500/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Pending Role Approvals ({pendingUsers.length})
          </h2>
          
          {pendingUsers.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFDF8] rounded-xl border border-amber-200/60">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-[#6B5A3E] text-sm">No pending approvals. All caught up!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-amber-200/60 text-[#6B5A3E]">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Requested Role</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingUsers.map(user => (
                    <tr key={user.uid} className="group">
                      <td className="py-4 font-medium">{user.displayName}</td>
                      <td className="py-4 text-[#6B5A3E]">{user.email}</td>
                      <td className="py-4">
                        <span className={`badge ${user.role === "supervisor" ? "bg-transparent text-[#C8601A]" : "bg-blue-500/10 text-blue-400"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => handleApprove(user.uid, user.role)}
                          disabled={updating === user.uid}
                          className="btn-primary py-1.5 px-3 text-xs bg-gradient-to-r from-red-500 to-red-600 shadow-none disabled:opacity-50"
                        >
                          {updating === user.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve Role"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Users */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#6B5A3E]" />
            Active Users Directory
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200/60 text-[#6B5A3E]">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeUsers.map(user => (
                  <tr key={user.uid}>
                    <td className="py-4">
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-xs text-[#9C876A]">{user.email}</div>
                    </td>
                    <td className="py-4">
                      <span className={`badge ${
                        user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                        user.role === 'supervisor' ? 'bg-transparent text-[#C8601A]' :
                        user.role === 'officer' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-[#6B5A3E]">
                      {user.role === 'citizen' ? `${user.points} pts` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
