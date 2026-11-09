import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import RecentOrdersTicker from "@/components/RecentOrdersTicker";
import HeroCarousel from "@/components/HeroCarousel";
import Link from "next/link";
import { Zap, ShieldCheck, BadgePercent, Gamepad2, UserRoundCheck, CreditCard, ArrowRight, Search, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [games, banners] = await Promise.all([
    prisma.game.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    }),
    prisma.heroBanner.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      <Header />

      {banners.length > 0 && (
        <div className="pt-6">
          <HeroCarousel banners={banners} />
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-primary/15 blur-[120px] animate-float" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-accent/10 blur-[120px] animate-float-slow" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-xs font-medium text-brand-primary mb-6 fade-up backdrop-blur-sm shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
            </span>
            24/7 Instant Delivery
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight fade-up" style={{ animationDelay: "0.1s" }}>
            Game Top-Ups, <span className="shine-text">Instant.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-brand-muted max-w-xl mx-auto fade-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Mobile Legends, Free Fire, PUBG, Genshin Impact &amp; more.
            Enter your UID, pay, done.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 fade-up" style={{ animationDelay: "0.3s" }}>
            <Link href="#games" className="btn-primary group text-base py-3.5 px-8 w-full sm:w-auto">
              <Sparkles className="h-5 w-5" />
              Top Up Now
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/order" className="btn-ghost py-3.5 px-8 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Track Order
            </Link>
          </div>
        </div>
      </section>

      <RecentOrdersTicker />

      {/* Games grid */}
      <section id="games" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Choose Your Game</h2>
          <p className="text-brand-muted text-sm">Tap a game to top up instantly</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {games.map((game, i) => (
            <div key={game.id} className="fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <ItemCard
                slug={game.slug}
                name={game.name}
                publisher={game.publisher}
                currencyName={game.currencyName}
                imageUrl={game.imageUrl}
                featured={game.featured}
              />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-brand-muted text-sm">Three steps. Under a minute.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", Icon: Gamepad2, title: "Pick a Game", desc: "Choose from our catalog of popular games." },
            { step: "02", Icon: UserRoundCheck, title: "Enter UID", desc: "Just your player ID — no password needed." },
            { step: "03", Icon: CreditCard, title: "Pay & Receive", desc: "Pay with KHQR. Credits arrive instantly." },
          ].map((s, i) => (
            <div key={s.step} className="group relative rounded-2xl border border-brand-border/60 bg-brand-card/60 p-8 text-center transition-all duration-500 hover:border-brand-primary/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/10 fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <s.Icon className="h-7 w-7" />
              </div>
              <div className="text-[10px] font-bold text-brand-primary tracking-widest mb-2">STEP {s.step}</div>
              <h3 className="font-display text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
