import { getImageUrl } from "@/lib/supabase/storage";
import type { MenuItem } from "@/types/menu";
import { cn } from "@/lib/utils/cn";

interface Props {
  item: Pick<MenuItem, "image" | "name">;
  className?: string;
}

export function ProductThumbnail({ item, className }: Props) {
  const src = item.image ? getImageUrl(item.image) : null;

  return (
    <div
      className={cn(
        "w-28 h-28 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center shrink-0",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl" role="img" aria-label={item.name}>
          🥯
        </span>
      )}
    </div>
  );
}
