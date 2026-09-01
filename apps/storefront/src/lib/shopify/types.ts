export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  thumbhash?: string | null;
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  featuredImage: Image | null;
  priceRange: { minVariantPrice: Money };
  variants?: { nodes: ProductVariant[] };
  images?: { nodes: Image[] };
  color?: { value: string } | null;
  styleGroup?: { value: string } | null;
  colorSiblings?: { references: { nodes: Array<ProductCard | null> } } | null;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type Product = ProductCard & {
  descriptionHtml: string;
  images: { nodes: Image[] };
  variants: { nodes: ProductVariant[] };
  color: { value: string } | null;
  colorSiblings: {
    references: { nodes: Array<ProductCard | null> };
  } | null;
};

export type FilterValue = {
  id: string;
  label: string;
  count: number;
  input: string;
};

export type Filter = {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: FilterValue[];
};

export type ProductFilterInput = Record<string, unknown>;

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: Image | null;
  products?: {
    nodes: ProductCard[];
    filters: Filter[];
    pageInfo: PageInfo;
  };
  updatedAt: string;
};

export type MenuItem = {
  id: string;
  title: string;
  type: string;
  url: string | null;
  resourceId: string | null;
  tags: string[];
  items?: MenuItem[];
};

export type Menu = {
  id: string;
  title: string;
  handle: string;
  itemsCount: number;
  items: MenuItem[];
};

export type MenuResponse = {
  menu: Menu | null;
};

export type MenuVariables = {
  handle: string;
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: ProductVariant & { product: Pick<ProductCard, "handle" | "title"> };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: { nodes: CartLine[] };
};

export type CartLineInput = { merchandiseId: string; quantity: number };
export type CartLineUpdateInput = { id: string; merchandiseId?: string; quantity?: number };
export type UserError = { field: string[] | null; message: string; code?: string | null };
