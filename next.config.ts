import path from "path";
import type { NextConfig } from "next";

/**
 * Room APIs live under `app/api/*` (Route Handlers) so dev does not use the separate Pages API
 * webpack compiler that raced SSR pages (`webpack-api-runtime` vs `webpack-runtime`) and blew away
 * manifests / vendor chunks. UI stays on `pages/`.
 *
 * Prefer `npm run dev` (webpack). `next dev --turbopack` mixes bundlers again—use `dev:clean:turbo`
 * if needed. Do not delete `.next` while the dev server runs. `NEXT_DIST_DIR` overrides `distDir`.
 */
const distDir =
  typeof process.env.NEXT_DIST_DIR === "string" && process.env.NEXT_DIST_DIR.length > 0
    ? process.env.NEXT_DIST_DIR
    : ".next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  distDir,

  onDemandEntries: {
    maxInactiveAge: 5 * 60 * 1000,
    pagesBufferLength: 24,
  },
};

export default nextConfig;
