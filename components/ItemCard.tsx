import Link from "next/link";

interface GameCardProps {
  slug: string;
  name: string;
  publisher: string;
  currencyName: string;
  imageUrl: string;
  featured?: boolean;
}

export default function ItemCard({ slug, name, publisher, currencyName, imageUrl, featured }: GameCardProps) {
  return (
    <Link
      href={`/games/${slug}`}
      className="group relative block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 transition-transform duration-500 hover:-translate-y-1.5"
    >
      <span
        className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-brand-primary via-brand-accent to-brand-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex flex-col items-center rounded-2xl border border-brand-border/60 bg-brand-card p-4 sm:p-5 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand-card/90 shadow-lg">
        <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-brand-surface mb-4">
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-accent/10 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
            style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute -inset-y-1 -left-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ease-out group-hover:left-[150%]" />
          </div>
          {featured && (
            <div className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
              </svg>
              HOT
            </div>
          )}
        </div>

        <h3 className="font-display font-bold text-sm sm:text-base text-center leading-tight mb-1 transition-colors duration-300 group-hover:text-brand-primary">
          {name}
        </h3>
        <p className="text-[11px] text-brand-muted mb-3">{publisher}</p>

        <button className="w-full rounded-xl bg-brand-surface border border-brand-border py-2.5 text-sm font-bold text-brand-text uppercase tracking-wider transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-brand-primary group-hover:to-brand-accent group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-brand-primary/30 group-hover:scale-[1.02]">
          Top Up
        </button>
      </div>
    </Link>
  );
}
