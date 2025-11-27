import { Product, Tag, Variant } from "@/payload-types";

export interface FilterOptions {
  sort: string | null;
  priceRange: { min: number; max: number } | null;
  colors: string[]; // Selected color values
  tags: string[]; // Selected tag IDs
  size: string[]; // Selected sizes
}

export const DEFAULT_FILTERS: FilterOptions = {
  sort: null,
  priceRange: null,
  colors: [],
  tags: [],
  size: [],
};

// Extract unique filter options from products
export function extractFilterOptions(products: Product[]) {
  const priceRanges = [
    { label: 'under100k', min: 0, max: 100000 },
    { label: '100to300k', min: 100000, max: 300000 },
    { label: '300to500k', min: 300000, max: 500000 },
    { label: 'over500k', min: 500000, max: Infinity },
  ];

  // Extract sizes, colors, and tags
  const sizesSet = new Set<string>();
  const colorsSet = new Set<string>();
  const tagsMap = new Map<string, Tag>();
  
  products.forEach(product => {
    // Extract sizes and colors from variants
    if (product.variants?.docs) {
      product.variants.docs.forEach(variant => {
        if (typeof variant !== 'string' && variant.options) {
          variant.options.forEach(option => {
            if (typeof option !== 'string') {
              const variantType = typeof option.variantType !== 'string' 
                ? option.variantType?.name?.toLowerCase()
                : null;
              
              if (variantType === 'size') {
                sizesSet.add(option.label);
              } else if (variantType === 'color' || variantType === 'colour') {
                colorsSet.add(option.label);
              }
            }
          });
        }
      });
    }

    // Extract tags
    if (product.taxonomies?.tags) {
      product.taxonomies.tags.forEach(tag => {
        if (typeof tag !== 'string' && tag.id && tag.title) {
          tagsMap.set(tag.id, tag);
        }
      });
    }
  });

  return {
    priceRanges,
    sizes: Array.from(sizesSet).sort(),
    colors: Array.from(colorsSet).sort(),
    tags: Array.from(tagsMap.values()),
  };
}

// Get product price (from variant or base price)
function getProductPrice(product: Product): number {
  // Check if product has priceInUSD enabled
  if (product.priceInUSDEnabled && product.priceInUSD) {
    return product.priceInUSD * 25000; // Convert USD to VND (rough estimate)
  }
  
  // If variants exist, get the lowest price
  if (product.variants?.docs && product.variants.docs.length > 0) {
    const prices = product.variants.docs
      .filter((v): v is Variant => typeof v !== 'string')
      .map(v => v.priceInUSD || 0)
      .filter(p => p > 0);
    
    if (prices.length > 0) {
      return Math.min(...prices) * 25000; // Convert to VND
    }
  }
  
  return 0;
}

// Sort products
export function sortProducts(products: Product[], sortType: string): Product[] {
  const sorted = [...products];
  
  switch (sortType) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    case 'priceLowHigh':
      return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    
    case 'priceHighLow':
      return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    
    default:
      return sorted;
  }
}

// Filter by price range
export function filterByPrice(
  products: Product[], 
  range: { min: number; max: number }
): Product[] {
  return products.filter(product => {
    const price = getProductPrice(product);
    return price >= range.min && price < range.max;
  });
}


// Filter by colors
export function filterByColors(
  products: Product[], 
  colors: string[]
): Product[] {
  if (colors.length === 0) return products;
  
  return products.filter(product => {
    if (!product.variants?.docs) return false;
    
    return product.variants.docs.some(variant => {
      if (typeof variant === 'string') return false;
      if (!variant.options) return false;
      
      return variant.options.some(option => {
        if (typeof option === 'string') return false;
        
        const variantType = typeof option.variantType !== 'string' 
          ? option.variantType?.name?.toLowerCase()
          : null;
        
        return (variantType === 'color' || variantType === 'colour') && 
               colors.includes(option.label);
      });
    });
  });
}

// Filter by tags
export function filterByTags(
  products: Product[], 
  tagIds: string[]
): Product[] {
  if (tagIds.length === 0) return products;
  
  return products.filter(product => {
    if (!product.taxonomies?.tags) return false;
    
    return product.taxonomies.tags.some(tag => {
      if (typeof tag === 'string') return tagIds.includes(tag);
      return tagIds.includes(tag.id);
    });
  });
}

// Filter by size
export function filterBySize(
  products: Product[], 
  sizes: string[]
): Product[] {
  if (sizes.length === 0) return products;
  
  return products.filter(product => {
    if (!product.variants?.docs) return false;
    
    return product.variants.docs.some(variant => {
      if (typeof variant === 'string') return false;
      if (!variant.options) return false;
      
      return variant.options.some(option => {
        if (typeof option === 'string') return false;
        
        const variantType = typeof option.variantType !== 'string' 
          ? option.variantType?.name?.toLowerCase()
          : null;
        
        return variantType === 'size' && sizes.includes(option.label);
      });
    });
  });
}

// Apply all filters
export function applyFilters(products: Product[], filters: FilterOptions): Product[] {
  let result = [...products];
  
  // Apply price range filter
  if (filters.priceRange) {
    result = filterByPrice(result, filters.priceRange);
  }
  
  // Apply color filter
  result = filterByColors(result, filters.colors);
  
  // Apply tags filter
  result = filterByTags(result, filters.tags);
  
  // Apply size filter
  result = filterBySize(result, filters.size);
  
  // Apply sort (last step)
  if (filters.sort) {
    result = sortProducts(result, filters.sort);
  }
  
  return result;
}
