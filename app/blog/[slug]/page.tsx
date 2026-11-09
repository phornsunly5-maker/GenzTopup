import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string }; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) return { title: "Not found" };
  return {
    title: `${post.title} -- ZennLyyStore`,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined, images: post.coverUrl ? [post.coverUrl] : undefined, type: "article" },
  };
}

function renderContent(raw: string) {
  const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.split(/\n{2,}/).map((block, i) => (
    <p key={i} className="mb-6 leading-relaxed text-brand-muted text-lg" dangerouslySetInnerHTML={{ __html: block.replace(/\n/g, "<br/>") }} />
  ));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  return (
    <div className="bg-anime-4d min-h-screen flex flex-col relative">
      <div className="bg-grid-4d" />
      <Header />
      
      <main className="flex-1 relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 w-full">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-white transition-colors mb-10 bg-white/5 px-4 py-2 rounded-full w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>

        <div className="text-center mb-12">
          {post.tag && <span className="inline-block text-brand-accent text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-6">{post.tag}</span>}
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-6 text-white">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-brand-muted">
             {post.publishedAt && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {new Date(post.publishedAt).toLocaleDateString()}</span>}
          </div>
        </div>

        {post.coverUrl && (
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl">
            <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="prose prose-invert prose-lg max-w-none">
          {renderContent(post.content)}
        </article>
      </main>
      <Footer />
    </div>
  );
}