import { useMenuItems } from "@/hooks/useMenuItems";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getImageUrl } from "@/lib/supabase/storage";
import type { MenuItem } from "@/types/menu";

function categoryLabel(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-surface-white border border-kraft-border rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_2px_12px_oklch(0.15_0.03_55/0.08)] transition-shadow">
      {item.image ? (
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-flour-dust flex items-center justify-center text-5xl">
          🥯
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-serif font-semibold text-ink-dark text-base leading-tight">
            {item.name}
          </h3>
          {/* <span className="shrink-0 font-sans text-sm font-semibold text-ink-medium">
            Rp {item.default_price.toLocaleString("id-ID")}
          </span> */}
        </div>
        {item.category && (
          <span className="font-sans text-[11px] font-semibold text-ink-medium bg-flour-dust border border-kraft-border rounded-full px-2.5 py-0.5 self-start mb-2 uppercase tracking-wider">
            {categoryLabel(item.category)}
          </span>
        )}
        {item.description && (
          <p className="font-sans text-ink-medium text-sm leading-relaxed flex-1">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PublicMenuPage() {
  const { data: items = [], isLoading } = useMenuItems();
  const activeItems = items.filter((i) => i.is_active);

  const grouped = activeItems.reduce<Record<string, MenuItem[]>>(
    (acc, item) => {
      const key = item.category || "other";
      (acc[key] ??= []).push(item);
      return acc;
    },
    {},
  );

  const categories = Object.keys(grouped).sort();

  return (
    <>
      <header className="bg-warm-cream border-b border-kraft-border-soft">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-3">
            Our Bakes
          </p>
          <h1 className="font-serif text-[clamp(2rem,5vw,2.75rem)] font-bold text-ink-dark">
            Menu
          </h1>
          <p className="font-sans text-ink-medium mt-2 max-w-[42ch] mx-auto text-sm leading-relaxed">
            All items are made fresh per pre-order session — prices shown are
            base prices and may vary per session.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-12">
        {isLoading ? (
          <LoadingSpinner centered />
        ) : activeItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-lg font-semibold text-ink-dark mb-1">
              No menu items yet
            </p>
            <p className="font-sans text-ink-medium text-sm">
              Check back soon!
            </p>
          </div>
        ) : (
          categories.map((cat) => (
            <section key={cat}>
              <h2 className="font-serif text-xl font-semibold text-ink-dark mb-5">
                {categoryLabel(cat)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {grouped[cat].map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
