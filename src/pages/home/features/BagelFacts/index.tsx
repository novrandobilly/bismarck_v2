import { BAGEL_FACTS } from "./helper/facts";

export function BagelFacts() {
  return (
    <section>
      <p className="font-sans text-[11px] font-semibold text-ink-medium uppercase tracking-[0.12em] mb-6">
        What Makes It Special
      </p>
      <div className="space-y-6">
        {BAGEL_FACTS.map((fact) => (
          <div key={fact.title} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-flour-dust border border-kraft-border-soft flex items-center justify-center text-lg shrink-0">
              {fact.icon}
            </div>
            <div>
              <p className="font-serif text-[15px] font-semibold text-ink-dark leading-snug">
                {fact.title}
              </p>
              <p className="font-sans text-ink-medium text-[14px] mt-1 leading-relaxed max-w-[55ch]">
                {fact.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
