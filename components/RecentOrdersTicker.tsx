"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface RecentOrder {
  gameName: string;
  productName: string;
  playerUid: string;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RecentOrdersTicker() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetch("/api/orders/recent")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {});
  }, []);

  if (orders.length === 0) return null;

  return (
    <section className="relative border-y border-brand-border/40 bg-brand-surface/40 py-4 overflow-hidden">
      <div className="marquee-track gap-10">
        {[...Array(2)].map((_, dupIdx) => (
          <div key={dupIdx} className="flex shrink-0 items-center gap-10 pr-10">
            {orders.map((o, i) => (
              <span
                key={`${dupIdx}-${i}`}
                className="flex items-center gap-2 text-sm text-brand-muted whitespace-nowrap"
              >
                <Zap className="h-3.5 w-3.5 text-brand-accent shrink-0" fill="currentColor" strokeWidth={0} />
                <span className="text-brand-text font-medium">{o.playerUid}</span>
                topped up
                <span className="text-brand-primary font-semibold">{o.productName}</span>
                for {o.gameName}
                <span className="text-brand-muted/60">· {timeAgo(o.createdAt)}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
