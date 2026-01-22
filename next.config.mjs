import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

/// dev
///-----
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  //Image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gnjdysar8zpiiswk.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },

  // react compiler
  reactCompiler: true,
  //  Experimental Beta
  experimental: {
    // Use React Compiler
    // reactCompiler: {
    //   compilationMode: "annotation",
    // },
    // reactCompiler: true,

    inlineCss: true,

    // turbopackFileSystemCacheForDev: true,
    // viewTransition: true,
    // ppr: "incremental",

    // turbopackFileSystemCacheForDev: true,
    // no supports production nextjs latest version
    // cacheComponents: true, // next@canary
  },

  // tuborpack
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    rules: {
      "*.svg": {
        as: "*.js",
        loaders: ["@svgr/webpack"],
      },
    },
  },
  //webpack config
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     // Don't bundle server-only packages on the client
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       net: false,
  //       tls: false,
  //       crypto: false,
  //       stream: false,
  //       url: false,
  //       zlib: false,
  //       http: false,
  //       https: false,
  //       assert: false,
  //       os: false,
  //       path: false,
  //       worker_threads: false,
  //       child_process: false,
  //     };
  //   }
  //   return config;
  // },

  //Config I18n next-intl
  // i18n: {
  //   locales: ['vi', 'en'],
  //   defaultLocale: 'vi',
  // },
};

export default withNextIntl(
  withPayload(nextConfig, { devBundleServerPackages: false }),
);
