"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, X } from "lucide-react";

// TODO: swap in the real Fresava Facebook Page URL once it's available.
const FACEBOOK_URL: string | null = null;

const WHATSAPP_NUMBER = "8801633366606";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Fresava! I'd like to order the Dragon Fruit & Honey Jelly."
)}`;

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M16.02 2.67c-7.36 0-13.33 5.97-13.33 13.33 0 2.35.62 4.63 1.79 6.64L2.67 29.33l6.86-1.8a13.27 13.27 0 0 0 6.49 1.65h.01c7.36 0 13.33-5.97 13.33-13.33S23.38 2.67 16.02 2.67Zm0 24.4h-.01a11.1 11.1 0 0 1-5.66-1.55l-.41-.24-4.07 1.07 1.09-3.97-.27-.41a11.05 11.05 0 0 1-1.7-5.9c0-6.11 4.97-11.08 11.09-11.08 2.96 0 5.75 1.16 7.84 3.25a11.02 11.02 0 0 1 3.25 7.84c0 6.11-4.97 11-11.08 11Zm6.08-8.29c-.33-.17-1.96-.97-2.27-1.08-.3-.11-.53-.17-.75.17-.22.33-.86 1.08-1.06 1.31-.2.22-.39.25-.72.08-.33-.17-1.4-.51-2.66-1.63-.98-.88-1.65-1.96-1.84-2.29-.19-.33-.02-.51.15-.68.15-.15.33-.39.5-.58.17-.2.22-.33.33-.55.11-.22.06-.42-.03-.58-.08-.17-.75-1.8-1.03-2.47-.27-.65-.55-.56-.75-.57h-.64c-.22 0-.58.08-.88.42-.3.33-1.15 1.13-1.15 2.75 0 1.62 1.18 3.19 1.34 3.41.17.22 2.32 3.55 5.63 4.98.79.34 1.4.54 1.88.7.79.25 1.51.21 2.08.13.63-.09 1.96-.8 2.24-1.58.28-.77.28-1.43.2-1.57-.08-.14-.3-.22-.63-.39Z" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M27 16c0-6.08-4.92-11-11-11S5 9.92 5 16c0 5.49 4.02 10.04 9.28 10.87v-7.69h-2.79V16h2.79v-2.42c0-2.76 1.64-4.28 4.15-4.28 1.2 0 2.46.21 2.46.21v2.7h-1.39c-1.36 0-1.79.85-1.79 1.72V16h3.05l-.49 3.18h-2.56v7.69C22.98 26.04 27 21.49 27 16Z" />
    </svg>
  );
}

export function OrderNow() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed right-5 bottom-5 z-[60] sm:right-6 sm:bottom-6">
      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-3 w-64 overflow-hidden rounded-2xl border border-maroon/10 bg-white shadow-xl shadow-black/10"
        >
          <div className="flex items-center justify-between border-b border-maroon/10 px-4 py-3">
            <p className="text-sm font-medium text-ink">Order via</p>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-ink/40 hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-sm text-ink transition-colors hover:bg-maroon/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#1DA851]">
              <WhatsAppIcon className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block font-medium">WhatsApp</span>
              <span className="block text-xs text-ink/50">+880 1633-366606</span>
            </span>
          </a>

          {FACEBOOK_URL ? (
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-sm text-ink transition-colors hover:bg-maroon/5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2]">
                <FacebookIcon className="h-4.5 w-4.5" />
              </span>
              <span className="font-medium">Facebook Page</span>
            </a>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3.5 text-sm text-ink/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5">
                <FacebookIcon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block font-medium">Facebook Page</span>
                <span className="block text-xs">Link coming soon</span>
              </span>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-maroon px-6 py-3.5 text-sm font-medium text-cream-soft shadow-lg shadow-maroon/25 transition-colors hover:bg-maroon-deep"
      >
        <ShoppingBag size={17} strokeWidth={1.5} />
        Order Now
      </button>
    </div>
  );
}
