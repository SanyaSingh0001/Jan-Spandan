import { NextRequest, NextResponse } from "next/server";
import { generatePredictiveInsights } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const insightsRaw = await generatePredictiveInsights(data);
    
    // generatePredictiveInsights returns a raw JSON string — parse it into array
    let insights;
    try {
      const parsed = JSON.parse(insightsRaw);
      // Normalize: gemini may return {title, insight, action} but frontend expects {title, desc, type}
      insights = (Array.isArray(parsed) ? parsed : [parsed]).map((item: { title?: string; insight?: string; desc?: string; description?: string; action?: string; type?: string }) => ({
        title: item.title || "Insight",
        insight: item.insight || item.desc || item.description || "No details available.",
        action: item.action || "Review and take appropriate action.",
        type: item.type || (item.title?.toLowerCase().includes("hotspot") || item.title?.toLowerCase().includes("alert") ? "warning" : item.title?.toLowerCase().includes("allocat") || item.title?.toLowerCase().includes("action") ? "action" : "success"),
      }));
    } catch {
      // fallback if parsing fails
      insights = [
        { title: "Analysis Complete", desc: insightsRaw.substring(0, 200), type: "success" }
      ];
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { insights: [{ title: "Data Unavailable", desc: "Could not generate AI insights at this time.", type: "warning" }] },
      { status: 200 }
    );
  }
}
