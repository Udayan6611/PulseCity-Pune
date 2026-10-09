import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sheher — Smart City Exploration Platform",
  description:
    "Discover, experience, and navigate Indian cities smarter. Real-time safety, heritage, food, traffic, and AI-powered insights — all in one place.",
  keywords: [
    "sheher",
    "शहर",
    "city exploration",
    "smart city",
    "city safety",
    "heritage sites",
    "tourist attractions",
    "AI travel assistant",
    "Mumbai",
    "Delhi",
    "Bengaluru",
    "Jaipur",
    "Kolkata",
  ],
  authors: [{ name: "Team Sheher" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Sheher — Smart City Exploration Platform",
    description:
      "Discover attractions, find safer routes, explore heritage, and unlock AI-driven insights for Indian cities.",
    siteName: "Sheher",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sheher",
    description: "Discover cities smarter — attractions, heritage, safety, food, AI insights.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
