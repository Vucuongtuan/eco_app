import { thumbHashToDataURL } from "thumbhash";

export function thumbhashToDataUrl(value?: string | null) {
  if (!value || typeof atob === "undefined") return undefined;
  try {
    return thumbHashToDataURL(Uint8Array.from(atob(value), (character) => character.charCodeAt(0)));
  } catch {
    return undefined;
  }
}
