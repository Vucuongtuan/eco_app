import { shopifyAdminGraphql } from "./client.ts";

type PageCreatePayload = {
  pageCreate: {
    page: { id: string; handle: string; title: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
};

const PAGE_CREATE_MUTATION = `
  mutation CreatePage($page: PageCreateInput!) {
    pageCreate(page: $page) {
      page {
        id
        handle
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const SAMPLE_PAGES = [
  {
    title: "About Our Story",
    handle: "about",
    body: `
      <h2>Crafted with Purpose, Designed for Longevity</h2>
      <p>Founded in 2024, Moon Co. was born out of a desire for elevated essentials that blend minimalist aesthetics with sustainable craftsmanship.</p>
      <p>We believe in purchasing less, choosing better, and creating timeless pieces that seamlessly integrate into everyday modern living. Every garment and accessory is designed in-house using ethically sourced materials and conscious manufacturing techniques.</p>
      <h3>Our Philosophy</h3>
      <ul>
        <li><strong>Quality First:</strong> Premium organic fabrics, durable stitching, and details made to endure.</li>
        <li><strong>Sustainable Innovation:</strong> Low-impact dyes, plastic-free packaging, and zero-waste studio practices.</li>
        <li><strong>Ethical Partnerships:</strong> Working exclusively with certified fair-wage artisans and manufacturers worldwide.</li>
      </ul>
    `,
  },
  {
    title: "Shipping & Returns Policy",
    handle: "shipping-returns",
    body: `
      <h2>Shipping Information</h2>
      <p>We ship internationally to over 50 countries. Orders are processed Monday through Friday (excluding major holidays).</p>
      <ul>
        <li><strong>Standard Shipping (3-5 Business Days):</strong> Free on orders over $150. Otherwise flat $10.</li>
        <li><strong>Express Shipping (1-2 Business Days):</strong> Flat rate $25.</li>
        <li><strong>International Shipping (5-10 Business Days):</strong> Calculated at checkout based on destination.</li>
      </ul>

      <h2>Returns & Exchanges</h2>
      <p>We want you to love what you ordered. If something isn't right, you can return unworn, unwashed items with tags attached within <strong>30 days of delivery</strong>.</p>
      <p>To initiate a return or exchange, please reach out to our customer care team at <code>support@moon-co.com</code> with your order number.</p>
    `,
  },
  {
    title: "Frequently Asked Questions",
    handle: "faq",
    body: `
      <h2>General Questions</h2>
      <h3>Where are your products manufactured?</h3>
      <p>Our collections are designed in our central design lab and crafted by trusted, certified manufacturing partners in Portugal, Japan, and Vietnam who adhere to strict fair labor standards.</p>

      <h3>How do I care for my garments?</h3>
      <p>We recommend cold machine wash with mild eco-friendly detergent and hanging dry in the shade to preserve garment shape and texture for years to come.</p>

      <h2>Orders & Payments</h2>
      <h3>What payment methods do you accept?</h3>
      <p>We accept Visa, Mastercard, American Express, Apple Pay, Shop Pay, and PayPal.</p>

      <h3>Can I modify or cancel my order after placing it?</h3>
      <p>We process orders quickly. If you need to make changes, please contact us within 1 hour of placing your order.</p>
    `,
  },
  {
    title: "Privacy Policy",
    handle: "privacy",
    body: `
      <h2>Your Privacy Matters</h2>
      <p>At Moon Co., we respect your personal data and are committed to protecting your privacy when you visit our online store.</p>

      <h3>Information We Collect</h3>
      <p>When you browse or make a purchase, we collect necessary transactional information including your name, shipping address, email, and payment details to process your order securely.</p>

      <h3>Data Protection</h3>
      <p>We do not sell, rent, or trade your personal information to third parties. All transaction data is encrypted using standard SSL certificate protocols.</p>
    `,
  },
  {
    title: "Terms of Service",
    handle: "terms",
    body: `
      <h2>Terms & Conditions</h2>
      <p>Welcome to Moon Co. By accessing our website, purchasing products, or using our services, you agree to be bound by the following terms and conditions.</p>

      <h3>Intellectual Property</h3>
      <p>All content on this site including text, photography, graphic branding, and product designs are the exclusive property of Moon Co.</p>

      <h3>Governing Law</h3>
      <p>These terms shall be governed and construed in accordance with standard international commerce regulations.</p>
    `,
  },
];

async function main() {
  console.log("🚀 Starting Shopify CMS Pages seeder...\n");

  for (const pageInput of SAMPLE_PAGES) {
    try {
      console.log(`Creating/Updating page: "${pageInput.title}" (handle: ${pageInput.handle})...`);
      const result = await shopifyAdminGraphql<PageCreatePayload>(PAGE_CREATE_MUTATION, {
        page: pageInput,
      });

      if (result.pageCreate.userErrors.length > 0) {
        console.error(`❌ Errors creating "${pageInput.title}":`, result.pageCreate.userErrors);
      } else if (result.pageCreate.page) {
        console.log(`✅ Successfully created page: ${result.pageCreate.page.title} (ID: ${result.pageCreate.page.id})`);
      }
    } catch (err) {
      console.error(`❌ Failed to push page "${pageInput.title}":`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n🎉 Finished pushing CMS pages to Shopify!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
