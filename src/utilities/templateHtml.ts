import { Post, Product, Transaction } from "@/payload-types";

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
  cart?: Transaction,
  products?: Product[]
) => {
  const transaction = cart as Transaction | undefined;

  const formatDate = (d?: string) => {
    try {
      return d
        ? new Date(d).toLocaleString("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "";
    } catch (e) {
      return d ?? "";
    }
  };

  const currencyCode = (transaction as any)?.currency ?? "VND";
  const fmtMoney = (amount?: number | null) => {
    if (amount == null) return "";
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: currencyCode,
      }).format(amount);
    } catch (e) {
      return `${amount} ${currencyCode}`;
    }
  };

  const statusMap: Record<string, string> = {
    pending: "Đang chờ",
    succeeded: "Thành công",
    failed: "Thất bại",
    cancelled: "Đã hủy",
    expired: "Hết hạn",
    refunded: "Đã hoàn tiền",
  };

  const renderAddress = (addr?: any) => {
    if (!addr) return "";
    const parts = [
      addr.title,
      addr.firstName,
      addr.lastName,
      addr.company,
      addr.addressLine1,
      addr.addressLine2,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.country,
      addr.phone,
    ];
    return parts.filter(Boolean).join(", ");
  };

  const items = (transaction?.items ?? []) as any[];

  const lines = items
    .map((it) => {
      // Resolve product object
      let productObj: any = undefined;
      if (it.product && typeof it.product === "object") productObj = it.product;
      else if (it.product && typeof it.product === "string")
        productObj = products?.find((p) => (p as any).id === it.product);

      const variantObj: any =
        it.variant && typeof it.variant === "object" ? it.variant : undefined;

      const name =
        productObj?.title ?? productObj?.name ?? it.name ?? "Sản phẩm";
      const variantName =
        variantObj?.name ??
        variantObj?.title ??
        (it.variant && typeof it.variant === "string" ? it.variant : "");
      const qty = it.quantity ?? it.qty ?? 1;

      // Determine unit price: item may carry price, fall back to product/variant
      let unitPrice = Number(
        it.price ?? it.unitPrice ?? productObj?.price ?? variantObj?.price ?? 0
      );
      if (Number.isNaN(unitPrice)) unitPrice = 0;
      const lineTotal = unitPrice * Number(qty || 0);

      const img = productObj?.image?.url ?? productObj?.images?.[0]?.url ?? "";

      return `
        <div class="item">
          ${img ? `<img src="${img}" alt="${name}"/>` : ""}
          <div style="flex:1">
            <h4 style="margin:0 0 6px">${name}${variantName ? ` — <span class=\"muted\">${variantName}</span>` : ""}</h4>
            <div class="muted">Số lượng: ${qty}</div>
            <div class="muted">Đơn giá: ${fmtMoney(unitPrice)}</div>
            <div class="price">Thành tiền: ${fmtMoney(lineTotal)}</div>
          </div>
        </div>`;
    })
    .join("");

  const total = transaction?.amount ?? (transaction as any)?.total ?? null;

  const body = `
    <div class="header">
      <h2 style="margin:0">${title}</h2>
      <p class="muted" style="margin:6px 0 0">Đơn hàng của bạn đã được nhận.</p>
    </div>
    <div class="content">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <div><strong>Mã đơn:</strong> ${(transaction as any)?.id ?? "-"}</div>
          <div><strong>Trạng thái:</strong> ${statusMap[(transaction as any)?.status ?? ""] ?? (transaction as any)?.status ?? "-"}</div>
          <div><strong>Ngày:</strong> ${formatDate((transaction as any)?.createdAt)}</div>
        </div>
        <div style="text-align:right">
          <div><strong>Thanh toán:</strong> ${(transaction as any)?.paymentMethod ?? "-"}</div>
          <div><strong>Email:</strong> ${(transaction as any)?.customerEmail ?? ((transaction as any)?.customer as any)?.email ?? "-"}</div>
          <div><strong>Tổng:</strong> <span class="price">${fmtMoney(total)}</span></div>
        </div>
      </div>

      <h3 style="margin-top:0">Chi tiết đơn hàng</h3>
      ${lines || '<div class="muted">Không có sản phẩm trong đơn.</div>'}

      <div style="padding:12px 0;display:flex;justify-content:space-between;align-items:center">
        <div class="muted">Tổng thanh toán</div>
        <div class="price" style="font-size:16px">${fmtMoney(total)}</div>
      </div>

      <h4>Thông tin giao hàng</h4>
      <div class="muted">${renderAddress((transaction as any)?.billingAddress)}</div>
    </div>
    <div class="footer">Cảm ơn bạn đã mua hàng — chúng tôi sẽ cập nhật trạng thái vận chuyển sớm.</div>
  `;

  return wrap(body, title);
};

export const templateHtml = (
  title: string,
  content: string,
  type: "blog" | "product" | "cart",
  cart?: Transaction,
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
