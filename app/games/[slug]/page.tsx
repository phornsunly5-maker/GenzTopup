import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopUpForm from "@/components/TopUpForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: { slug: string } }) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: { products: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
  });

  if (!game || !game.active) notFound();

  return (
    <div className="bg-anime-4d min-h-screen flex flex-col">
      <Header />
      <div className="bg-grid-4d" />

      {/* Hero Section - 4D Effect */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/5">
        {/* Background Image with Blur & Overlay */}
        {game.bannerUrl && (
          <div className="absolute inset-0 z-0">
            <img src={game.bannerUrl} alt="" className="w-full h-full object-cover opacity-20 blur-sm scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/#games" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Games
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Game Icon with Glow */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-accent rounded-[2rem] blur-lg opacity-50 group-hover:opacity-100 transition duration-500" />
              <div
                className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-[2rem] border-2 border-white/10 bg-brand-card shadow-2xl overflow-hidden"
                style={{ backgroundImage: `url(${game.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            </div>
            
            <div className="text-center sm:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-accent mb-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Top Up
              </p>
              <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-3 text-white drop-shadow-lg">
                {game.name}
              </h1>
              <p className="text-brand-muted text-lg max-w-xl">
                Get instant {game.currencyName} delivered securely to your account. Official distributor pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <TopUpForm
          game={{
            id: game.id, slug: game.slug, name: game.name, currencyName: game.currencyName,
            uidLabel: game.uidLabel, uidExample: game.uidExample, requiresServer: game.requiresServer,
            servers: (() => { try { return JSON.parse(game.servers || "[]"); } catch { return []; } })(),
          }}
          products={game.products.map((p) => ({
            id: p.id, name: p.name, amount: p.amount, bonus: p.bonus, priceUsd: p.priceUsd, badge: p.badge,
          }))}
        />
      </main>

      <Footer />
    </div>
  );
}