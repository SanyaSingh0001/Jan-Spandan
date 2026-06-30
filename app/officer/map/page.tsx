"use client";

import { useEffect, useState, useMemo } from "react";
import { getIssues, Issue } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import { Loader2, AlertCircle, MapPin } from "lucide-react";
import { statusLabels } from "@/lib/utils";
import toast from "react-hot-toast";

export default function OfficerMapPage() {
  const { userProfile } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    getIssues({ assignedTo: userProfile.uid })
      .then((data) => {
        const withCoords = data.filter((i) => i.location?.lat && i.location?.lng);
        setIssues(withCoords);
        if (withCoords.length > 0) setSelectedId(withCoords[0].id || null);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load map data");
        setLoading(false);
      });
  }, [userProfile]);

  const defaultCenter = { lat: 28.6139, lng: 77.2090 };
  const selectedIssue = issues.find((i) => i.id === selectedId) || issues[0];
  const center = selectedIssue?.location || defaultCenter;

  const mapUrl = useMemo(() => {
    const pad = 0.05;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - pad},${center.lat - pad},${center.lng + pad},${center.lat + pad}&layer=mapnik&marker=${center.lat},${center.lng}`;
  }, [center.lat, center.lng]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-4 lg:p-6 pb-0 flex-shrink-0 z-10 absolute top-0 left-0 right-0 pointer-events-none">
        <div className="glass-card p-4 pointer-events-auto max-w-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
          <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" /> Area Map
          </h1>
          <p className="text-[#6B5A3E] text-sm">View issues assigned to you in your ward</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> New Assignments
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> In Progress
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full bg-[#FFFDF8] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F8F4EC]/50 backdrop-blur-sm z-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : issues.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9C876A] z-20">
            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>No assigned issues with location data yet.</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <iframe
              key={mapUrl}
              title="Officer Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              className="opacity-90 grayscale invert contrast-125 sepia-[.3] hue-rotate-[180deg]"
            />

            <div className="absolute bottom-6 left-6 right-6 lg:right-auto z-20 pointer-events-none">
              <div className="glass-card p-4 pointer-events-auto w-full lg:w-80 border-blue-500/20 bg-[#FFFDF8] max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-blue-400 text-sm">Assigned Issues ({issues.length})</span>
                  <span className="badge bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">Live</span>
                </div>
                <div className="space-y-2">
                  {issues.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => setSelectedId(issue.id || null)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                        selectedId === issue.id
                          ? "bg-blue-500/20 border border-blue-500/40"
                          : "bg-[#FFFDF8] border border-transparent hover:bg-white"
                      }`}
                    >
                      <div className="font-medium truncate">{issue.title}</div>
                      <div className="text-[#9C876A] truncate mt-0.5">📍 {issue.location.address}</div>
                      <div className="text-[#9C876A] mt-1">{statusLabels[issue.status]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
