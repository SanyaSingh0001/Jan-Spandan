import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AICategorizationResult {
  category: string;
  severity: number;
  department: string;
  estimatedResolution: string;
  summary: string;
  priorityReason: string;
}

const VALID_CATEGORIES = [
  "pothole",
  "water_leakage",
  "streetlight",
  "waste",
  "drainage",
  "road_damage",
  "park",
  "other",
] as const;

type IssueCategory = (typeof VALID_CATEGORIES)[number];

const CATEGORY_ALIASES: Record<string, IssueCategory> = {
  pothole: "pothole",
  potholes: "pothole",
  hole: "pothole",
  crater: "pothole",
  water_leakage: "water_leakage",
  water_leak: "water_leakage",
  leakage: "water_leakage",
  pipe: "water_leakage",
  burst: "water_leakage",
  streetlight: "streetlight",
  street_light: "streetlight",
  light: "streetlight",
  lamp: "streetlight",
  lighting: "streetlight",
  waste: "waste",
  garbage: "waste",
  trash: "waste",
  rubbish: "waste",
  litter: "waste",
  sanitation: "waste",
  drainage: "drainage",
  drain: "drainage",
  sewer: "drainage",
  flooding: "drainage",
  road_damage: "road_damage",
  road: "road_damage",
  pavement: "road_damage",
  sidewalk: "road_damage",
  crack: "road_damage",
  park: "park",
  garden: "park",
  playground: "park",
  other: "other",
};

const DEPARTMENT_MAP: Record<IssueCategory, string> = {
  pothole: "Roads & Infrastructure",
  water_leakage: "Water Supply",
  streetlight: "Electricity Board",
  waste: "Sanitation",
  drainage: "Drainage & Sewerage",
  road_damage: "Roads & Infrastructure",
  park: "Parks & Recreation",
  other: "Municipal Corporation",
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return match ? match[0] : text;
}

export function normalizeCategory(raw: unknown): IssueCategory {
  if (typeof raw !== "string" || !raw.trim()) return "other";

  const normalized = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  if (VALID_CATEGORIES.includes(normalized as IssueCategory)) {
    return normalized as IssueCategory;
  }

  if (CATEGORY_ALIASES[normalized]) return CATEGORY_ALIASES[normalized];

  for (const [alias, category] of Object.entries(CATEGORY_ALIASES)) {
    if (normalized.includes(alias)) return category;
  }

  return "other";
}

export function keywordCategorize(description: string): AICategorizationResult {
  const text = description.toLowerCase();

  const rules: { category: IssueCategory; keywords: string[]; severity: number }[] = [
    { category: "pothole", keywords: ["pothole", "pot hole", "hole in road", "crater", "broken road"], severity: 4 },
    { category: "water_leakage", keywords: ["water leak", "leakage", "pipe burst", "water pipe", "seepage", "overflowing water"], severity: 4 },
    { category: "streetlight", keywords: ["street light", "streetlight", "lamp post", "light pole", "dark street", "broken light"], severity: 3 },
    { category: "waste", keywords: ["garbage", "trash", "waste", "rubbish", "dump", "litter", "sanitation", "bin"], severity: 3 },
    { category: "drainage", keywords: ["drain", "drainage", "sewer", "blocked drain", "waterlogging", "flooded"], severity: 4 },
    { category: "road_damage", keywords: ["road damage", "cracked road", "broken pavement", "damaged road", "footpath"], severity: 4 },
    { category: "park", keywords: ["park", "garden", "playground", "green space", "bench"], severity: 2 },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return {
        category: rule.category,
        severity: rule.severity,
        department: DEPARTMENT_MAP[rule.category],
        estimatedResolution: rule.severity >= 4 ? "2-5 days" : "1-2 weeks",
        summary: description.substring(0, 100),
        priorityReason: `Matched keywords for ${rule.category.replace(/_/g, " ")}`,
      };
    }
  }

  return {
    category: "other",
    severity: 3,
    department: DEPARTMENT_MAP.other,
    estimatedResolution: "1-2 weeks",
    summary: description.substring(0, 100),
    priorityReason: "Could not confidently match a specific category",
  };
}

function normalizeResult(
  parsed: Partial<AICategorizationResult>,
  description: string
): AICategorizationResult {
  const category = normalizeCategory(parsed.category);
  const keywordFallback = keywordCategorize(description);
  const severity = Math.min(5, Math.max(1, Number(parsed.severity) || keywordFallback.severity));

  return {
    category: category === "other" && parsed.category ? keywordFallback.category : category,
    severity,
    department: parsed.department || DEPARTMENT_MAP[category] || keywordFallback.department,
    estimatedResolution: parsed.estimatedResolution || keywordFallback.estimatedResolution,
    summary: parsed.summary || keywordFallback.summary,
    priorityReason: parsed.priorityReason || keywordFallback.priorityReason,
  };
}

