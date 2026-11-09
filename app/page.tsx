import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameCard from "@/components/GameCard";
import RecentOrdersTicker from "@/components/RecentOrdersTicker";
import HeroCarousel from "@/components/HeroCarousel";
import Link from "next/link";
import { Zap, ShieldCheck, Gamepad2, ArrowRight, Search, Sparkles, TrendingUp, CreditCard, UserRoundCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [games, banners] = await Promise.all([
    prisma.game.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }] }),
    prisma.heroBanner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="bg-anime-4d min-h-screen flex flex-col relative overflow-hidden">
      <div className="bg-grid-4d" />
      <Header />

      {banners.length > 0 && (
        <div className="pt-8 relative z-10">
          <HeroCarousel banners={banners} />
        </div>
      )}

      {/* 4D Hero Section */}
      <section className="relative py-24 sm:py-32 flex flex-col items-center justify-center text-center z-10">
        {/* Floating Neon Orbs */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-brand-primary/20 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brand-accent/20 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-primary mb-8 backdrop-blur-md">
            <Sparkles className="h-4 w-4" /> The #1 Top-Up Experience
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-2xl">
            Level Up <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-400 to-brand-accent">
              Instantly.
            </span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Top up your favorite games securely with KHQR. Delivered in seconds. No login required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#games" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 group">
              <Gamepad2 className="h-5 w-5" /> Explore Games <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/order" className="btn-ghost w-full sm:w-auto text-lg px-8 py-4">
              <Search className="h-5 w-5" /> Track Order
            </Link>
          </div>
        </div>
      </section>

      <RecentOrdersTicker />

      {/* Games Grid */}
      <section id="games" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-brand-accent" /> Trending Games
            </h2>
            <p className="text-brand-muted">Select a game to top up instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {games.map((game, i) => (
            <div key={game.id} className="fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
              <GameCard
                slug={game.slug} name={game.name} publisher={game.publisher}
                currencyName={game.currencyName} imageUrl={game.imageUrl} featured={game.featured}
              />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-brand-muted text-lg">Three steps. Under a minute.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: "01", Icon: Gamepad2, title: "Pick a Game", desc: "Choose from our curated list of popular games." },
            { step: "02", Icon: UserRoundCheck, title: "Enter UID", desc: "Just your player ID -- no password needed." },
            { step: "03", Icon: CreditCard, title: "Pay & Receive", desc: "Pay with KHQR. Credits arrive instantly." },
          ].map((s, i) => (
            <div key={s.step} className="glass-card p-8 text-center group hover:border-brand-primary/50 transition-all duration-300">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
                <s.Icon className="h-8 w-8" />
              </div>
              <div className="text-xs font-bold text-brand-accent tracking-widest mb-2">STEP {s.step}</div>
              <h3 className="font-display text-xl font-bold mb-3 text-white">{s.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}