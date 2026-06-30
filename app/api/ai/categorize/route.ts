import { NextRequest, NextResponse } from "next/server";
import { categorizeIssue } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { description, imageBase64, mimeType } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const result = await categorizeIssue(description, imageBase64, mimeType);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI categorization error:", error);
    return NextResponse.json(
      { error: "Failed to categorize issue" },
      { status: 500 }
    );
  }
}
