import path from "path";
import type { NextConfig } from "next";

/**
 * Single `distDir` (`.next`) avoids split output: webpack fallback compilations (e.g. some API
 * routes) and Turbopack no longer disagree on `.next` vs `.next-dev`, which caused ENOENT on
 * manifests, vendor-chunks, and stale server bundles.
 *
 * After `npm run build`, prefer `npm run dev:clean` once before `npm run dev` if anything 500s.
 * Override output dir with `NEXT_DIST_DIR` if needed.
 */
const distDir =
  typeof process.env.NEXT_DIST_DIR === "string" && process.env.NEXT_DIST_DIR.length > 0
    ? process.env.NEXT_DIST_DIR
    : ".next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  distDir,

  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 8,
  },

  webpack(config, { dev }) {
    // Stops PackFileCacheStrategy ENOENT / unhandledRejection on missing `*.pack.gz` when the
    // cache dir is partial or cleared while `next dev` is running.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
