import type { NormalizedProduct } from "./schema.ts";

export type ImportedProductIds = Record<string, { shopifyId: string; importedAt: string }>;

export type ColorLink = {
  sourceId: string;
  shopifyId: string;
  title: string;
  styleGroup: string;
  color: string;
  siblingIds: string[];
};

export function buildColorLinks(products: NormalizedProduct[], imported: ImportedProductIds): ColorLink[] {
  const available = products.flatMap((product) => {
    const record = imported[product.source.productId];
    const color = product.attributes.color;
    if (!record || !color) return [];
    return [{ product, shopifyId: record.shopifyId, color }];
  });
  const groups = new Map<string, typeof available>();
  for (const item of available) {
    const group = groups.get(item.product.identity.styleGroup) ?? [];
    group.push(item);
    groups.set(item.product.identity.styleGroup, group);
  }

  return available.map((item) => {
    const styleGroup = item.product.identity.styleGroup;
    return {
      sourceId: item.product.source.productId,
      shopifyId: item.shopifyId,
      title: item.product.identity.title,
      styleGroup,
      color: item.color,
      siblingIds: (groups.get(styleGroup) ?? [])
        .filter((candidate) => candidate.shopifyId !== item.shopifyId)
        .map((candidate) => candidate.shopifyId),
    };
  });
}

export function colorLinkMetafields(link: ColorLink) {
  const metafields = [
    {
      ownerId: link.shopifyId,
      namespace: "moon",
      key: "color",
      type: "single_line_text_field",
      value: link.color,
    },
  ];
  if (link.siblingIds.length) {
    metafields.push({
      ownerId: link.shopifyId,
      namespace: "moon",
      key: "color_siblings",
      type: "list.product_reference",
      value: JSON.stringify(link.siblingIds),
    });
  }
  return metafields;
}
