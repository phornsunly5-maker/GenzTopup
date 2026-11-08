"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { isValidUid, isValidServerId, formatUsd } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import { QrCode, ArrowRight, Lock, Check, Smartphone, Search, UserRoundCheck, AlertCircle, Tag, Loader2 } from "lucide-react";

const LOOKUP_SLUGS = new Set(["mobile-legends", "free-fire", "genshin-impact", "honkai-star-rail"]);
const ZONE_ID_SLUGS = new Set(["mobile-legends"]);

interface Product {
  id: string;
  name: string;
  amount: number;
  bonus: number;
  priceUsd: number;
  badge: string | null;
}

interface Game {
  id: string;
  slug: string;
  name: string;
  currencyName: string;
  uidLabel: string;
  uidExample: string | null;
  requiresServer: boolean;
  servers: string[];
}

export default function TopUpForm({ game, products }: { game: Game; products: Product[] }) {
  const { format, currency, toKhr } = useCurrency();
  const [selected, setSelected] = useState<string | null>(products[0]?.id ?? null);
  const [uid, setUid] = useState("");
  const [serverId, setServerId] = useState(
    ZONE_ID_SLUGS.has(game.slug) ? "" : (game.servers[0] ?? "")
  );
  const [method, setMethod] = useState<"KHPAY">("KHPAY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discountUsd: number;
    finalAmountUsd: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const supportsLookup = LOOKUP_SLUGS.has(game.slug);
  const useZoneField = ZONE_ID_SLUGS.has(game.slug);

  type NicknameStatus = "idle" | "checking" | "verified" | "not_found";
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [nickname, setNickname] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const resetLookup = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    setNicknameStatus("idle");
    setNickname(null);
  }, []);

  useEffect(() => {
    if (!supportsLookup) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const uidValid = isValidUid(uid);
    const serverValid = !useZoneField || serverId.trim().length > 0;

    if (!uidValid || !serverValid) {
      if (nicknameStatus !== "idle") {
        setNicknameStatus("idle");
        setNickname(null);
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setNicknameStatus("checking");
      setNickname(null);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/lookup-uid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameSlug: game.slug,
            uid: uid.trim(),
            server: serverId.trim() || undefined,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (data.verified && data.nickname) {
          setNickname(data.nickname);
          setNicknameStatus("verified");
        } else {
          setNicknameStatus("not_found");
        }
      } catch {
        if (!controller.signal.aborted) setNicknameStatus("not_found");
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [uid, serverId, game.slug, supportsLookup, useZoneField]);

  const selectedProduct = products.find((p) => p.id === selected);
  const needsServer = game.requiresServer || useZoneField;
  const canSubmit = !!selected && isValidUid(uid) && (!needsServer || serverId.trim().length > 0);

  async function applyPromo() {
    if (!promoInput.trim() || !selectedProduct) return;
    setPromoLoading(true);
    setPromoError(null);
    setPromoApplied(null);
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          orderAmountUsd: selectedProduct.priceUsd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid promo code");
      setPromoApplied(data);
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setPromoLoading(false);
    }
  }

  function removePromo() {
    setPromoApplied(null);
    setPromoInput("");
    setPromoError(null);
  }

  const effectivePrice = promoApplied ? promoApplied.finalAmountUsd : (selectedProduct?.priceUsd ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          productId: selected,
          playerUid: uid.trim(),
          serverId: needsServer ? serverId.trim() : undefined,
          paymentMethod: method,
          promoCode: promoApplied?.code || undefined,
          playerNickname: nickname || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 items-start">
        {/* Left column: steps */}
        <div className="space-y-8">
          {/* Step 1: Pick package */}
          <div className="fade-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">1</div>
              <h2 className="font-display text-xl font-bold">Choose Package</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {products.map((p) => {
                const isSelected = selected === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className={`group relative overflow-hidden text-left rounded-2xl border-2 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/20 ring-2 ring-brand-primary/20"
                        : "border-brand-border/60 bg-brand-card hover:border-brand-primary/40 hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-white shadow-md shadow-brand-primary/50 animate-scale-in">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                    
                    {p.badge && (
                      <div className="absolute top-0 left-3 -translate-y-1/2">
                        <span className="rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">
                          {p.badge}
                        </span>
                      </div>
                    )}

                    {p.amount > 0 ? (
                      <>
                        <div className={`font-display font-bold text-2xl sm:text-3xl leading-none transition-colors ${isSelected ? "text-brand-primary" : "text-brand-text"}`}>
                          {p.amount.toLocaleString()}
                        </div>
                        {p.bonus > 0 && (
                          <div className="text-xs text-brand-accent mt-1 font-semibold">
                            + {p.bonus} bonus
                          </div>
                        )}
                        <div className="text-[10px] text-brand-muted uppercase tracking-wider mt-1">
                          {game.currencyName}
                        </div>
                      </>
                    ) : (
                      <div className="font-semibold text-sm leading-tight h-12 flex items-center">{p.name}</div>
                    )}

                    <div className={`mt-3 pt-3 border-t font-mono font-bold text-sm sm:text-base transition-colors ${isSelected ? "border-brand-primary/30 text-brand-primary" : "border-brand-border/60 text-brand-text"}`}>
                      {format(p.priceUsd)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: UID */}
          <div className="fade-up" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">2</div>
              <h2 className="font-display text-xl font-bold">Enter Account</h2>
            </div>

            <div className="card p-5 sm:p-6 space-y-4">
              <div className={useZoneField ? "grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_140px] gap-3" : ""}>
                <div>
                  <label className="label">{useZoneField ? "User ID" : game.uidLabel}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    placeholder={useZoneField ? "12345678" : (game.uidExample || "Enter your player ID")}
                    className="input font-mono text-lg py-3.5"
                    required
                  />
                </div>
                {useZoneField && (
                  <div>
                    <label className="label">Zone ID</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      placeholder="1234"
                      className="input font-mono text-lg py-3.5"
                      required
                    />
                  </div>
                )}
              </div>

              {game.requiresServer && !useZoneField && (
                <div>
                  <label className="label">Server</label>
                  <select value={serverId} onChange={(e) => setServerId(e.target.value)} className="input" required>
                    {game.servers.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Auto-lookup status */}
              {supportsLookup && nicknameStatus !== "idle" && (
                <div className="pt-2">
                  {nicknameStatus === "checking" && (
                    <span className="inline-flex items-center gap-2 text-sm text-brand-muted">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                      Verifying account…
                    </span>
                  )}
                  {nicknameStatus === "verified" && nickname && (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-brand-accent/40 bg-brand-accent/10 px-3 py-2 text-sm text-brand-accent animate-scale-in">
                      <UserRoundCheck className="h-4 w-4" />
                      <span className="text-brand-muted">Player:</span>
                      <span className="font-bold text-brand-text">{nickname}</span>
                    </span>
                  )}
                  {nicknameStatus === "not_found" && (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      Couldn&apos;t verify — you can still continue
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Promo Code */}
          <div className="fade-up" style={{ animationDelay: "140ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-surface border border-brand-border text-brand-muted">
                <Tag className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-display text-sm font-semibold text-brand-muted">Have a promo code?</h3>
            </div>

            {promoApplied ? (
              <div className="flex items-center gap-3 rounded-xl border border-brand-accent/40 bg-brand-accent/10 p-3">
                <Tag className="h-4 w-4 text-brand-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono font-bold text-brand-accent text-sm">{promoApplied.code}</span>
                  <span className="text-xs text-brand-accent/80 ml-2">−{format(promoApplied.discountUsd)} off</span>
                </div>
                <button type="button" onClick={removePromo} className="text-xs text-brand-muted hover:text-red-400 transition-colors">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                  placeholder="Enter code"
                  className="input font-mono uppercase text-sm flex-1"
                />
                <button type="button" onClick={applyPromo} disabled={promoLoading || !promoInput.trim() || !selectedProduct} className="btn-ghost text-sm shrink-0">
                  {promoLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
            {promoError && <p className="mt-2 text-xs text-red-400">{promoError}</p>}
          </div>
        </div>

        {/* Right column: sticky order summary */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="card p-6 border-brand-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand-muted mb-5">Order Summary</h3>

              {selectedProduct ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Game</span>
                    <span className="font-medium text-right">{game.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">Package</span>
                    <span className="font-medium text-right">
                      {selectedProduct.amount > 0 ? `${selectedProduct.amount.toLocaleString()} ${game.currencyName}` : selectedProduct.name}
                    </span>
                  </div>
                  {uid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-muted">Player ID</span>
                      <span className="font-mono text-xs">{uid}{serverId ? ` (${serverId})` : ""}</span>
                    </div>
                  )}
                  {nickname && (
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-muted">Player</span>
                      <span className="text-brand-accent font-medium text-xs">{nickname}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-brand-border/60 pt-4 space-y-3">
                    {promoApplied && (
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-accent">Discount ({promoApplied.code})</span>
                        <span className="text-brand-accent font-semibold">−{format(promoApplied.discountUsd)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-brand-muted text-sm">Total</span>
                      <div className="text-right">
                        <span key={`${selectedProduct.id}-${currency}`} className="font-display text-3xl font-bold text-gradient animate-scale-in inline-block">
                          {format(effectivePrice)}
                        </span>
                        <div className="text-[11px] text-brand-muted mt-0.5 font-mono">
                          {currency === "USD" ? `≈ ${toKhr(effectivePrice).toLocaleString("en-US")} ៛` : `≈ $${effectivePrice.toFixed(2)} USD`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-brand-muted">Select a package to see pricing</p>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="btn-primary w-full text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? "Creating order..." : "Pay Now"}
                {!submitting && <ArrowRight className="h-5 w-5" strokeWidth={2.5} />}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-brand-muted text-center mt-4">
                <Lock className="h-3 w-3" /> Secure checkout · No account needed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: sticky bottom summary */}
      <div className="lg:hidden card p-5 sticky bottom-3 mt-8 border border-brand-primary/30 shadow-2xl shadow-brand-primary/20 backdrop-blur-xl bg-brand-card/90 z-50">
        {selectedProduct && (
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-brand-muted">Total</div>
              <div className="font-display text-2xl font-bold text-gradient">{format(effectivePrice)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {selectedProduct.amount > 0 ? `${selectedProduct.amount.toLocaleString()} ${game.currencyName}` : selectedProduct.name}
              </div>
            </div>
          </div>
        )}
        <button type="submit" disabled={!canSubmit || submitting} className="btn-primary w-full text-base">
          {submitting ? "Creating..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
}
