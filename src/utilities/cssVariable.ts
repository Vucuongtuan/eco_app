type SpacingProps = "none" | "small" | "medium" | "large";

export const spacing = (
  type: SpacingProps,
  cssType: "py" | "gap" = "py"
): string => {
  const prefix = cssType;

  switch (type) {
    case "none":
      return `${prefix}-1`;
    case "small":
      return `${prefix}-4 md:${prefix}-6`;
    case "medium":
      return `${prefix}-6 lg:${prefix}-16`;
    case "large":
      return `${prefix}-8 md:${prefix}-16 xl:${prefix}-24`;
    default:
      return "";
  }
};

type LayoutProps = "container" | "full" | "wide" | "narrow";
export const layoutCtn = (type: LayoutProps): string => {
  switch (type) {
    case "container":
      return "container max-w-screen-xl mx-auto";
    case "full":
      return "w-full mx-auto";
    case "wide":
      return "max-w-screen-2xl mx-auto";
    case "narrow":
      return "max-w-screen-lg mx-auto";
    default:
      return "";
  }
};

type ColumnProps = "one-column" | "two-column" | "three-column";
export const columnCl = (type: ColumnProps): string => {
  switch (type) {
    case "one-column":
      return "grid grid-cols-1";
    case "two-column":
      return "grid grid-cols-1 md:grid-cols-2";
    case "three-column":
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    default:
      return "";
  }
};

type AspectProps =
  | "auto"
  | "ultrawide"
  | "photo"
  | "poster"
  | "story"
  | "insta"
  | "retro"
  | "video"
  | "square"
  | "wide";
export const aspectConfig = (type: AspectProps): string => {
  switch (type) {
    case "auto":
      return "aspect-auto";
    case "ultrawide":
      return "aspect-ultrawide";
    case "photo":
      return "aspect-photo";
    case "poster":
      return "aspect-poster";
    case "story":
      return "aspect-story";
    case "insta":
      return "aspect-insta";
    case "retro":
      return "aspect-retro";
    case "video":
      return "aspect-video";
    case "square":
      return "aspect-square";
    case "wide":
      return "aspect-wide";
    default:
      return "";
  }
};

export const cssVariables = {
  breakpoints: {
    "3xl": 1920,
    "2xl": 1536,
    xl: 1280,
    lg: 1024,
    md: 768,
    sm: 640,
  },
};
