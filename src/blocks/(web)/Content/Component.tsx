import { RichText } from "@/components/RichText";
import type { ContentBlock as ContentBlockProps } from "@/payload-types";
import { cn } from "@/utilities/cn";
import { layoutCtn } from "@/utilities/cssVariable";
import type { DefaultDocumentIDType } from "payload";
import React from "react";

export const colsSpanClasses = {
  full: "lg:col-span-12",
  half: "lg:col-span-6",
  oneThird: "lg:col-span-4",
  twoThirds: "lg:col-span-8",
};

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType;
    className?: string;
  }
> = (props) => {
  const { columns, layout } = props;

  return (
    <div className={`${layoutCtn(layout || "container")} my-16 max-md:px-6`}>
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { richText, size } = col;
            const colsClass = `col-span-4 ${colsSpanClasses[size!]}`;
            return (
              <div
                className={cn(colsClass, {
                  "md:col-span-2": size !== "full",
                })}
                key={index}
              >
                {richText && (
                  <RichText
                    data={richText}
                    enableGutter={false}
                    // enableProse={false}
                    // className="prose md:prose-lg lg:prose-lg"
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
