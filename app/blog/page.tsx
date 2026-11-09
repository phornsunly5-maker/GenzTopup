import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { FileText, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Guides -- ZennLyyStore",
  description: "Game updates, top-up guides and promotions.",
};

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, excerpt: true, coverUrl: true, tag: true, publishedAt: true },
  });

  return (
    <div className="bg-anime-4d min-h-screen flex flex-col relative">
      <div className="bg-grid-4d" />
      <Header />
      
      <main className="flex-1 relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 w-full">
        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-white flex items-center justify-center gap-3">
             <FileText className="h-10 w-10 text-brand-accent" /> News & Guides
          </h1>
          <p className="text-brand-muted text-lg max-w-2xl mx-auto">Updates, events, and top-up guides for every supported game.</p>
        </div>

        {posts.length === 0 ? (
          <div className="glass-card p-12 text-center text-brand-muted">No posts published yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="glass-card group overflow-hidden flex flex-col">
                <div className="relative h-48 overflow-hidden bg-brand-surface">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/10" />
                  )}
                  {p.tag && <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-brand-accent text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-brand-accent/30">{p.tag}</span>}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="font-display text-xl font-bold leading-tight mb-3 text-white group-hover:text-brand-primary transition-colors">{p.title}</h2>
                  {p.excerpt && <p className="text-sm text-brand-muted line-clamp-3 mb-4 flex-1">{p.excerpt}</p>}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-xs text-brand-muted font-mono">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ""}</span>
                    <span className="text-brand-accent group-hover:translate-x-1 transition-transform"><ArrowRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}