import Link from "next/link";
import type { ReactNode } from "react";

export type ColorSwatch = { id: string; label: string; value: string; href?: string; selected?: boolean };

export function ColorSwatches({ items, onSelect }: { items: ColorSwatch[]; onSelect?: (item: ColorSwatch) => void }) {
  return <div className="flex flex-wrap items-center gap-2" aria-label="Color variants">
    {items.map((item) => {
      const className = `inline-flex size-4 rounded-full border border-gray-300 transition-transform hover:scale-110 ${item.selected ? "ring-1 ring-gray-900 ring-offset-2" : ""}`;
      const swatch = <span aria-hidden="true" className={className} style={{ backgroundColor: item.value }} />;
      return item.href ? <Link key={item.id} href={item.href} scroll={false} aria-label={item.label} title={item.label} aria-current={item.selected ? "page" : undefined}>{swatch}</Link> : <button key={item.id} type="button" aria-label={item.label} aria-pressed={item.selected} onClick={() => onSelect?.(item)}>{swatch}</button>;
    })}
  </div>;
}
