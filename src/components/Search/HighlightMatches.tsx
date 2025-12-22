import { charMap } from "@/utilities/charMap";
import React from "react";

const normalizeChar = (char: string): string => {
  return charMap[char] || char.toLowerCase();
};

const normalize = (str: string): string => {
  return str.split("").map(normalizeChar).join("");
};

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function HighlightMatches({
  text,
  keyword,
}: {
  text: string;
  keyword: string;
}) {
  if (!keyword) return <>{text}</>;

  const keywords = keyword
    .split(/\s+/)
    .map((k) => normalize(k.trim()))
    .filter(Boolean);

  if (keywords.length === 0) return <>{text}</>;

  const patterns = keywords.map((normKeyword) => {
    return normKeyword
      .split("")
      .map((char) => {
        const vietnameseVariants = Object.keys(charMap).filter(
          (key) => charMap[key] === char
        );
        if (vietnameseVariants.length > 0) {
          return `(${[char, ...vietnameseVariants].join("|")})`;
        }
        return escapeRegex(char);
      })
      .join("");
  });

  const finalRegex = new RegExp(patterns.join("|"), "gi");

  let match;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  while ((match = finalRegex.exec(text)) !== null) {
    const start = match.index;
    const end = finalRegex.lastIndex;
    if (start > lastIndex) result.push(text.slice(lastIndex, start));
    result.push(<strong key={start}>{text.slice(start, end)}</strong>);
    lastIndex = end;
  }

  result.push(text.slice(lastIndex));
  return <>{result}</>;
}
