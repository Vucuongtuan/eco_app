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

const COLOR_HEX: Record<string, string> = {
  black: "#000000", white: "#FFFFFF", gray: "#808080", grey: "#808080", charcoal: "#36454F",
  brown: "#8B4513", "dark-brown": "#5C4033", cocoa: "#6F4E37", cinnamon: "#D2691E", beige: "#F5F5DC",
  cream: "#FFFDD0", ecru: "#C2B280", sand: "#C2B280", sandstone: "#CDB79E", taupe: "#483C32",
  orange: "#FFA500", tangerine: "#F28500", red: "#FF0000", rose: "#FF007F", rosewood: "#65000B",
  blush: "#DE5D83", "dusty-pink": "#DCAE96", "dusty-rose": "#C08081", lavender: "#C8A2C8", maroon: "#800000",
  yellow: "#FFFF00", butter: "#FCEFB4", chartreuse: "#7FFF00", mint: "#98FF98", "mint-grey": "#A8B5A2",
  emerald: "#50C878", "forest-green": "#228B22", "army-green": "#4B5320", "khaki-green": "#606E3A",
  olive: "#808000", moss: "#8A9A5B", sage: "#9CAF88", "peacock-green": "#00A693", navy: "#000080",
  "stripes-blue": "#4169E1", "stripes-ecru": "#C2B280", "stripes-grey": "#808080", "stripes-dark-plum": "#673147",
  "dark-plum": "#673147", eggplant: "#614051", "abstract-dark-plum": "#673147", purple: "#800080",
  denim: "#1560BD", "dark-denim": "#1F3A5F", "light-denim": "#6F8FAF", "dusty-blue": "#7A9EAC",
  "grey-blue": "#6699CC", "dark-grey": "#4A4A4A", "light-grey": "#D3D3D3", "gray-green": "#5E716A",
  "dark-charcoal": "#333333", "dark-melange-grey": "#696969", "heather-grey": "#B6B6B6", "light-melange": "#C7C7C7",
  stone: "#928E85", fog: "#DDE1E3", "floral-navy": "#1B263B", "corn": "#FBEC5D", vermillion: "#E34234",
  "black-stripes": "#000000", checkered: "#555555", "checkered-black": "#000000",
};

function colorToHex(color: string) {
  const normalized = color.trim().toLowerCase().replace("lavendar", "lavender");
  return COLOR_HEX[normalized] ?? "#808080";
}

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
      // Keep the complete, stable color order for every product, including itself.
      siblingIds: (groups.get(styleGroup) ?? []).map((candidate) => candidate.shopifyId),
    };
  });
}

export function colorLinkMetafields(link: ColorLink) {
  const metafields = [
    {
      ownerId: link.shopifyId,
      namespace: "custom",
      key: "color",
      type: "color",
      value: colorToHex(link.color),
    },
  ];
  if (link.siblingIds.length) {
    metafields.push({
      ownerId: link.shopifyId,
      namespace: "custom",
      key: "color_siblings",
      type: "list.product_reference",
      value: JSON.stringify(link.siblingIds),
    });
  }
  return metafields;
}
