import type { ProductType } from "./schema.ts";

type Gender = "men" | "women" | "kids" | "unisex" | "unknown";
type Department = "tops" | "bottoms" | "one-piece" | "accessories" | "unknown";

type TagRule = {
  gender?: Exclude<Gender, "unknown">;
  department?: Exclude<Department, "unknown">;
  productType?: Exclude<ProductType, "unknown">;
  collection?: string;
};

const TAG_RULES: Record<string, TagRule> = {
  "REB-MEN": { gender: "men" },
  "RBC- MEN": { gender: "men" },
  "BETWEENDAYS : MEN": { gender: "men" },
  "RBC- BOTTOM WOMEN": { gender: "women", department: "bottoms" },
  "REB-WOMEN": { gender: "women" },
  "RBC- WOMEN": { gender: "women" },
  "BETWEENDAYS": {},
  "REB-KIDS": { gender: "kids" },
  "RBC- KIDS": { gender: "kids" },
  "REB-MEN TOP": { department: "tops" },
  "RBC- TOPS MEN": { department: "tops" },
  "REB-MEN BOTTOMS": { department: "bottoms" },
  "RBC- BOTTOMS MEN": { department: "bottoms" },
  "REB-WOMEN TOPS": { department: "tops" },
  "RBC- TOPS WOMEN": { department: "tops" },
  "REB-WOMEN BOTTOMS": { department: "bottoms" },
  "REB-MEN SHIRTS": { productType: "shirt" },
  "RBC- SHIRTS MEN": { productType: "shirt" },
  "REB-MEN TEES": { productType: "t-shirt" },
  "RBC- TEE MEN": { productType: "t-shirt" },
  "REB-MEN BERMUDAS": { productType: "shorts" },
  "RBC- BERMUDAS MEN": { productType: "shorts" },
  "REB-MEN TROUSERS": { productType: "trousers" },
  "RBC- TROUSERS MEN": { productType: "trousers" },
  "RBC- DENIM MEN": {},
  "RBC- KNITS MEN": { productType: "knitwear" },
  "RBC- OUTERWEAR MEN": { productType: "outerwear" },
  "REB-WOMEN BLOUSE": { productType: "blouse" },
  "RBC- BLOUSE WOMEN": { productType: "blouse" },
  "REB-WOMEN TEE": { productType: "t-shirt" },
  "RBC- TEES WOMEN": { productType: "t-shirt" },
  "REB-WOMEN PANTS": { productType: "trousers" },
  "RBC-PANTS WOMEN": { productType: "trousers" },
  "REB-WOMEN SKIRTS": { productType: "skirt" },
  "REB-WOMEN MIDI SKIRTS": { productType: "skirt" },
  "RBC- SKIRTS WOMEN": { productType: "skirt" },
  "RBC- MAXI SKIRTS WOMEN": { productType: "skirt" },
  "REB-WOMEN SHORTS & SKORTS": { productType: "shorts" },
  "RBC-SHORTS & SKORTS WOMEN": { productType: "shorts" },
  "REB-WOMEN DRESSES": { productType: "dress" },
  "REB-WOMEN MAXI DRESS": { productType: "dress" },
  "RBC- DRESSES WOMEN": { productType: "dress" },
  "RBC- ONE PIECE/DRESS WOMEN": { productType: "dress" },
  "RBC- DRESSES KNEE LENGTH WOMEN": { productType: "dress" },
  "RBC- DRESS MAXI WOMEN": { productType: "dress" },
  "RBC- DRESSES MIDI WOMEN": { productType: "dress" },
  "REB-WOMEN JUMPSUITS": { productType: "jumpsuit" },
  "RBC- DENIM WOMEN": {},
  "REB-KIDS TEE": { productType: "t-shirt" },
  "RBC- TEES KIDS": { productType: "t-shirt" },
  "REB-KIDS DRESSES": { productType: "dress" },
  "RBC- DRESSES KIDS": { productType: "dress" },
  "REB-KIDS SHORTS": { productType: "shorts" },
  "RBC- SHORTS KIDS": { productType: "shorts" },
  "REB-KIDS SHIRTS": { productType: "shirt" },
  "RBC- SHIRTS KIDS": { productType: "shirt" },
  "RBC- PANTS KIDS": { productType: "trousers" },
  "RBC- KNITS KIDS": { productType: "knitwear" },
  "RBC- TOPS KIDS": { department: "tops" },
  "RBC- ACCESSORIES": { department: "accessories", collection: "accessories" },
  "RBC- BAGS": { productType: "bag" },
  "RBC- HATS": { productType: "hat" },
  "RBC- SCARVES": { productType: "scarf" },
  "CAT-SALE BAG": {},
  "CAT-SALEITEM": {},
  "REB-MEN NEW IN": { gender: "men", collection: "men-new-in" },
  "RBC- NEW IN MEN": { gender: "men", collection: "men-new-in" },
  "REB-WOMEN NEW IN": { gender: "women", collection: "women-new-in" },
  "RBC- NEW IN WOMEN": { gender: "women", collection: "women-new-in" },
  "REB-KIDS NEW IN": { gender: "kids", collection: "kids-new-in" },
  "RBC- NEW IN KIDS": { gender: "kids", collection: "kids-new-in" },
  "REB-NEW ARRIVALS": { collection: "new-arrivals" },
  "RBC- NEW ARRIVALS": { collection: "new-arrivals" },
  "RBCLEARANCE": { collection: "clearance" },
  "ED-STOCK": {},
};

