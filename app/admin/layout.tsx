import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";
import { 
  LayoutDashboard, ShoppingBag, Gamepad2, Gem, Tag, Image as ImageIcon, 
  HelpCircle, FileText, Users, ShieldBan, ScrollText, Settings, Zap
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) return <>{children}</>;

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/games", label: "Games", icon: Gamepad2 },
    { href: "/admin/products", label: "Products", icon: Gem },
    { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
    { href: "/admin/banners", label: "Banners", icon: ImageIcon },
    { href: "/admin/faqs", label: "FAQ", icon: HelpCircle },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/banlist", label: "Banlist", icon: ShieldBan },
    { href: "/admin/audit-logs", label: "Audit Log", icon: ScrollText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-anime-4d">
      <div className="bg-grid-4d" /> {/* Grid 4D Overlay */}
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col z-20 hidden md:flex relative">
        <Link href="/admin" className="p-6 border-b border-white/5 block group">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-glow-primary group-hover:scale-105 transition-transform bg-black/50 border border-white/10 flex items-center justify-center">
               <Image src="/logo.png" alt="ZennLyyStore" fill className="object-cover" priority />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-tight">
                ZENNLYY<span className="text-brand-primary">STORE</span>
              </div>
              <div className="text-[10px] text-brand-accent uppercase tracking-widest font-bold flex items-center gap-1">
                <Zap className="h-3 w-3" /> Admin
              </div>
            </div>
          </div>
        </Link>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-brand-muted hover:bg-white/5 hover:text-white transition-all duration-300 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(168,85,247,1)] transition-opacity rounded-r-md" />
              <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:text-brand-accent transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20 m-3 rounded-2xl border border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-brand-muted mb-1 font-bold">Admin Session</div>
          <div className="text-sm font-medium mb-3 truncate text-white">{admin.email}</div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        {children}
      </main>
    </div>
  );
}