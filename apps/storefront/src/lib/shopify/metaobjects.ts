import "server-only";
import { storefrontRequest } from "./client";
import type { Image } from "./types";

const METAOBJECTS_QUERY = `
  query Metaobjects($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image { url altText width height }
            }
          }
        }
      }
    }
  }
`;

const METAOBJECTS_BY_IDS_QUERY = `
  query MetaobjectsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Metaobject {
        id
        handle
        fields { key value reference { ... on MediaImage { image { url altText width height } } } }
      }
    }
  }
`;

type RawMetaobject = {
  id: string;
  handle: string;
  fields: Array<{
    key: string;
    value: string;
    reference: { image: Image } | null;
  }>;
};

type MetaobjectsResponse = { metaobjects: { nodes: RawMetaobject[] } };

export type CmsMetaobject = {
  id: string;
  handle: string;
  fields: Record<string, string>;
  references: Record<string, Image | null>;
};

export async function getMetaobjects(type: string, first = 20): Promise<CmsMetaobject[]> {
  const data = await storefrontRequest<MetaobjectsResponse, { type: string; first: number }>(
    METAOBJECTS_QUERY,
    { type, first },
  );

  return data.metaobjects.nodes.map((node) => ({
    id: node.id,
    handle: node.handle,
    fields: Object.fromEntries(node.fields.map((field) => [field.key, field.value])),
    references: Object.fromEntries(node.fields.map((field) => [field.key, field.reference?.image ?? null])),
  }));
}

export async function getMetaobjectsByIds(ids: string[]): Promise<CmsMetaobject[]> {
  if (!ids.length) return [];
  const data = await storefrontRequest<{ nodes: Array<RawMetaobject | null> }, { ids: string[] }>(
    METAOBJECTS_BY_IDS_QUERY,
    { ids },
  );
  return data.nodes.filter((node): node is RawMetaobject => Boolean(node)).map((node) => ({
    id: node.id,
    handle: node.handle,
    fields: Object.fromEntries(node.fields.map((field) => [field.key, field.value])),
    references: Object.fromEntries(node.fields.map((field) => [field.key, field.reference?.image ?? null])),
  }));
}

export function listField(entry: CmsMetaobject, key: string): string[] {
  const value = entry.fields[key];
  if (!value) return [];
  try {
    return JSON.parse(value) as string[];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}
