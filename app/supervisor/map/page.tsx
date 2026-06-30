"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getIssues, Issue } from "@/lib/firestore";
import { Loader2, AlertCircle, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function SupervisorMapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // For supervisor map, we show all issues, similar to citizen map but with a purple theme
    getIssues()
      .then((data) => {
        setIssues(data.filter((i) => i.location?.lat && i.location?.lng));
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load map data");
        setLoading(false);
      });
  }, []);

  const defaultCenter = { lat: 28.6139, lng: 77.2090 };
  const center = issues.length > 0 ? issues[0].location : defaultCenter;

  const mapUrl = useMemo(() => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.1},${center.lat - 0.1},${center.lng + 0.1},${center.lat + 0.1}&layer=mapnik&marker=${center.lat},${center.lng}`;
  }, [center]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full relative">
        <div className="p-4 lg:p-6 pb-0 flex-shrink-0 z-10 absolute top-0 left-0 right-0 pointer-events-none">
          <div className="glass-card p-4 pointer-events-auto max-w-sm border-[#C8601A]/30 shadow-xl shadow-purple-500/10">
            <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C8601A]" /> Zone Map
            </h1>
            <p className="text-[#6B5A3E] text-sm">Strategic overview of all issues in your supervision zone</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical Priority
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> AI Verified
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full bg-[#FFFDF8] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F8F4EC]/50 backdrop-blur-sm z-20">
              <Loader2 className="w-8 h-8 text-[#C8601A] animate-spin" />
            </div>
          ) : mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9C876A] z-20">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>Failed to load the map.</p>
            </div>
          ) : (
            <div className="w-full h-full">
              <iframe
                title="Supervisor Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapUrl}
                className="opacity-90 grayscale invert contrast-125 hue-rotate-[240deg]" // Purple tinted dark mode
                onError={() => setMapError(true)}
              />
              
              <div className="absolute bottom-6 right-6 z-20 pointer-events-none">
                <div className="glass-card p-4 text-sm pointer-events-auto w-64 border-[#C8601A]/30 bg-[#FFFDF8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#C8601A]">Zone Status</span>
                    <span className="badge bg-[#C8601A]/10 text-[#C8601A] border-[#C8601A]/30">Live</span>
                  </div>
                  <div className="text-xs text-[#6B5A3E]">
                    Monitoring {issues.length} total issues across the zone.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
