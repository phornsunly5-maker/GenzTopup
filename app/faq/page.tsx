import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ — GenzTopup",
  description: "Frequently asked questions about game top-ups, KHQR payment, delivery times and more.",
};

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, f) => {
    (acc[f.category] = acc[f.category] || []).push(f);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-5xl font-bold mb-3">Help Center</h1>
          <p className="text-brand-muted">Answers to common questions. Still stuck? <Link href="/order" className="text-brand-primary hover:underline">Track your order</Link> or message us on Telegram.</p>
        </div>

        {faqs.length === 0 ? (
          <div className="card p-10 text-center text-brand-muted text-sm">No questions published yet.</div>
        ) : (
          Object.entries(grouped).map(([cat, list]) => (
            <section key={cat} className="mb-10">
              <h2 className="text-xs uppercase tracking-widest text-brand-muted mb-3">{cat}</h2>
              <div className="space-y-2">
                {list.map((f) => (
                  <details key={f.id} className="card p-5 group border-brand-border/60 hover:border-brand-primary/30 transition-colors">
                    <summary className="cursor-pointer font-medium flex items-center justify-between list-none">
                      <span>{f.question}</span>
                      <span className="text-brand-muted group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="mt-3 text-sm text-brand-muted whitespace-pre-wrap leading-relaxed">{f.answer}</div>
                  </details>
                ))}
              </div>
            </section>
          ))
        )}
      </section>
      <Footer />
    </>
  );
}
