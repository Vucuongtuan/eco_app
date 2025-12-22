import { Category, Media, Page, Post, Search } from "./payload-types";

export type Lang = "vi" | "en";

export interface AnnouncementSettings {
  transition: "blur" | "slide-horizontal" | "slide-vertical";
  interval: number;
  announcement: Announcement[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
}
export interface NavItemBase {
  checkTypeLink: "internal" | "external";
  isblank?: boolean;
  title?: string;
  link?: string;
  localLink?: {
    value: Post | Page | Category;
    relationTo: "pages" | "posts" | "categories";
  };
  id: string;
}

export interface NavItem extends NavItemBase {
  children?: NavItemBase[];
}

export interface ResponseDocs<T> {
  docs: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number | null;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

export interface RichTextContent {
  root: {
    type: "root";
    children: {
      type: string;
      version: number;
      [k: string]: unknown;
    }[];
    direction: ("ltr" | "rtl") | null;
    format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    indent: number;
    version: number;
  };
  [k: string]: unknown;
}

export interface MediaRes extends Media {
  blurUrl?: string;
}

export interface GalleryBlock {
  id: string;
  content?: {
    title: string;
    description: string;
    cta?: NavItemBase;
  };
  image: Media;
}

export interface PaginationOption {
  limit?: number;
  page?: number;
}

export type Layout = ("container" | "full" | "wide" | "narrow") | null;

export type Direction = ("horizontal" | "vertical") | null;

export interface FAQBlock {
  id: string;
  direction: Direction;
  layout: Layout;
  content?: RichTextContent;
  faqList: {
    question: string;
    answer: RichTextContent;
  }[];
}

export interface NavChildItem {
  /** Choose whether this is an internal or external link */ checkTypeLink?:
    | "internal"
    | "external"
    | null;
  /** Check if this item opens the document in a new window or tab */ isblank?:
    | boolean
    | null;
  /** Enter the name for the menu item */ title?: string | null;
  /** Enter the external URL to link to */ link?: string | null;
  /** Select an internal page or product to link to */ localLink?:
    | { relationTo: "pages"; value: number | Page }
    | { relationTo: "posts"; value: number | Post }
    | { relationTo: "categories"; value: number | Category }
    | null;
  id?: string | null;
}

export interface LayoutDefaultBlock {
  layout?: "container" | "full" | "wide" | "narrow";
  column?: "one-column" | "two-column" | "three-column";
}

export type SearchResultDoc = Pick<
  Search,
  "id" | "title" | "doc" | "thumbnail" | "url"
>;
export type SearchTagResultDoc = Pick<Post, "id" | "title" | "slug" | "image">;
