"use client";

import type { StaticImageData } from "next/image";

import { cn } from "@/utilities/cn";
import NextImage from "next/image";
import React from "react";

import { cssVariables } from "@/cssVariables";
import { getMediaURL } from "@/utilities/getMediaUrl";
import { motion } from "framer-motion";
import type { Props as MediaProps } from "../types";

const { breakpoints } = cssVariables;

const defaultblurImage =
  "iVBORw0KGgoAAAANSUhEUgAAACAAAAASBAMAAADI5sFhAAAAKlBMVEXWzNzZ0OD37eXW1OHRyNbU0d7b4OfW3OTW2eLf1eXr5uvi4+vy6ujIwctyquTEAAAA3klEQVQY0yXQoQ7CMBAG4GvCA3BZELPTuGbJcBO1JEuWvkIR+BY/sT4Boa9Q0AjqkKQS23fhrvzu/9rcNYWOs/88T0uP2IYAe4b8ebpFAwvkmlgBAA8QX68Y451gAjWKFowx55SSIdgoRXBZnbPGnC4EG74hKd4752WdEWgyYiMHv/QEgrZQBOJu7vU0Aa9VahzpKmqOPFyhlCMZEXfvLUEpBFuhZ+mdPRN8vwSo52G19CQG7jvprUkpRig8AVGultojZ1C8oqk953fuqLbYDKtJj3f9GhAhhBuf/3v3A8XYZf1jUclIAAAAAElFTkSuQmCC";

interface ImageProps extends MediaProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  imgSize?: "thumbnail" | "small" | "medium" | "large";
}
export const Image: React.FC<ImageProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    height: heightFromProps,
    imgClassName,
    imgSize,
    onClick,
    onLoad: onLoadFromProps,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    width: widthFromProps,
    focalX,
    focalY,
    onMouseEnter,
    onMouseLeave,
  } = props;

  const [isLoading, setIsLoading] = React.useState(true);

  let width: number | undefined | null;
  let height: number | undefined | null;
  let alt = altFromProps;
  let src: StaticImageData | string = srcFromProps || "";
  let blurImage = defaultblurImage;
  if (!src && resource && typeof resource === "object") {
    const {
      alt: altFromResource,
      filename: fullFilename,
      height: fullHeight,
      url,
      width: fullWidth,
      blurData,
    } = resource;
    blurImage = blurData || defaultblurImage;

    width = widthFromProps ?? fullWidth;
    height = heightFromProps ?? fullHeight;
    alt = altFromResource || "";

    const filename = fullFilename;

    src = getMediaURL(resource, imgSize || "medium");
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
        .map(([, value]) => `(max-width: ${value}px) ${value}px`)
        .join(", ");

  // const w = !fill ? width || widthFromProps : 600;
  // const h = !fill ? height || heightFromProps : 400;
  // const isDev = process.env.NODE_ENV === "development";
  return (
    <>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
      )}
      <NextImage
        alt={alt || ""}
        className={cn(imgClassName,
          
        )}
        style={{
          objectPosition: `${focalX}% ${focalY}%`
        }}
        fill={fill}
        width={!fill ? widthFromProps : undefined}
        height={!fill ? heightFromProps : undefined}
        onClick={onClick}
        onLoad={() => {
          setIsLoading(false);
          if (typeof onLoadFromProps === "function") {
            onLoadFromProps();
          }
        }}
        placeholder={"blur"}
        blurDataURL={blurImage}
        priority={priority}
        quality={85}
        sizes={sizes}
        src={src}
        // src={isDev ? `https://placehold.co/${w || 600}x${h || 400}` : src}
        {...(onMouseEnter ? { onMouseEnter } : {})}
        {...(onMouseLeave ? { onMouseLeave } : {})}
      />
    </>
  );
};
