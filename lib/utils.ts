import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: unknown): string {
  if (!date) return "Unknown date";
  // Handle Firestore Timestamp
  if (typeof date === "object" && date !== null && "toDate" in date) {
    return (date as { toDate: () => Date }).toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (date instanceof Date) {
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return String(date);
}

export function formatTimeAgo(date: unknown): string {
  if (!date) return "Unknown";
  let d: Date;
  if (typeof date === "object" && date !== null && "toDate" in date) {
    d = (date as { toDate: () => Date }).toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    return String(date);
  }
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export const categoryLabels: Record<string, string> = {
  pothole: "Pothole",
  water_leakage: "Water Leakage",
  streetlight: "Street Light",
  waste: "Waste / Garbage",
  drainage: "Drainage",
  road_damage: "Road Damage",
  park: "Park / Garden",
  other: "Other",
};

export const categoryIcons: Record<string, string> = {
  pothole: "🕳️",
  water_leakage: "💧",
  streetlight: "💡",
  waste: "🗑️",
  drainage: "🌊",
  road_damage: "🚧",
  park: "🌳",
  other: "📋",
};

export const statusColors: Record<string, string> = {
  open: "bg-red-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

export const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const severityColors: Record<number, string> = {
  1: "text-green-400",
  2: "text-lime-400",
  3: "text-yellow-400",
  4: "text-orange-400",
  5: "text-red-400",
};

export const severityLabels: Record<number, string> = {
  1: "Minor",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Critical",
};

export const BADGE_THRESHOLDS = [
  { name: "First Reporter", icon: "🌱", minPoints: 10 },
  { name: "Community Voice", icon: "📢", minPoints: 50 },
  { name: "Active Citizen", icon: "⭐", minPoints: 100 },
  { name: "Change Maker", icon: "🏅", minPoints: 250 },
  { name: "Jan Spandan Hero", icon: "🌟", minPoints: 500 },
  { name: "City Champion", icon: "🏆", minPoints: 1000 },
];

export function getBadgesForPoints(points: number) {
  return BADGE_THRESHOLDS.filter((b) => points >= b.minPoints);
}
