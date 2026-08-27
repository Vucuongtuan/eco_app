import { shopifyAdminGraphql } from "./client.ts";

type BlogCreatePayload = {
  blogCreate: {
    blog: { id: string; handle: string; title: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
};

type ArticleCreatePayload = {
  articleCreate: {
    article: { id: string; handle: string; title: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
};

const BLOGS_QUERY = `
  query GetBlogs {
    blogs(first: 50) {
      nodes {
        id
        handle
        title
      }
    }
  }
`;

const BLOG_CREATE_MUTATION = `
  mutation CreateBlog($blog: BlogCreateInput!) {
    blogCreate(blog: $blog) {
      blog {
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

const ARTICLE_CREATE_MUTATION = `
  mutation CreateArticle($article: ArticleCreateInput!) {
    articleCreate(article: $article) {
      article {
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

const ALL_CONTENT_POSTS = [
  // --- STATIC PAGES AS ARTICLES ---
  {
    type: "PAGE",
    blogHandle: "pages",
    blogTitle: "Pages",
    title: "About Our Story",
    handle: "about",
    excerpt: "Learn about Moon Co. philosophy, ethics and sustainable craftsmanship.",
    tags: ["type:page", "Page", "About"],
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
    type: "PAGE",
    blogHandle: "pages",
    blogTitle: "Pages",
    title: "Shipping & Returns Policy",
    handle: "shipping-returns",
    excerpt: "Everything you need to know about international shipping, delivery times, and returns.",
    tags: ["type:page", "Page", "Shipping"],
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
    type: "PAGE",
    blogHandle: "pages",
    blogTitle: "Pages",
    title: "Frequently Asked Questions",
    handle: "faq",
    excerpt: "Common questions about products, sizing, care instructions, and order management.",
    tags: ["type:page", "Page", "FAQ"],
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

  // --- REGULAR BLOG POSTS ---
  {
    type: "POST",
    blogHandle: "journal",
    blogTitle: "Journal",
    title: "The Art of Slow Fashion: Choosing Quality Over Quantity",
    handle: "the-art-of-slow-fashion",
    excerpt: "Discover why embracing a slow fashion mindset leads to a more sustainable, elevated, and timeless personal style.",
    tags: ["type:post", "Sustainability", "Fashion", "Minimalism"],
    body: `
      <h2>Redefining Modern Wardrobes</h2>
      <p>In a fast-paced digital world, trends come and go in a matter of days. Slow fashion offers a thoughtful antidote—inviting us to pause, reflect, and curate pieces crafted to last a lifetime.</p>
      
      <h3>1. Invest in Timeless Silhouettes</h3>
      <p>Building a wardrobe around versatile neutral tones and classic cuts allows you to effortless layer across seasons without feeling the constant urge to buy into fleeting micro-trends.</p>
      
      <h3>2. Honor Ethically Sourced Textiles</h3>
      <p>Natural fibers like organic cotton, linen, and trace-certified wool feel remarkable against the skin while significantly lowering environmental impact during production.</p>
    `,
  },
  {
    type: "POST",
    blogHandle: "journal",
    blogTitle: "Journal",
    title: "Care Guide: Preserving Organic Cotton & Natural Linens",
    handle: "garment-care-guide",
    excerpt: "Learn simple, eco-friendly washing and maintenance practices that extend the lifespan of your favorite luxury garments.",
    tags: ["type:post", "Care Guide", "Eco Friendly"],
    body: `
      <h2>Extending Garment Lifespan</h2>
      <p>Proper garment care is one of the most effective ways to reduce fashion footprint while keeping your wardrobe looking brand new.</p>
      
      <h3>Cold Washing Matters</h3>
      <p>Washing your garments in cold water preserves natural fabric fibers, prevents shrinkage, and consumes up to 80% less energy than hot washes.</p>
      
      <h3>Air Drying in the Shade</h3>
      <p>Tumble dryers break down natural fibers over time. Hanging garments in gentle shade maintains shape and prevents color fading.</p>
    `,
  },
];

async function ensureBlog(handle: string, title: string): Promise<string> {
  console.log(`Ensuring Blog "${title}" (${handle}) exists...`);
  try {
    const list = await shopifyAdminGraphql<{ blogs: { nodes: Array<{ id: string; handle: string }> } }>(BLOGS_QUERY);
    const existing = list.blogs?.nodes?.find((b) => b.handle === handle);
    if (existing?.id) {
      console.log(`✅ Found existing Blog: "${title}" (ID: ${existing.id})`);
      return existing.id;
    }

    const blogRes = await shopifyAdminGraphql<BlogCreatePayload>(BLOG_CREATE_MUTATION, {
      blog: { title, handle },
    });
    if (blogRes.blogCreate.blog) {
      console.log(`✅ Blog created: ${title} (ID: ${blogRes.blogCreate.blog.id})`);
      return blogRes.blogCreate.blog.id;
    }
  } catch (err) {
    console.log(`ℹ️ Blog info:`, err instanceof Error ? err.message : err);
  }
  return "";
}

async function main() {
  console.log("🚀 Starting Unified Blog & Page Article Seeder...\n");

  const blogMap = new Map<string, string>();
  
  // Ensure unique blogs exist
  for (const post of ALL_CONTENT_POSTS) {
    if (!blogMap.has(post.blogHandle)) {
      const blogId = await ensureBlog(post.blogHandle, post.blogTitle);
      blogMap.set(post.blogHandle, blogId);
    }
  }

  // Create articles with explicit tags (type:page vs type:post)
  for (const post of ALL_CONTENT_POSTS) {
    const blogId = blogMap.get(post.blogHandle) || "";
    if (!blogId) {
      console.error(`⚠️ Skip "${post.title}" because Blog ID for "${post.blogHandle}" is missing.`);
      continue;
    }

    try {
      console.log(`Creating [${post.type}] Article: "${post.title}" under /blogs/${post.blogHandle}/${post.handle}...`);
      const articleRes = await shopifyAdminGraphql<ArticleCreatePayload>(ARTICLE_CREATE_MUTATION, {
        article: {
          blogId,
          title: post.title,
          handle: post.handle,
          author: { name: "Moon Editorial Team" },
          summary: post.excerpt,
          body: post.body,
          tags: post.tags,
        },
      });

      if (articleRes.articleCreate.article) {
        console.log(`✅ [${post.type}] Article created successfully: "${post.title}"`);
      } else if (articleRes.articleCreate.userErrors.length > 0) {
        console.error(`❌ User errors for "${post.title}":`, articleRes.articleCreate.userErrors);
      }
    } catch (err) {
      console.error(`❌ Failed to push article "${post.title}":`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n🎉 Finished unified Blog Article seeding process!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
