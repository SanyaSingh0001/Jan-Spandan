"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings, Shield, Bell, Database, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2 text-red-400">
            <Settings className="w-6 h-6" /> Platform Settings
          </h1>
          <p className="text-[#6B5A3E] text-sm">Configure global platform behavior and integrations</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="glass-card p-6 border-red-500/10">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-amber-200/60 pb-2">
              <Shield className="w-5 h-5 text-[#6B5A3E]" /> General & Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#FFFDF8] rounded-xl border border-amber-200/60">
                <div>
                  <h3 className="font-medium text-sm text-white">Require Email Verification</h3>
                  <p className="text-xs text-[#6B5A3E]">Force new users to verify their email before accessing features</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-red-500 cursor-pointer">
                  <span className="absolute left-7 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#FFFDF8] rounded-xl border border-amber-200/60">
                <div>
                  <h3 className="font-medium text-sm text-white">Auto-approve Citizens</h3>
                  <p className="text-xs text-[#6B5A3E]">Citizens are approved immediately without admin intervention</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-red-500 cursor-pointer">
                  <span className="absolute left-7 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="glass-card p-6 border-red-500/10">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-amber-200/60 pb-2">
              <Database className="w-5 h-5 text-[#C8601A]" /> AI & Integrations
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Gemini AI Strictness Level</label>
                <select className="input-field bg-[#FFFDF8] border-red-500/20">
                  <option>Balanced (Recommended)</option>
                  <option>High Strictness (Fewer false positives)</option>
                  <option>Lenient (Accepts ambiguous reports)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B5A3E] mb-1.5">Default Fallback Map Center (Lat, Lng)</label>
                <div className="flex gap-2">
                  <input type="text" defaultValue="28.6139" className="input-field border-red-500/20" />
                  <input type="text" defaultValue="77.2090" className="input-field border-red-500/20" />
                </div>
                <p className="text-xs text-[#9C876A] mt-1">Default coordinates (New Delhi) when user location is unknown.</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 border-red-500/10">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-amber-200/60 pb-2">
              <Bell className="w-5 h-5 text-blue-400" /> System Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#FFFDF8] rounded-xl border border-amber-200/60">
                <div>
                  <h3 className="font-medium text-sm text-white">Alert on Critical Issues</h3>
                  <p className="text-xs text-[#6B5A3E]">Send push notifications to all Supervisors when AI flags a severity 5 issue</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-red-500 cursor-pointer">
                  <span className="absolute left-7 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSave} className="btn-primary py-2.5 px-6 flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
