import type { Header as HeaderType } from "@/payload-types";
import { Lang } from "@/types";
import { ActionButtons } from "./ActionButtons";
import { HeaderStatic } from "./HeaderStatic";

export async function Header({
  lang,
  data,
}: {
  lang: Lang;
  data?: HeaderType;
}) {
  if (!data) return null;
  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <HeaderStatic navData={data.navItems}>
        <ActionButtons />
      </HeaderStatic>
    </header>
  );
}
