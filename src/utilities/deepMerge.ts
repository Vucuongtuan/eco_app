// @ts-nocheck

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deepMerge<T, R>(target: T, source: R): T {
  const output = { ...target }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}



interface Price {
  amount: number;
  enable: boolean;
}


export function deepPrice ({price_vn,price_en,lang}: {price_vn: Price, price_en: Price,lang: Lang}) {
  if(lang === 'vi') {
    if(!price_vn.enable) {
    if(!price_en.enable) return 0
       return price_en.amount
    };
    return price_vn.amount;
  }
  if(lang === 'en') {
    if(!price_en.enable) {
  if(!price_vn.enable) return 0
      return price_vn.amount
    };
    return price_en.amount || 0;
  }
}