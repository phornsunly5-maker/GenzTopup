import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { CurrencyProvider } from "@/lib/currency";
import RouteProgress from "@/components/RouteProgress";
import AnnouncementBar from "@/components/AnnouncementBar";

// បន្ថែមបន្ទាត់នេះ ដើម្បីកុំឱ្យ Vercel ទាញ Database ពេល Build
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ZennLyyStore -- Premium Game Top Up",
  description: "Top up Mobile Legends, Free Fire, PUBG, Genshin Impact instantly. Secure KHQR payment. 24/7 service in Cambodia.",
  keywords: ["top up", "mobile legends", "free fire", "pubg", "genz", "zennlyystore", "KHQR", "Cambodia"],
  openGraph: {
    title: "ZennLyyStore -- Premium Game Top Up",
    description: "Instant game top-ups with KHQR · ABA Pay · Wing",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ទាញយកអត្រាប្តូរប្រាក់ពី Database (បើមានបញ្ហាវានឹងប្រើ 4100 ជំនួស)
  const settings = await prisma.settings.findUnique({ where: { id: 1 } }).catch(() => null);
  const exchangeRate = settings?.exchangeRate ?? 4100;

  return (
    <html lang="en">
      <body className="bg-anime-4d antialiased selection:bg-brand-primary/30">
        {/* 4D Grid Background Effect */}
        <div className="bg-grid-4d" />
        
        <RouteProgress />
        <CurrencyProvider exchangeRate={exchangeRate}>
          <AnnouncementBar />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}