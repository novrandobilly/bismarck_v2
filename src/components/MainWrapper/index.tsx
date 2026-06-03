import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { useAuth } from "@/hooks/useAuth";
import logoBlack from "@/assets/envien-bagel-logo-black.svg";
import logoWhite from "@/assets/envien-bagel-logo-white.svg";
import mascotBlack from "@/assets/envien-bagel-mascot-black.svg";
import mascotWhite from "@/assets/envien-bagel-mascot-white.svg";

// ── Mobile Drawer ──────────────────────────────────────────────────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  mascot: string;
  mascotAlt: string;
  drawerBg?: string;
  overlayClass?: string;
}

function MobileDrawer({ open, onClose, children, mascot, mascotAlt, drawerBg = "bg-white", overlayClass = "bg-black/40" }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${overlayClass} ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 ${drawerBg} shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-current opacity-50 hover:opacity-100 transition-opacity text-xl leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>

        {/* Nav content */}
        <div className="flex-1 px-6 pt-8 pb-4">
          {children}
        </div>

        {/* Mascot ornament */}
        <div className="px-6 pb-6 flex justify-center">
          <img src={mascot} alt={mascotAlt} className="w-24 opacity-20 select-none" draggable={false} />
        </div>
      </div>
    </>
  );
}

// ── Hamburger Icon ─────────────────────────────────────────────────────────

function HamburgerButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      className={`sm:hidden flex flex-col justify-center gap-1.5 w-8 h-8 ${className ?? ""}`}
    >
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-4 rounded-full bg-current" />
    </button>
  );
}

// ── Guest Wrapper ──────────────────────────────────────────────────────────

export function GuestWrapper() {
  const { isAuthenticated } = useAuth();
  const logout = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warm-cream font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-surface-white border-b border-kraft-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <img src={logoBlack} alt="Envien Bagel" className="h-8" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-5 text-sm text-ink-medium">
            <Link to="/" className="hover:text-ink-dark transition-colors">
              Home
            </Link>
            <Link to="/menu" className="hover:text-ink-dark transition-colors">
              Menu
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/bismarck/dashboard"
                  className="hover:text-ink-dark transition-colors font-semibold text-crust-gold"
                >
                  Dashboard →
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="cursor-pointer text-ink-light hover:text-ink-dark transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </nav>

          <HamburgerButton onClick={() => setDrawerOpen(true)} className="text-ink-dark" />
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mascot={mascotBlack}
        mascotAlt="Envien Bagel mascot"
        drawerBg="bg-warm-cream"
      >
        <img src={logoBlack} alt="Envien Bagel" className="h-7 mb-8" />
        <nav className="flex flex-col gap-1 text-ink-dark text-base font-medium">
          <Link to="/" onClick={() => setDrawerOpen(false)} className="py-2 hover:text-crust-gold transition-colors">
            Home
          </Link>
          <Link to="/menu" onClick={() => setDrawerOpen(false)} className="py-2 hover:text-crust-gold transition-colors">
            Menu
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/bismarck/dashboard"
                onClick={() => setDrawerOpen(false)}
                className="py-2 text-crust-gold font-semibold hover:text-crust-gold-deep transition-colors"
              >
                Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => { logout(); setDrawerOpen(false); }}
                className="cursor-pointer text-left py-2 text-ink-light hover:text-ink-dark transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </MobileDrawer>

      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-kraft-border">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-ink-light font-sans">
          <span>© {new Date().getFullYear()} Envien Bagel</span>
          <span>Small batch · Wild yeast · Made to order</span>
        </div>
      </footer>
    </div>
  );
}

// ── Admin Wrapper ──────────────────────────────────────────────────────────

export function AdminWrapper() {
  const logout = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="sticky top-0 z-10 bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/bismarck/dashboard">
              <img src={logoWhite} alt="Envien Bagel" className="h-8" />
            </Link>
            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link
                to="/bismarck/dashboard"
                className="text-stone-300 hover:text-white transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/"
                className="text-stone-400 hover:text-white transition-colors"
              >
                View Store ↗
              </Link>
              <Link
                to="/bismarck/payments"
                className="text-stone-400 hover:text-white transition-colors"
              >
                Payments
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="hidden sm:block cursor-pointer text-stone-400 hover:text-white text-sm transition-colors"
            >
              Logout
            </button>
            <HamburgerButton onClick={() => setDrawerOpen(true)} className="text-white" />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mascot={mascotWhite}
        mascotAlt="Envien Bagel mascot"
        drawerBg="bg-stone-900"
        overlayClass="bg-black/60"
      >
        <img src={logoWhite} alt="Envien Bagel" className="h-7 mb-8" />
        <nav className="flex flex-col gap-1 text-white text-base font-medium">
          <Link to="/bismarck/dashboard" onClick={() => setDrawerOpen(false)} className="py-2 text-stone-200 hover:text-white transition-colors font-semibold">
            Dashboard
          </Link>
          <Link to="/" onClick={() => setDrawerOpen(false)} className="py-2 text-stone-400 hover:text-white transition-colors">
            View Store ↗
          </Link>
          <Link to="/bismarck/payments" onClick={() => setDrawerOpen(false)} className="py-2 text-stone-400 hover:text-white transition-colors">
            Payments
          </Link>
          <button
            type="button"
            onClick={() => { logout(); setDrawerOpen(false); }}
            className="cursor-pointer text-left py-2 text-stone-500 hover:text-white transition-colors mt-2"
          >
            Logout
          </button>
        </nav>
      </MobileDrawer>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
