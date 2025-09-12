import React, { useEffect, useMemo, useRef, useState } from "react";
import { TooltipAnchor, Button } from "~/components/ui";

const retailers = [
  "Alibaba",
  "Amazon",
  "ASOS",
  "eBay",
  "Etsy",
  "Flipkart",
  "Rakuten",
  "Shopify",
  "Target",
  "Walmart",
] as const;

type Retailer = typeof retailers[number];

function getInitials(name: string): string {
  const parts = name.split(/\s|-/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const colorRing = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-lime-500",
  "bg-orange-500",
  "bg-teal-500",
];

export default function StoresDropdown() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const items: Retailer[] = useMemo(() => [...retailers].sort(), []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t) && buttonRef.current && !buttonRef.current.contains(t)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const firstItem = menuRef.current?.querySelector<HTMLButtonElement>("[data-menuitem]");
      firstItem?.focus();
      setActiveIndex(0);
    }
  }, [open]);

  const onToggle = () => setOpen((v) => !v);

  const onKeyDownButton: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onKeyDownMenu: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
      (menuRef.current?.querySelectorAll("[data-menuitem]")?.[ (activeIndex + 1) % items.length ] as HTMLElement | undefined)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
      (menuRef.current?.querySelectorAll("[data-menuitem]")?.[ (activeIndex - 1 + items.length) % items.length ] as HTMLElement | undefined)?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const store = items[activeIndex];
      console.log("Selected store:", store);
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const renderIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 9.5c0-.4.1-.8.3-1.1l1.8-3.2A2 2 0 0 1 6.8 4h10.4c.7 0 1.4.4 1.7 1.1l1.8 3.2c.2.3.3.7.3 1.1V11a3 3 0 0 1-3 3 3 3 0 0 1-2.5-1.3A3 3 0 0 1 12 14a3 3 0 0 1-3.5-1.3A3 3 0 0 1 6 14a3 3 0 0 1-3-3v-1.5Z" />
      <path d="M5 13.9V20a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-6.1A4.94 4.94 0 0 1 18 15c-1.2 0-2.3-.4-3.2-1.1-.8.7-2 1.1-3.2 1.1s-2.3-.4-3.2-1.1C7.5 14.6 6.3 15 5 15c-.3 0-.6 0-1-.1Z" />
    </svg>
  );

  return (
    <div className="relative">
      <TooltipAnchor
        description="Stores"
        render={
          <Button
            ref={buttonRef}
            size="icon"
            variant="outline"
            aria-haspopup="true"
            aria-expanded={open}
            aria-label="Stores"
            className="rounded-md border border-border-light bg-surface-secondary p-2 hover:bg-surface-hover max-md:hidden"
            onClick={onToggle}
            onKeyDown={onKeyDownButton}
          >
            {renderIcon}
          </Button>
        }
      />

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Stores menu"
          tabIndex={-1}
          onKeyDown={onKeyDownMenu}
          className="absolute right-0 z-40 mt-2 w-56 rounded-md border border-border-light bg-surface-primary text-text-primary shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-[#0f1a2a]"
        >
          <ul className="max-h-80 overflow-auto p-1">
            {items.map((name, idx) => {
              const initials = getInitials(name);
              const color = colorRing[idx % colorRing.length];
              const isActive = idx === activeIndex;
              return (
                <li key={name} className="list-none">
                  <button
                    type="button"
                    data-menuitem
                    role="menuitem"
                    className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors ${
                      isActive
                        ? "bg-surface-hover"
                        : "hover:bg-surface-hover focus:bg-surface-hover"
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      console.log("Selected store:", name);
                      setOpen(false);
                      buttonRef.current?.focus();
                    }}
                  >
                    <span className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-semibold text-white ${color}`}>
                      {initials}
                    </span>
                    <span className="truncate">{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
