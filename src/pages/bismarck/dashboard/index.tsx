import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useSessions,
  hasOpenSession,
} from "@/pages/bismarck/sessions/hooks/useSessions";
import { useMenuItems } from "@/hooks/useMenuItems";
import {
  useMenuItemMutations,
  type MenuItemFormData,
} from "@/pages/bismarck/menu/hooks/useMenuItemMutations";
import { MenuItemFormModal } from "@/pages/bismarck/menu/features/MenuItemFormModal";
import { SessionCard } from "@/pages/bismarck/sessions/features/SessionCard";
import { OpenSessionPreview } from "./features/OpenSessionPreview";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { cn } from "@/lib/utils/cn";

import type { MenuItem } from "@/types/menu";

function MenuItemChip({
  item,
  onEdit,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(item)}
      className="w-full text-left flex items-center gap-3 bg-white border border-stone-100 rounded-xl px-3 py-2.5 hover:border-amber-300 hover:shadow-sm transition-all group"
    >
      <ProductThumbnail item={item} className="w-10 h-10 rounded-lg shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-800 truncate">
          {item.name}
        </p>
        <p className="text-xs text-stone-400 mt-0.5 capitalize">
          {item.category ?? ""}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-stone-700">
          Rp {item.default_price.toLocaleString("id-ID")}
        </span>
        <span className="text-xs text-stone-300 group-hover:text-amber-500 transition-colors">
          ✏️
        </span>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems();
  const { createItem, updateItem } = useMenuItemMutations();
  const [editTarget, setEditTarget] = useState<MenuItem | null | undefined>(
    undefined,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const openSessions = sessions.filter(
    (s) => s.status === "open" && new Date() <= new Date(s.order_deadline),
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "closed" || new Date() > new Date(s.order_deadline),
  );
  const activeItems = menuItems.filter((i) => i.is_active);
  const archivedItems = menuItems.filter((i) => !i.is_active);

  const canCreateSession = !hasOpenSession(sessions);

  const isModalOpen = editTarget !== undefined;
  const isSaving = createItem.isPending || updateItem.isPending;

  function handleSave(data: MenuItemFormData) {
    setSaveError(null);
    if (editTarget) {
      updateItem.mutate(
        { id: editTarget.id, data, currentImagePath: editTarget.image },
        {
          onSuccess: () => setEditTarget(undefined),
          onError: (err) =>
            setSaveError(
              err instanceof Error ? err.message : "Failed to save item",
            ),
        },
      );
    } else {
      createItem.mutate(data, {
        onSuccess: () => setEditTarget(undefined),
        onError: (err) =>
          setSaveError(
            err instanceof Error ? err.message : "Failed to save item",
          ),
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* ── Preorder Sessions ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800">
              Preorder Sessions
            </h2>
            <p className="text-stone-400 text-sm">
              {sessions.length} total sessions
            </p>
          </div>
          {sessionsLoading ? null : canCreateSession ? (
            <Link
              to="/bismarck/sessions/new"
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              + New Session
            </Link>
          ) : (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-45 text-center">
              Close the open session before creating a new one
            </span>
          )}
        </div>

        {sessionsLoading ? (
          <LoadingSpinner centered />
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
            <p className="text-3xl mb-2">🥯</p>
            <p className="text-stone-700 font-medium">No sessions yet</p>
            <p className="text-stone-400 text-sm mt-1">
              Create your first preorder session to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {openSessions.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Open
                </p>
                <div className="space-y-3">
                  {openSessions.map((s) => (
                    <OpenSessionPreview key={s.id} session={s} />
                  ))}
                </div>
              </div>
            )}
            {pastSessions.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Past
                </p>
                <div className="space-y-3">
                  {pastSessions.map((s) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Menu ──────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Menu</h2>
            <p className="text-stone-400 text-sm">
              {activeItems.length} active items
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditTarget(null)}
              className={cn(
                "cursor-pointer bg-stone-900 hover:bg-stone-700 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors",
              )}
            >
              + Add Item
            </button>
          </div>
        </div>

        {menuLoading ? (
          <LoadingSpinner centered />
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
            <p className="text-3xl mb-2">🍞</p>
            <p className="text-stone-700 font-medium">No menu items yet</p>
            <p className="text-stone-400 text-sm mt-1">
              Add your first item to the catalog.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeItems.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Active
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeItems.map((item) => (
                    <MenuItemChip
                      key={item.id}
                      item={item}
                      onEdit={setEditTarget}
                    />
                  ))}
                </div>
              </div>
            )}
            {archivedItems.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Archived
                </p>
                <div
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-60",
                  )}
                >
                  {archivedItems.map((item) => (
                    <MenuItemChip
                      key={item.id}
                      item={item}
                      onEdit={setEditTarget}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {isModalOpen && (
        <MenuItemFormModal
          item={editTarget}
          onSave={handleSave}
          onClose={() => {
            setEditTarget(undefined);
            setSaveError(null);
          }}
          isSaving={isSaving}
          saveError={saveError}
        />
      )}
    </div>
  );
}
