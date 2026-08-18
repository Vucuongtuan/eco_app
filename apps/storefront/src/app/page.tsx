import { RenderSections } from "@/components/Blocks";
import { getHomeContent } from "@/services/actions";

export default async function Home() {
  const dataHome = await getHomeContent()
  console.log(dataHome)
  return (
    <main className="min-h-screen text-foreground">
     <RenderSections home={dataHome} />
    </main>
  );
}
