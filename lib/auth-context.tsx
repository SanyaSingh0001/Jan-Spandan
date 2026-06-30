"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export type UserRole = "citizen" | "officer" | "supervisor" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  points: number;
  badges: string[];
  createdAt: unknown;
  ward?: string;
  approved?: boolean;
}

interface PendingGoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  pendingGoogleUser: PendingGoogleUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ) => Promise<void>;
  loginWithGoogle: () => Promise<{ isNew: boolean }>;
  completeGoogleSignup: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingGoogleUser | null>(null);
  const router = useRouter();

  const fetchUserProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
      return docSnap.data() as UserProfile;
    }
    return null;
  };

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        profileUnsub = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setPendingGoogleUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Keep middleware session cookie in sync with Firebase auth
  useEffect(() => {
    if (!userProfile) return;
    fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: userProfile.role }),
    }).catch(() => {});
  }, [userProfile?.uid, userProfile?.role]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const profile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName,
      role,
      points: 0,
      badges: [],
      createdAt: serverTimestamp(),
      approved: role === "citizen" ? true : false,
    };
    await setDoc(doc(db, "users", cred.user.uid), profile);
    setUserProfile(profile);
  };

  const loginWithGoogle = async (): Promise<{ isNew: boolean }> => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    // Check if user doc exists
    const docRef = doc(db, "users", cred.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // New user — set pending state so we can show role selection modal
      setPendingGoogleUser({
        uid: cred.user.uid,
        email: cred.user.email || "",
        displayName: cred.user.displayName || "User",
        photoURL: cred.user.photoURL || undefined,
      });
      return { isNew: true };
    } else {
      setUserProfile(docSnap.data() as UserProfile);
      setPendingGoogleUser(null);
      return { isNew: false };
    }
  };

  const completeGoogleSignup = async (role: UserRole) => {
    if (!pendingGoogleUser) return;
    const profile: UserProfile = {
      uid: pendingGoogleUser.uid,
      email: pendingGoogleUser.email,
      displayName: pendingGoogleUser.displayName,
      role,
      photoURL: pendingGoogleUser.photoURL,
      points: 0,
      badges: [],
      createdAt: serverTimestamp(),
      approved: role === "citizen" ? true : false,
    };
    await setDoc(doc(db, "users", pendingGoogleUser.uid), profile);
    setUserProfile(profile);
    setPendingGoogleUser(null);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setPendingGoogleUser(null);
    // Hard redirect to ensure caching is cleared
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, pendingGoogleUser, login, signup, loginWithGoogle, completeGoogleSignup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
