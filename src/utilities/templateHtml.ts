import { Post, Product } from "@/payload-types";

interface TemplateProps {
  title: string;
  content?: string;
  type: "blog" | "product" | "cart";
  cart?: any;
  products?: Product[];
  blogs?: Post[];
}

const wrap = (body: string, title = "Thông báo") => `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f4f4f5; margin:0; padding:20px; color: #18181b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      .header { padding: 32px; background: #18181b; color: #ffffff; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; letter-spacing: -0.5px; }
      .content { padding: 32px; }
      .footer { padding: 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 13px; }
      .h2 { font-size: 20px; font-weight: 600; margin: 0 0 16px 0; color: #18181b; }
      .p { font-size: 15px; line-height: 1.6; color: #52525b; margin: 0 0 20px 0; }
      .btn { display: inline-block; padding: 12px 24px; background: #000000; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; }
      .list-item { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; text-decoration: none; color: inherit; }
      .list-item:last-child { border-bottom: none; }
      .list-img { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; background: #f1f5f9; }
      .list-info { flex: 1; }
      .list-title { font-size: 16px; font-weight: 600; margin: 0 0 6px 0; }
      .list-desc { font-size: 14px; color: #64748b; margin: 0 0 12px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .price { color: #000; font-weight: 700; font-size: 16px; }
      .order-summary { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
      .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
      .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1; }
      @media (max-width: 480px) {
        .content { padding: 20px; }
        .list-item { flex-direction: column; }
        .list-img { width: 100%; height: 180px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1>Moon co.</h1></div>
      <div class="content">${body}</div>
      <div class="footer">
        © ${new Date().getFullYear()} Moon co. — Phong cách hiện đại cho bạn.<br/>
        Bạn nhận được email này vì đã đăng ký hoặc mua hàng tại cửa hàng chúng tôi.
      </div>
    </div>
  </body>
</html>
`;

const fmtPrice = (amount: number, currency = "VND") => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount / 100);
};

const blogTemplate = (title: string, blogs?: Post[], intro?: string) => `
  <h2 class="h2">${title}</h2>
  <p class="p">${intro || "Những bài viết mới nhất từ Moon co. mà bạn không thể bỏ qua."}</p>
  ${(blogs || []).map(b => {
    const img = (b as any).featureImage?.url || (b as any).image?.url || "";
    return `
    <div class="list-item">
      ${img ? `<img src="${img}" class="list-img"/>` : ""}
      <div class="list-info">
        <h3 class="list-title">${b.title}</h3>
        <p class="list-desc">${(b as any).excerpt || ""}</p>
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${b.slug}" class="btn" style="padding: 6px 16px; font-size: 12px;">Đọc bài</a>
      </div>
    </div>
`;
  }).join("")}
`;

const productTemplate = (title: string, products?: Product[], intro?: string) => `
  <h2 class="h2">${title}</h2>
  <p class="p">${intro || "Khám phá những sản phẩm mới nhất đang có mặt tại cửa hàng."}</p>
  ${(products || []).map(p => {
    const img = (p as any).image?.url || (p as any).gallery?.[0]?.image?.url || "";
    return `
    <div class="list-item">
      ${img ? `<img src="${img}" class="list-img"/>` : ""}
      <div class="list-info">
        <h3 class="list-title">${p.title}</h3>
        <div class="price" style="margin-bottom: 12px;">${fmtPrice((p as any).priceInVND || (p as any).price || 0, "VND")}</div>
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/products/${p.slug}" class="btn" style="padding: 6px 16px; font-size: 12px;">Mua ngay</a>
      </div>
    </div>
`;
  }).join("")}
`;

const cartTemplate = (title: string, transaction: any) => {
  const items = transaction.items || [];
  return `
  <h2 class="h2">Cảm ơn bạn đã đặt hàng! 🎉</h2>
  <p class="p">Xin chào, đơn hàng <b>#${transaction.id}</b> của bạn đã được thanh toán thành công và đang được chuẩn bị.</p>
  
  <div class="order-summary">
    <div class="summary-row"><span style="color:#64748b">Ngày đặt:</span> <span>${new Date(transaction.createdAt).toLocaleDateString("vi-VN")}</span></div>
    <div class="summary-row"><span style="color:#64748b">Trạng thái:</span> <span style="color:#059669; font-weight:600">Thành công</span></div>
    <div class="summary-row"><span style="color:#64748b">Phương thức:</span> <span>Card</span></div>
  </div>

  <h3 style="font-size:16px; margin-bottom:12px;">Chi tiết sản phẩm:</h3>
  ${items.map((it: any) => `
    <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; border-bottom:1px solid #f1f5f9; padding-bottom:12px;">
      <div>
        <div style="font-weight:600">${it.product?.title || it.title || "Sản phẩm"}</div>
        <div style="color:#64748b; font-size:12px">Số lượng: ${it.quantity}</div>
      </div>
      <div style="font-weight:600">${fmtPrice(it.price * it.quantity, transaction.currency)}</div>
    </div>
  `).join("")}

  <div class="total-row">
    <span>Tổng cộng</span>
    <span>${fmtPrice(transaction.amount, transaction.currency)}</span>
  </div>

  <div style="text-align:center; margin-top:32px;">
    <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders/${transaction.id}" class="btn">Theo dõi đơn hàng</a>
  </div>
`;
};

export function templateHtml(propsOrTitle: any, ...args: any[]): string {
  let title: string;
  let type: string;
  let content: string | undefined;
  let cart: any;
  let products: Product[] | undefined;
  let blogs: Post[] | undefined;

  if (typeof propsOrTitle === "object" && propsOrTitle !== null) {
    title = propsOrTitle.title;
    type = propsOrTitle.type || "default";
    content = propsOrTitle.content;
    cart = propsOrTitle.cart;
    products = propsOrTitle.products;
    blogs = propsOrTitle.blogs;
  } else {
    title = propsOrTitle;
    content = args[0];
    type = args[1] || "default";
    cart = args[2];
    products = args[3];
    blogs = args[4];
  }

  let body = "";
  if (type === "blog") body = blogTemplate(title, blogs, content);
  else if (type === "product") body = productTemplate(title, products, content);
  else if (type === "cart") body = cartTemplate(title, cart);
  else body = `<h2 class="h2">${title}</h2><p class="p">${content || ""}</p>`;

  return wrap(body, title);
}