import { RenderSections } from "@/components/Blocks";
import { getHomeContent } from "@/services/actions";
import { JsonLd } from "@/components/Seo/JsonLd";
import { generateMetadata as createMetadata } from "@/utils/generateMetadata";
import { absoluteUrl, websiteJsonLd } from "@/utils/structured-data";

export function generateMetadata() {
  return createMetadata({ title: "Moon Co.", description: "Moon Co. online store.", path: "/" });
}

export default async function Home() {
  const dataHome = await getHomeContent();
  return (
    <main className="min-h-screen text-foreground space-y-0.5">
      <JsonLd
        data={websiteJsonLd({
          name: "Moon Co.",
          url: absoluteUrl("/"),
          description: "Moon Co. online store.",
        })}
      />
      <RenderSections home={dataHome} />
    </main>
  );
}
