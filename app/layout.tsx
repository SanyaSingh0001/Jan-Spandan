import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const devanagari = Noto_Sans_Devanagari({ 
  subsets: ["devanagari"], 
  variable: "--font-devanagari",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Jan Spandan — जन स्पंदन | Hyperlocal Problem Solver for India",
  description:
    "Report, track, and resolve community infrastructure issues in your city. Built for Indian citizens to make their communities better. पोटहोल, पानी लीकेज, स्ट्रीट लाइट — सब कुछ रिपोर्ट करें। Jan Spandan — where every citizen's voice creates change.",
  keywords:
    "jan spandan, जन स्पंदन, community issues, pothole, water leakage, streetlight, civic engagement, India, municipal, जन सेवा, hyperlocal",
  openGraph: {
    title: "Jan Spandan — जन स्पंदन | जन सेवा, जन शक्ति",
    description: "Empowering citizens to build better communities across India",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body className="font-inter antialiased" style={{ background: "#F8F4EC", color: "#2C2010" }}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#FFFDF8",
                color: "#2C2010",
                border: "1px solid rgba(200, 96, 26, 0.25)",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                boxShadow: "0 8px 32px rgba(180, 130, 60, 0.15)",
              },
              success: {
                iconTheme: { primary: "#1A6B1A", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#B02020", secondary: "#fff" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
