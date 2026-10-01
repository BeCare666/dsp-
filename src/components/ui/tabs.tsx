"use client";

import { useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  // Phase 6 : compteur optionnel affiché à côté du libellé.
  compteur?: number;
}

export function Tabs({ items, defaultId }: { items: TabItem[]; defaultId?: string }) {
  const [actif, setActif] = useState(defaultId ?? items[0]?.id);
  const onglet = items.find((i) => i.id === actif);

  return (
    <div>
      <div role="tablist" className="scrollbar-fin flex gap-1 overflow-x-auto border-b border-border">
        {items.map((item) => {
          const selectionne = item.id === actif;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selectionne}
              onClick={() => setActif(item.id)}
              className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                selectionne ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {item.label}
              {item.compteur !== undefined && (
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    selectionne ? "bg-primary-soft text-primary" : "bg-bg-subtle text-text-faint"
                  }`}
                >
                  {item.compteur}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-5">
        {onglet?.content}
      </div>
    </div>
  );
}
