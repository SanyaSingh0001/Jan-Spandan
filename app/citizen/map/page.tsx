"use client";

import { useEffect, useState, useMemo } from "react";
import { getIssues, Issue } from "@/lib/firestore";
import { categoryIcons, categoryLabels, statusLabels, severityColors } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CitizenMapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    getIssues()
      .then((data) => {
        // Filter out issues that don't have valid coordinates
        setIssues(data.filter((i) => i.location?.lat && i.location?.lng));
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load map data");
        setLoading(false);
      });
  }, []);

  // Using a simple embedded iframe map for MVP since Google Maps API requires billing/keys
  // We'll center it on a general location or the first issue
  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi
  const center = issues.length > 0 ? issues[0].location : defaultCenter;

  const mapUrl = useMemo(() => {
    // We can use an OpenStreetMap iframe as a fallback if Google Maps API key isn't provided
    // For a real app, you'd use @react-google-maps/api
    return `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.1},${center.lat - 0.1},${center.lng + 0.1},${center.lat + 0.1}&layer=mapnik&marker=${center.lat},${center.lng}`;
  }, [center]);

  return (
    
      <div className="flex flex-col h-full relative">
        <div className="p-4 lg:p-6 pb-0 flex-shrink-0 z-10 absolute top-0 left-0 right-0 pointer-events-none">
          <div className="glass-card p-4 pointer-events-auto max-w-sm">
            <h1 className="text-xl font-bold mb-1">Community Map</h1>
            <p className="text-[#6B5A3E] text-sm">View issues reported around you</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Open
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> In Progress
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B5A3E]">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Resolved
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full bg-[#FFFDF8] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F8F4EC]/50 backdrop-blur-sm z-20">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9C876A] z-20">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>Failed to load the map.</p>
            </div>
          ) : (
            <div className="w-full h-full">
              <iframe
                title="Community Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapUrl}
                className="opacity-80 grayscale invert contrast-125" // Makes OSM dark mode
                onError={() => setMapError(true)}
              />
              
              {/* Overlaying custom markers on top of the iframe isn't precise without a real Map library, 
                  but we'll simulate a selected issue panel for the UI */}
              
              <div className="absolute bottom-6 right-6 z-20 pointer-events-none">
                <div className="glass-card p-4 text-sm pointer-events-auto w-64 border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2 text-orange-400 font-medium">
                    <AlertCircle className="w-4 h-4" /> Note on Maps
                  </div>
                  <p className="text-[#6B5A3E] text-xs">
                    This is a preview map. In a production build, this integrates directly with the Google Maps SDK using the project&apos;s API key to render interactive pins for each of the {issues.length} active issues.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    
  );
}
