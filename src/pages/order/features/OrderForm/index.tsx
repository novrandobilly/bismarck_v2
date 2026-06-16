import type { UseFormReturn } from "react-hook-form";
import type { OrderFormValues } from "@/types/order";
import type { Session } from "@/types/session";
import type { SessionItem } from "@/types/menu";
import { SessionHeader } from "./features/SessionHeader";
import { MenuSection } from "./features/MenuSection";
import { CustomerDetails } from "./features/CustomerDetails";
import { FulfillmentSection } from "./features/FulfillmentSection";
import { NotesSection } from "./features/NotesSection";

interface OrderFormProps {
  session: Session;
  sessionItems: SessionItem[];
  form: UseFormReturn<OrderFormValues>;
  onSubmit: (values: OrderFormValues) => void;
}

export function OrderForm({
  session,
  sessionItems,
  form,
  onSubmit,
}: OrderFormProps) {
  return (
    <div className="min-h-screen bg-warm-cream">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SessionHeader session={session} />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <MenuSection sessionItems={sessionItems} form={form} />
          <CustomerDetails form={form} />
          <FulfillmentSection form={form} session={session} />
          <NotesSection form={form} />
          <button
            type="submit"
            className="cursor-pointer w-full bg-crust-gold hover:bg-crust-gold-deep text-ink-dark font-sans font-semibold rounded-[14px] py-3.5 text-sm transition-colors mb-8"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}
