import { cn } from "@/lib/utils";

interface MetaTitleProps {
  title: string;
  description?: string;
  align?: "center" | "left" | "right";
  tag?: "section" | "header";
  className?:string
}

export default function MetaTitle(props: MetaTitleProps) {
  const { title, description, align, tag = "section",className } = props;
  const Comp = tag as React.ElementType;
  return (
    <Comp
      className={cn(
        `w-full  mx-auto px-6 md:px-16 md:py-5 max-md:pb-4`,
        `max-w-screen-3xl border-b  border-neutral-300`,
        align === "center" && "text-center",
        align === "right" && "text-right",
        align === "left" && "text-left",
        className
      )}
    >
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p>{description}</p>}
    </Comp>
  );
}
