import { useHomePage } from "./hooks/useHomePage";
import { BrandHeader } from "./features/BrandHeader";
import { CurrentPreOrder } from "./features/CurrentPreOrder";
import { PastPreOrders } from "./features/PastPreOrders";
import { BagelFacts } from "./features/BagelFacts";

export default function HomePage() {
  const { isLoading, openSession, closedSessions } = useHomePage();

  return (
    <>
      <BrandHeader />

      <main className="max-w-3xl mx-auto px-4 pt-5 pb-10 space-y-12">
        <CurrentPreOrder isLoading={isLoading} openSession={openSession} />

        <PastPreOrders isLoading={isLoading} closedSessions={closedSessions} />

        <BagelFacts />
      </main>
    </>
  );
}
