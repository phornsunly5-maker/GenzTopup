import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopUpForm from "@/components/TopUpForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: { slug: string } }) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!game || !game.active) notFound();

  return (
    <>
      <Header />

      <section className="relative overflow-hidden border-b border-brand-border">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: game.bannerUrl ? `url(${game.bannerUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/90 to-brand-bg/60" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
          <Link href="/#games" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            All games
          </Link>

          <div className="flex items-center gap-5 sm:gap-6">
            <div
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-2 border-brand-border bg-brand-card shadow-2xl shrink-0 overflow-hidden"
              style={{
                backgroundImage: `url(${game.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-primary font-semibold mb-1">
                {game.publisher}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2">
                {game.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-brand-text/80 text-sm">
                  Top up {game.currencyName}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                  <Zap className="h-3 w-3" />
                  Instant
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <TopUpForm
          game={{
            id: game.id,
            slug: game.slug,
            name: game.name,
            currencyName: game.currencyName,
            uidLabel: game.uidLabel,
            uidExample: game.uidExample,
            requiresServer: game.requiresServer,
            servers: (() => { try { return JSON.parse(game.servers || "[]"); } catch { return []; } })(),
          }}
          products={game.products.map((p) => ({
            id: p.id,
            name: p.name,
            amount: p.amount,
            bonus: p.bonus,
            priceUsd: p.priceUsd,
            badge: p.badge,
          }))}
        />
      </main>

      <Footer />
    </>
  );
}
