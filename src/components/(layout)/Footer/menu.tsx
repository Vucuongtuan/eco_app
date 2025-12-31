import type { Footer } from "@/payload-types";

import { CMSLink } from "@/components/Link";
import { cn } from "@/lib/utils";

interface Props {
  menu: Footer["navItems"];
}

export function FooterMenu({ menu }: Props) {
  if (!menu || menu.length === 0) return null;
  return (
    <nav>
      <ul>
        {menu?.map((item) => {
          return (
            <li key={item.id} className={cn("p-2")}>
              <CMSLink appearance="link" isLink className={cn()} {...item.link}>
                {item.link.label || "None"}
              </CMSLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
