import React, { Fragment } from "react";

import type { Props } from "./types";

import { Image } from "./Image";
import { Video } from "./Video";

export const Media: React.FC<Props> = (props) => {
  const { htmlElement = "figure", resource, fClassName } = props;

  const isVideo =
    typeof resource === "object" && resource?.mimeType?.includes("video");
  const Tag = (htmlElement as any) || Fragment;

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className: fClassName,
          }
        : {})}
    >
      {isVideo ? <Video {...props} /> : <Image {...props} />}
    </Tag>
  );
};
