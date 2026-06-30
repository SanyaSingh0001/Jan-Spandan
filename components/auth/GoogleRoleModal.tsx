"use client";

import { useState } from "react";
import { UserRole } from "@/lib/auth-context";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const roles = [
  {
    value: "citizen",
    label: "Citizen",
    hindiLabel: "नागरिक",
    icon: "👤",
    desc: "Report and track community issues",
  },
  {
    value: "officer",
    label: "Field Officer",
    hindiLabel: "क्षेत्र अधिकारी",
    icon: "👷",
    desc: "Handle assigned issues on ground",
  },
  {
    value: "supervisor",
    label: "Supervisor",
    hindiLabel: "पर्यवेक्षक",
    icon: "📊",
    desc: "Oversee officers and analytics",
  },
];

export function GoogleRoleModal({
  onSelect,
  isLoading,
  displayName,
}: {
  onSelect: (role: UserRole) => void;
  isLoading: boolean;
  displayName: string;
}) {
  const [selected, setSelected] = useState<UserRole>("citizen");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(44,32,16,0.45)", backdropFilter: "blur(6px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-2xl p-8 w-full max-w-md shadow-2xl border border-amber-200/60"
        style={{ background: "#FFFDF8" }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            🌟
          </div>
          <h2 className="text-2xl font-bold mb-1 text-[#2C2010]">Welcome, {displayName}!</h2>
          <p className="text-[#6B5A3E] text-sm">
            कृपया अपनी भूमिका चुनें • Please select your role
          </p>
          <div className="tricolor-bar w-24 mx-auto mt-3" />
        </div>

        <div className="space-y-3 mb-6">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelected(r.value as UserRole)}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                selected === r.value
                  ? "border-[#C8601A] bg-orange-50"
                  : "border-amber-200/50 bg-white/80 hover:border-amber-300"
              }`}
            >
              <span className="text-3xl flex-shrink-0">{r.icon}</span>
              <div>
                <div className="font-semibold text-sm text-[#2C2010]">
                  {r.label}{" "}
                  <span className="text-[#9C876A] font-normal text-xs">· {r.hindiLabel}</span>
                </div>
                <div className="text-[#6B5A3E] text-xs mt-0.5">{r.desc}</div>
              </div>
              {selected === r.value && (
                <div className="ml-auto w-5 h-5 rounded-full bg-[#C8601A] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {selected !== "citizen" && (
          <p className="text-amber-700/80 text-xs mb-4 flex items-center gap-1 px-1 bg-amber-50 rounded-lg py-2 border border-amber-200/60">
            ⚠️ Officer/Supervisor accounts require admin approval before access
          </p>
        )}

        <button
          onClick={() => onSelect(selected)}
          disabled={isLoading}
          className="w-full btn-primary justify-center py-3 text-base"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Continue as {roles.find((r) => r.value === selected)?.label}{" "}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
