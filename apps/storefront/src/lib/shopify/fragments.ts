export const IMAGE_FRAGMENT = `
  fragment ShopifyImage on Image {
    url
    altText
    thumbhash
    width
    height
  }
`;

export const MONEY_FRAGMENT = `
  fragment ShopifyMoney on MoneyV2 {
    amount
    currencyCode
  }
`;

export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCard on Product {
    id
    handle
    title
    productType
    featuredImage { ...ShopifyImage }
    images(first: 5) { nodes { ...ShopifyImage } }
    priceRange { minVariantPrice { ...ShopifyMoney } }
    variants(first: 100) { nodes { ...ProductVariantFields } }
    updatedAt
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    selectedOptions { name value }
    price { ...ShopifyMoney }
    compareAtPrice { ...ShopifyMoney }
    image { ...ShopifyImage }
  }
`;

export const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { ...ShopifyMoney }
      totalAmount { ...ShopifyMoney }
      totalTaxAmount { ...ShopifyMoney }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { ...ShopifyMoney } }
        merchandise {
          ... on ProductVariant {
            ...ProductVariantFields
            product { handle title }
          }
        }
      }
    }
  }
`;
