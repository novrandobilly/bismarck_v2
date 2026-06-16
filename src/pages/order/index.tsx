import { useParams } from "react-router-dom";
import { useOrderPage } from "./hooks/useOrderPage";
import { LoadingState } from "./features/LoadingState";
import { SessionNotFound } from "./features/SessionNotFound";
import { SessionClosed } from "./features/SessionClosed";
import { OrderForm } from "./features/OrderForm";
import { ConfirmationModal } from "./features/ConfirmationModal";
import type { OrderFormValues } from "@/types/order";

export default function OrderPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    data,
    isLoading,
    error,
    form,
    isClosed,
    openModal,
    closeModal,
    navigate,
  } = useOrderPage();

  function onSubmit(values: OrderFormValues) {
    if (!data) return;
    openModal(
      <ConfirmationModal
        values={values}
        sessionId={data.session.id}
        sessionItems={data.sessionItems}
        onCancel={closeModal}
        onSuccess={(orderId) => {
          closeModal();
          navigate(`/order/${sessionId}/success?orderId=${orderId}`);
        }}
      />,
    );
  }

  if (!sessionId) return null;
  if (isLoading) return <LoadingState />;
  if (error || !data) return <SessionNotFound />;
  if (isClosed) return <SessionClosed />;

  return (
    <OrderForm
      session={data.session}
      sessionItems={data.sessionItems}
      form={form}
      onSubmit={onSubmit}
    />
  );
}
