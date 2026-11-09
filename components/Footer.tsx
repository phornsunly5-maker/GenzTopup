import Link from "next/link";
import { Zap, Send, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050508] pt-16 pb-8 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-primary/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent">
                <Zap className="h-4 w-4 text-white" fill="currentColor" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                ZENNLYY<span className="text-brand-primary">STORE</span>
              </span>
            </Link>
            <p className="text-sm text-brand-muted leading-relaxed mb-6">
              Cambodia&apos;s most advanced game top-up platform. Instant delivery, premium service, and 100% secure payments.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-green-400">
              <ShieldCheck className="h-4 w-4" /> 100% Secure & Trusted
            </div>
          </div>

          {/* Links */}
          {[
            { heading: "Platform", items: [{ label: "Home", href: "/" }, { label: "All Games", href: "/#games" }, { label: "Track Order", href: "/order" }] },
            { heading: "Support", items: [{ label: "FAQ", href: "/faq" }, { label: "Blog", href: "/blog" }, { label: "Contact Us", href: "#" }] },
            { heading: "Legal", items: [{ label: "Terms of Service", href: "#" }, { label: "Privacy Policy", href: "#" }, { label: "Refund Policy", href: "#" }] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-white">{col.heading}</h4>
              <ul className="space-y-3">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link href={it.href} className="text-sm text-brand-muted transition-colors hover:text-brand-accent flex items-center gap-2 group">
                      <span className="w-0 h-0.5 bg-brand-accent group-hover:w-3 transition-all duration-300 rounded-full" />
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-brand-muted/70">
          <p>&copy; {new Date().getFullYear()} ZennLyyStore. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed for the next generation of gamers <Send className="h-3 w-3 text-brand-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
}