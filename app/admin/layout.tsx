import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    // Only redirect if not already on login; but since login is under /admin
    // we need a small trick: check cookie indirectly. The middleware will redirect
    // first — so reaching here without admin means someone hit the login page.
    // We just render children in that case.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <aside className="w-64 border-r border-brand-border bg-brand-surface/60 backdrop-blur-xl flex flex-col z-20">
        <Link href="/admin" className="p-6 border-b border-brand-border/60 block">
          <div className="flex items-center gap-3 group">
            {/* បង្ហាញរូប Logo ថ្មីរបស់អ្នកនៅទីនេះ */}
            <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-300">
               <Image 
                  src="/logo.png" 
                  alt="GenzTopup Logo" 
                  fill 
                  className="object-cover"
                  priority
               />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-tight">
                GENZ<span className="text-brand-primary">TOPUP</span>
              </div>
              <div className="text-[10px] text-brand-muted uppercase tracking-widest font-semibold">
                Admin Panel
              </div>
            </div>
          </div>
        </Link>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { href: "/admin", label: "Dashboard", icon: "📊" },
            { href: "/admin/orders", label: "Orders", icon: "📦" },
            { href: "/admin/games", label: "Games", icon: "🎮" },
            { href: "/admin/products", label: "Products", icon: "💎" },
            { href: "/admin/promo-codes", label: "Promo Codes", icon: "🏷️" },
            { href: "/admin/banners", label: "Banners", icon: "🖼️" },
            { href: "/admin/faqs", label: "FAQ", icon: "❓" },
            { href: "/admin/blog", label: "Blog", icon: "📝" },
            { href: "/admin/customers", label: "Customers", icon: "👥" },
            { href: "/admin/banlist", label: "Banlist", icon: "🚫" },
            { href: "/admin/audit-logs", label: "Audit Log", icon: "📜" },
            { href: "/admin/settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-text/70 hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-200"
            >
              <span className="text-base opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border/60 bg-brand-card/30">
          <div className="text-[10px] uppercase tracking-wider text-brand-muted mb-1 font-semibold">Signed in as</div>
          <div className="text-sm font-medium mb-3 truncate text-brand-text">{admin.email}</div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-brand-bg relative">
        {/* Background Glow Effect for Admin */}
        <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-brand-primary/5 blur-[120px]" />
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
