import { Cart, Post, Product } from "@/payload-types";

const wrap = (body: string, title = "Thông báo") => `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f5f7fb; margin:0; padding:20px; }
      .container{max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(16,24,40,0.08)}
      .header{padding:20px;border-bottom:1px solid #eef2f7;background:#fbfdff}
      .content{padding:20px}
      .btn{display:inline-block;padding:10px 16px;background:#00a86b;color:#fff;border-radius:6px;text-decoration:none}
      .item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9}
      .item img{width:88px;height:64px;object-fit:cover;border-radius:6px}
      .muted{color:#64748b;font-size:13px}
      .price{color:#0f766e;font-weight:600}
      .footer{padding:16px 20px;background:#fbfdff;border-top:1px solid #eef2f7;color:#64748b;font-size:13px}
      @media (max-width:480px){ .item{flex-direction:row} }
    </style>
  </head>
  <body>
    <div class="container">
      ${body}
    </div>
  </body>
</html>`;

const safeText = (s?: string) => (s ? String(s) : "");

export const blogTemplate = (title: string, blogs?: Post[], intro?: string) => {
  const body = `
    <div class="header">
      <h2 style="margin:0">${title}</h2>
      <p class="muted" style="margin:6px 0 0">${safeText(intro)}</p>
    </div>
    <div class="content">
      ${(blogs || [])
        .map((b) => {
          const bTitle = (b as any).title ?? (b as any).name ?? "Bài viết";
          const excerpt = (b as any).excerpt ?? (b as any).summary ?? "";
          const img =
            (b as any).featureImage?.url ?? (b as any).image?.url ?? "";
          const url = (b as any).url ?? (b as any).slug ?? "#";
          return `
            <div class="item">
              ${img ? `<img src="${img}" alt="${bTitle}"/>` : ""}
              <div style="flex:1">
                <h3 style="margin:0 0 6px">${bTitle}</h3>
                <p class="muted" style="margin:0 0 8px">${excerpt}</p>
                <a class="btn" href="${url}">Đọc thêm</a>
              </div>
            </div>`;
        })
        .join("")}
    </div>
    <div class="footer">Cảm ơn bạn đã theo dõi. Truy cập trang để đọc thêm.</div>
  `;

  return wrap(body, title);
};

export const productListTemplate = (
  title: string,
  products?: Product[],
  intro?: string
) => {
  const body = `
    <div class="header">
      <h2 style="margin:0">${title}</h2>
      <p class="muted" style="margin:6px 0 0">${safeText(intro)}</p>
    </div>
    <div class="content">
      ${(products || [])
        .map((p) => {
          const pTitle = (p as any).title ?? (p as any).name ?? "Sản phẩm";
          const price = (p as any).price ?? (p as any).formattedPrice ?? "";
          const img =
            (p as any).image?.url ?? (p as any).images?.[0]?.url ?? "";
          const url = (p as any).url ?? (p as any).slug ?? "#";
          return `
            <div class="item">
              ${img ? `<img src="${img}" alt="${pTitle}"/>` : ""}
              <div style="flex:1">
                <h3 style="margin:0 0 6px">${pTitle}</h3>
                <div style="display:flex;gap:8px;align-items:center">
                  <div class="price">${price}</div>
                  <a class="btn" href="${url}">Xem chi tiết</a>
                </div>
              </div>
            </div>`;
        })
        .join("")}
    </div>
    <div class="footer">Xem thêm sản phẩm trên cửa hàng của chúng tôi.</div>
  `;

  return wrap(body, title);
};

export const orderSuccessTemplate = (
  title: string,
  cart?: Cart,
  products?: Product[]
) => {
  const lines =
    (cart as any)?.items?.map((it: any) => {
      const pid = it.product?.id ?? it.product ?? it.productId ?? null;
      const product =
        products?.find((p) => (p as any).id === pid) ?? it.product ?? {};
      const name =
        (product as any).title ??
        (product as any).name ??
        it.name ??
        "Sản phẩm";
      const qty = it.quantity ?? it.qty ?? 1;
      const price = it.price ?? (product as any).price ?? it.unitPrice ?? "";
      const img =
        (product as any).image?.url ?? (product as any).images?.[0]?.url ?? "";
      return `
      <div class="item">
        ${img ? `<img src="${img}" alt="${name}"/>` : ""}
        <div style="flex:1">
          <h4 style="margin:0 0 6px">${name}</h4>
          <div class="muted">Số lượng: ${qty}</div>
          <div class="price">${price}</div>
        </div>
      </div>`;
    }) ?? [];

  const total = (cart as any)?.total ?? (cart as any)?.subtotal ?? "";

  const body = `
    <div class="header">
      <h2 style="margin:0">${title}</h2>
      <p class="muted" style="margin:6px 0 0">Đơn hàng của bạn đã được nhận và đang xử lý.</p>
    </div>
    <div class="content">
      <h3 style="margin-top:0">Chi tiết đơn hàng</h3>
      ${lines.join("")}
      <div style="padding:12px 0;display:flex;justify-content:space-between;align-items:center">
        <div class="muted">Tổng</div>
        <div class="price" style="font-size:16px">${total}</div>
      </div>
    </div>
    <div class="footer">Cảm ơn bạn đã mua hàng — chúng tôi sẽ cập nhật trạng thái vận chuyển sớm.</div>
  `;

  return wrap(body, title);
};

export const templateHtml = (
  title: string,
  content: string,
  type: "blog" | "product" | "cart",
  cart?: Cart,
  products?: Product[],
  blogs?: Post[]
): string => {
  switch (type) {
    case "blog":
      return blogTemplate(title, blogs, content);
    case "product":
      return productListTemplate(title, products, content);
    case "cart":
      return orderSuccessTemplate(title, cart, products);
    default:
      return wrap(
        `<div class="content"><h2>${title}</h2><p>${safeText(content)}</p></div>`,
        title
      );
  }
};
