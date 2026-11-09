"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CurrencyToggle from "./CurrencyToggle";
import { Menu, X, Search, Zap } from "lucide-react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#games", label: "Games" },
  { href: "/order", label: "Track Order" },
  { href: "/#faq", label: "FAQ" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/5 bg-[#050508]/80 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-10">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Zap className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              ZENNLYY<span className="text-brand-primary">STORE</span>
            </span>
            <span className="text-[10px] text-brand-accent font-bold tracking-widest mt-1">
              INSTANT · SECURE · 24/7
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-2 py-1.5 backdrop-blur-md">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href.replace(/#.*/, ""));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  active ? "text-white" : "text-brand-muted hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent opacity-20 -z-10" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 relative z-10">
          <CurrencyToggle className="hidden sm:inline-flex" />
          <Link
            href="/order"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
          >
            <Search className="h-4 w-4 text-brand-accent" />
            Track Order
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-md"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden absolute w-full overflow-hidden border-b border-white/5 bg-[#050508]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col p-4 gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Currency</span>
            <CurrencyToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}