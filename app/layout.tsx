// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ...
import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { CurrencyProvider } from "@/lib/currency";
import RouteProgress from "@/components/RouteProgress";
import AnnouncementBar from "@/components/AnnouncementBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GenzTopup — Fast & Secure Game Top Up",
  description:
    "Top up Mobile Legends, Free Fire, PUBG, Genshin Impact and more. Instant delivery, secure KHQR payment. 24/7 service in Cambodia.",
  keywords: [
    "top up",
    "mobile legends diamonds",
    "free fire diamonds",
    "pubg uc",
    "genshin impact",
    "ABA Pay",
    "KHQR",
    "Cambodia top up",
    "GenzTopup",
  ],
  openGraph: {
    title: "GenzTopup — Fast & Secure Game Top Up",
    description: "Instant game top-ups with KHQR · ABA Pay · Wing · ACLEDA",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } }).catch(() => null);
  const exchangeRate = settings?.exchangeRate ?? 4100;

  return (
    <html lang="en">
      {/* ដាក់ Class bg-anime-4d នៅក្នុង body */}
      <body className="bg-anime-4d antialiased selection:bg-brand-primary/30">
        <div className="bg-grid-4d" /> {/* ស្រទាប់ Grid សម្រាប់ 4D */}
        <RouteProgress />
        <CurrencyProvider exchangeRate={exchangeRate}>
          <AnnouncementBar />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}