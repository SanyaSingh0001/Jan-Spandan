import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

function getTimestampMs(ts: Timestamp | unknown): number {
  if (!ts) return 0;
  if (typeof ts === "object" && ts !== null && "seconds" in ts) {
    return (ts as { seconds: number }).seconds * 1000;
  }
  if (ts instanceof Date) return ts.getTime();
  return 0;
}

function sortIssuesByCreatedAt(issues: Issue[]): Issue[] {
  return [...issues].sort(
    (a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt)
  );
}

export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";
export type IssueCategory =
  | "pothole"
  | "water_leakage"
  | "streetlight"
  | "waste"
  | "drainage"
  | "road_damage"
  | "park"
  | "other";

export interface Issue {
  id?: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  severity: number; // 1-5
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  mediaUrls: string[];
  reportedBy: string; // uid
  reporterName: string;
  assignedTo?: string; // officer uid
  assignedOfficerName?: string;
  ward?: string;
  upvotes: string[]; // array of uids
  comments: number;
  aiCategory?: string;
  aiSeverity?: number;
  aiDepartment?: string;
  estimatedResolution?: string;
  createdAt: Timestamp | unknown;
  updatedAt: Timestamp | unknown;
  resolvedAt?: Timestamp | unknown;
  resolutionNote?: string;
  resolutionMediaUrls?: string[];
}

// Create issue
export const createIssue = async (
  issueData: Omit<Issue, "id" | "createdAt" | "updatedAt">
) => {
  const docRef = await addDoc(collection(db, "issues"), {
    ...issueData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Update issue
export const updateIssue = async (id: string, data: Partial<Issue>) => {
  await updateDoc(doc(db, "issues", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Get single issue
export const getIssue = async (id: string): Promise<Issue | null> => {
  const snap = await getDoc(doc(db, "issues", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Issue : null;
};

// Get all issues
export const getIssues = async (filters?: {
  status?: IssueStatus;
  category?: IssueCategory;
  reportedBy?: string;
  assignedTo?: string;
}): Promise<Issue[]> => {
  const hasUserFilter = Boolean(filters?.reportedBy || filters?.assignedTo);
  let q;

  if (filters?.reportedBy) {
    q = query(collection(db, "issues"), where("reportedBy", "==", filters.reportedBy));
  } else if (filters?.assignedTo) {
    q = query(collection(db, "issues"), where("assignedTo", "==", filters.assignedTo));
  } else {
    q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
  }

  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }
  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }

  const snap = await getDocs(q);
  const issues = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Issue));
  return hasUserFilter ? sortIssuesByCreatedAt(issues) : issues;
};

// Real-time issues listener
export const subscribeToIssues = (
  callback: (issues: Issue[]) => void,
  filters?: { reportedBy?: string; assignedTo?: string }
) => {
  let q;
  if (filters?.reportedBy) {
    q = query(collection(db, "issues"), where("reportedBy", "==", filters.reportedBy));
  } else if (filters?.assignedTo) {
    q = query(collection(db, "issues"), where("assignedTo", "==", filters.assignedTo));
  } else {
    q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
  }

  return onSnapshot(
    q,
    (snap: QuerySnapshot<DocumentData>) => {
      const issues = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Issue));
      callback(
        filters?.reportedBy || filters?.assignedTo
          ? sortIssuesByCreatedAt(issues)
          : issues
      );
    },
    (error) => {
      console.error("subscribeToIssues error:", error);
      callback([]);
    }
  );
};

// Upvote issue
export const upvoteIssue = async (issueId: string, uid: string, currentUpvotes: string[]) => {
  const alreadyUpvoted = currentUpvotes.includes(uid);
  const newUpvotes = alreadyUpvoted
    ? currentUpvotes.filter((u) => u !== uid)
    : [...currentUpvotes, uid];
  await updateDoc(doc(db, "issues", issueId), {
    upvotes: newUpvotes,
    updatedAt: serverTimestamp(),
  });
};

// Add comment
export const addComment = async (
  issueId: string,
  comment: { text: string; uid: string; displayName: string; photoURL?: string }
) => {
  await addDoc(collection(db, "issues", issueId, "comments"), {
    ...comment,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "issues", issueId), {
    comments: increment(1),
    updatedAt: serverTimestamp(),
  });
};

// Get comments
export const getComments = async (issueId: string) => {
  const q = query(
    collection(db, "issues", issueId, "comments"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Add points to user
export const addPointsToUser = async (uid: string, points: number) => {
  await updateDoc(doc(db, "users", uid), {
    points: increment(points),
  });
};

// Get leaderboard
export const getLeaderboard = async (limitNum = 10) => {
  try {
    const q = query(
      collection(db, "users"),
      where("role", "==", "citizen"),
      orderBy("points", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.slice(0, limitNum).map((d) => ({ id: d.id, ...d.data() }));
  } catch (err: unknown) {
    console.warn("Leaderboard index missing. Using fallback.", err);
    const fallbackQ = query(collection(db, "users"), where("role", "==", "citizen"));
    const snap = await getDocs(fallbackQ);
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users.sort((a: any, b: any) => (b.points || 0) - (a.points || 0));
    return users.slice(0, limitNum);
  }
};

// Get all officers
export const getOfficers = async () => {
  const q = query(collection(db, "users"), where("role", "==", "officer"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all users
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update user role
export const updateUserRole = async (uid: string, role: string) => {
  await updateDoc(doc(db, "users", uid), { role, approved: true });
};

// Get stats
export const getStats = async () => {
  const allIssues = await getDocs(collection(db, "issues"));
  const total = allIssues.size;
  const resolved = allIssues.docs.filter(
    (d) => d.data().status === "resolved"
  ).length;
  const inProgress = allIssues.docs.filter(
    (d) => d.data().status === "in_progress"
  ).length;
  const open = allIssues.docs.filter((d) => d.data().status === "open").length;
  const allUsers = await getDocs(
    query(collection(db, "users"), where("role", "==", "citizen"))
  );
  return { total, resolved, inProgress, open, citizens: allUsers.size };
};
