import type { SessionItem } from "@/types/menu";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { QuantitySelector } from "@/components/QuantitySelector";

interface Props {
  sessionItem: SessionItem;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function MenuItemCard({
  sessionItem,
  quantity,
  onChangeQuantity,
}: Props) {
  const menuItem = sessionItem.menu_items;
  if (!menuItem) return null;

  return (
    <div className="flex gap-3 items-center py-3.5 px-4 last:pb-4">
      <ProductThumbnail className="w-20 h-20 rounded-xl shrink-0" item={menuItem} />
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold text-ink-dark text-sm leading-snug">
          {menuItem.name}
        </p>
        {menuItem.description && (
          <p className="font-sans text-ink-light text-xs mt-0.5 line-clamp-1">
            {menuItem.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 gap-2">
          <p className="font-sans text-crust-gold font-semibold text-sm">
            {formatPrice(sessionItem.price)}
          </p>
          <QuantitySelector value={quantity} onChange={onChangeQuantity} />
        </div>
      </div>
    </div>
  );
}