export async function categorizeIssue(
  description: string,
  imageBase64?: string,
  mimeType = "image/jpeg"
): Promise<AICategorizationResult> {
  const keywordFallback = keywordCategorize(description);

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY missing — using keyword categorization");
    return keywordFallback;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are an AI assistant for a community issue reporting platform in India. Analyze the issue description${imageBase64 ? " and attached photo" : ""} and categorize it accurately.

Issue Description: "${description}"

Respond with JSON only using these exact fields:
{
  "category": one of ["pothole", "water_leakage", "streetlight", "waste", "drainage", "road_damage", "park", "other"],
  "severity": number 1-5,
  "department": responsible municipal department,
  "estimatedResolution": e.g. "2-3 days",
  "summary": one-line summary max 100 chars,
  "priorityReason": why this severity was assigned max 150 chars
}

Important:
- If the photo shows potholes, garbage, broken lights, water leaks, or road damage, choose the matching category — do NOT default to "other".
- Prefer the most specific category visible in the image.`;

  try {
    let result;
    if (imageBase64) {
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: imageBase64,
          },
        },
      ]);
    } else {
      result = await model.generateContent(prompt);
    }

    const text = result.response.text().trim();
    const jsonText = extractJson(text);
    const parsed = JSON.parse(jsonText) as Partial<AICategorizationResult>;
    const normalized = normalizeResult(parsed, description);

    if (normalized.category === "other" && keywordFallback.category !== "other") {
      return { ...normalized, category: keywordFallback.category, priorityReason: keywordFallback.priorityReason };
    }

    return normalized;
  } catch (error) {
    console.error("Gemini categorize error:", error);
    return keywordFallback;
  }
}

export async function generatePredictiveInsights(issuesData: {
  totalIssues: number;
  resolvedIssues: number;
  closedIssues?: number;
  openIssues?: number;
  inProgressIssues?: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown?: Record<string, number>;
  highSeverityCount?: number;
  avgSeverity?: number;
  topCategories?: Array<{ category: string; count: number; pct: number }>;
}): Promise<string> {
  const resolutionRate =
    issuesData.totalIssues > 0
      ? ((issuesData.resolvedIssues / issuesData.totalIssues) * 100).toFixed(1)
      : "0";

  const topCategory = Object.entries(issuesData.categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
  const topCategoryLabel = topCategory ? topCategory[0].replace(/_/g, " ") : "mixed categories";

  const fallback = JSON.stringify([
    {
      title: "Resolution Pipeline Analysis",
      insight: `Out of ${issuesData.totalIssues} reported issues, ${issuesData.resolvedIssues} are resolved (${resolutionRate}%). ${issuesData.openIssues ?? 0} remain open and ${issuesData.inProgressIssues ?? 0} are actively being worked on. Backlog pressure is ${Number(resolutionRate) < 50 ? "high" : "moderate"}.`,
      action: "Reassign idle officers to open high-severity tickets and set 48-hour SLA targets for the top 3 wards.",
    },
    {
      title: `${topCategoryLabel.charAt(0).toUpperCase() + topCategoryLabel.slice(1)} Hotspot Detected`,
      insight: `${topCategoryLabel} accounts for ${topCategory ? topCategory[1] : 0} reports (${issuesData.totalIssues > 0 ? ((topCategory?.[1] || 0) / issuesData.totalIssues * 100).toFixed(0) : 0}% of total). ${issuesData.highSeverityCount ?? 0} issues are high-severity (4-5), indicating safety-critical infrastructure gaps.`,
      action: "Schedule preventive maintenance patrols and allocate dedicated field crew for recurring complaint zones this week.",
    },
    {
      title: "Resource Allocation Forecast",
      insight: `Current workload ratio suggests ${issuesData.inProgressIssues ?? 0} active cases vs ${issuesData.openIssues ?? 0} unassigned. ${Number(issuesData.avgSeverity ?? 3) >= 4 ? "Severity trend is elevated — prioritize emergency response." : "Severity is within normal range but trending requires monitoring."}`,
      action: "Deploy additional officers to categories with >20% share and enable supervisor escalation for tickets open >7 days.",
    },
    {
      title: "Citizen Engagement Outlook",
      insight: `Community reporting velocity is ${issuesData.totalIssues >= 10 ? "active" : "building up"}. Resolution rate of ${resolutionRate}% ${Number(resolutionRate) >= 70 ? "builds citizen trust" : "may reduce future reporting if not improved"}.`,
      action: "Publish weekly resolution digest to citizens and reward reporters whose issues were resolved within SLA.",
    },
  ]);

  if (!process.env.GEMINI_API_KEY) {
    return fallback;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are a senior civic intelligence analyst for an Indian municipal corporation (Smart City mission). Analyze the community issue data and produce exactly 4 predictive insights for supervisors.

DATA SNAPSHOT:
- Total Issues: ${issuesData.totalIssues}
- Resolved: ${issuesData.resolvedIssues}
- Closed: ${issuesData.closedIssues ?? 0}
- Open (unassigned/pending): ${issuesData.openIssues ?? 0}
- In Progress: ${issuesData.inProgressIssues ?? 0}
- Resolution Rate: ${resolutionRate}%
- High Severity (4-5): ${issuesData.highSeverityCount ?? 0}
- Average Severity: ${(issuesData.avgSeverity ?? 3).toFixed(1)}/5
- Category Breakdown: ${JSON.stringify(issuesData.categoryBreakdown)}
- Status Breakdown: ${JSON.stringify(issuesData.statusBreakdown || {})}

REQUIREMENTS:
1. Return a JSON array of exactly 4 objects.
2. Each object must have: "title" (short headline), "insight" (2-3 detailed sentences with specific numbers from the data), "action" (1 concrete actionable step for supervisors).
3. Cover: resolution pipeline health, category/ward hotspots, resource allocation forecast, and citizen trust/engagement outlook.
4. Use Indian municipal context (wards, field officers, monsoon preparedness where relevant).
5. Be specific — reference actual counts and percentages, not generic advice.
6. Do NOT wrap in markdown. Return raw JSON array only.

Example format:
[{"title":"...","insight":"...","action":"..."}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return extractJson(text);
  } catch (error) {
    console.error("Gemini insights error:", error);
    return fallback;
  }
}
