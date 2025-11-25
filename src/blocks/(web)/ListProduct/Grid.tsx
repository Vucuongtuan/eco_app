import { ProductCard } from "@/components/ProductList/ProductCard";
import { cn } from "@/lib/utils";
import { ListProductProps } from "./type";

export default function GridComp(props: ListProductProps) {
  const { gap, data, lang } = props;
  const gapClass = `gap-${gap}`;
  return (
    <div className={"w-full"}>
      <ul
        className={cn(
          "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          "gap-2"
        )}
      >
        {[...data, ...data].map((d) => (
          <li key={d.id} className={cn("size-full")}>
            <ProductCard doc={d} lang={lang} />
          </li>
        ))}
      </ul>
    </div>
  );
}
