import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Avoid wrong workspace root when a parent folder has another lockfile. */
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