const DISPLAY_PRODUCT_TYPE: Record<ProductType, string> = {
  top: "Top", "t-shirt": "T-Shirt", shirt: "Shirt", blouse: "Blouse", dress: "Dress", skirt: "Skirt",
  jumpsuit: "Jumpsuit", knitwear: "Knitwear", outerwear: "Outerwear",
  shorts: "Shorts", trousers: "Trousers", jeans: "Jeans", bag: "Bag", hat: "Hat",
  scarf: "Scarf", accessory: "Accessory", unknown: "Uncategorized",
};

function slug(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function inferProductTypeFromTitle(title: string): ProductType {
  const value = title.toLowerCase();
  if (/\b(bags?|totes?|pouches?)\b/.test(value)) return "bag";
  if (/\b(hats?|caps?)\b/.test(value)) return "hat";
  if (/\b(scarves?|scarfs?|shawls?)\b/.test(value)) return "scarf";
  if (/\b(bottle holders?|accessor(?:y|ies))\b/.test(value)) return "accessory";
  if (/\bjumpsuits?\b/.test(value)) return "jumpsuit";
  if (/\bdress(?:es)?\b/.test(value)) return "dress";
  if (/\b(skirts?|skorts?)\b/.test(value)) return "skirt";
  if (/\bjeans?\b/.test(value)) return "jeans";
  if (/\b(shorts|bermudas?|sweatshorts?)\b/.test(value)) return "shorts";
  if (/\b(trousers?|pants?|joggers?)\b/.test(value)) return "trousers";
  if (/\b(jacket|vest|overshirt|outerwear)\b/.test(value)) return "outerwear";
  if (/\b(knit|knitted)\b/.test(value)) return "knitwear";
  if (/\bblouses?\b/.test(value)) return "blouse";
  if (/\b(tee|t-shirt)\b/.test(value)) return "t-shirt";
  if (/\bshirt\b/.test(value)) return "shirt";
  if (/\b(tops?|tanks?)\b/.test(value)) return "top";
  return "unknown";
}

function departmentFor(productType: ProductType): Department {
  if (["top", "t-shirt", "shirt", "blouse", "knitwear", "outerwear"].includes(productType)) return "tops";
  if (["shorts", "trousers", "jeans", "skirt"].includes(productType)) return "bottoms";
  if (["dress", "jumpsuit"].includes(productType)) return "one-piece";
  if (["bag", "hat", "scarf", "accessory"].includes(productType)) return "accessories";
  return "unknown";
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export type ClassificationDiagnostics = {
  warnings: string[];
  unmappedTags: string[];
};

export function classifyProduct(title: string, originalTags: string[]) {
  const rules = originalTags.map((tag) => TAG_RULES[tag]).filter((rule): rule is TagRule => Boolean(rule));
  const genders = unique(rules.flatMap((rule) => rule.gender ? [rule.gender] : []));
  const explicitDepartments = unique(rules.flatMap((rule) => rule.department ? [rule.department] : []));
  const explicitTypes = unique(rules.flatMap((rule) => rule.productType ? [rule.productType] : []));
  const warnings: string[] = [];
  if (genders.length > 1) warnings.push(`Conflicting genders: ${genders.join(", ")}`);
  if (explicitDepartments.length > 1) warnings.push(`Conflicting departments: ${explicitDepartments.join(", ")}`);
  if (explicitTypes.length > 1) warnings.push(`Conflicting product types: ${explicitTypes.join(", ")}`);

  const inferredType = inferProductTypeFromTitle(title);
  let productType: ProductType = explicitTypes.length === 1 ? explicitTypes[0] : inferredType;
  if (inferredType === "jeans" && productType !== "jeans") {
    warnings.push(`Product type ${productType} overridden by title inference jeans`);
    productType = "jeans";
  }
  if (explicitDepartments.length === 1 && inferredType !== "unknown"
    && departmentFor(productType) !== explicitDepartments[0]
    && departmentFor(inferredType) === explicitDepartments[0]) {
    warnings.push(`Product type ${productType} overridden by title inference ${inferredType}`);
    productType = inferredType;
  }
  const inferredDepartment = departmentFor(productType);
  const department: Department = explicitDepartments.length === 1 ? explicitDepartments[0] : inferredDepartment;
  const gender: Gender = genders.length === 1 ? genders[0] : genders.length === 0 && department === "accessories" ? "unisex" : "unknown";
  if (department !== "unknown" && inferredDepartment !== "unknown" && department !== inferredDepartment) {
    warnings.push(`Department ${department} conflicts with product type ${productType}`);
  }
  if (gender === "unknown") warnings.push("Unable to classify gender");
  if (productType === "unknown") warnings.push("Unable to classify product type");

  const collections = unique(rules.flatMap((rule) => rule.collection ? [rule.collection] : []));
  const categoryPath = [gender, department, productType].filter((value) => value !== "unknown");
  const normalizedTags = [
    gender !== "unknown" ? `gender:${gender}` : null,
    department !== "unknown" ? `department:${department}` : null,
    productType !== "unknown" ? `product-type:${productType}` : null,
    ...collections.map((collection) => `collection:${collection}`),
  ].filter((tag): tag is string => Boolean(tag));
  const unmappedTags = originalTags.filter((tag) => !TAG_RULES[tag] && !/^[A-Z]{1,5}\d[A-Z0-9-]*$/.test(tag));

  return {
    classification: { gender, department, productType, categoryPath, shopifyTaxonomyId: null },
    collections,
    normalizedTags,
    diagnostics: { warnings, unmappedTags } satisfies ClassificationDiagnostics,
  };
}

export function productTypeLabel(productType: ProductType): string {
  return DISPLAY_PRODUCT_TYPE[productType];
}

export function extractAttributes(title: string, descriptionHtml: string) {
  const colorPart = title.includes(" - ") ? title.split(" - ").at(-1)?.trim() ?? null : null;
  const color = colorPart ? slug(colorPart) || null : null;
  const materials = unique([...descriptionHtml.matchAll(/\d+(?:\.\d+)?%\s*([A-Za-z]+)/g)]
    .map((match) => slug(match[1])).filter(Boolean));
  const lowerTitle = title.toLowerCase();
  const fit = ["oversized", "relaxed", "slim", "regular"].find((value) => lowerTitle.includes(value)) ?? null;
  const styles = ["cuban-collar", "cargo", "denim", "utility", "polo", "graphic"]
    .filter((style) => lowerTitle.includes(style.replace("-", " ")));
  return { color, materials, fit, styles };
}

export function styleGroupFromTitle(title: string): string {
  return slug(title.split(" - ")[0]) || "product";
}
