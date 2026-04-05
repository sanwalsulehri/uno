/**
 * If `.next` exists but looks incomplete or inconsistent, remove it before `next dev`.
 * Catches: missing manifests, webpack server runtime without matching vendor chunk for `next`.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const nextDir = path.join(root, ".next");

if (!fs.existsSync(nextDir)) {
  process.exit(0);
}

const routesManifest = path.join(nextDir, "routes-manifest.json");
const serverDir = path.join(nextDir, "server");
const webpackRuntime = path.join(serverDir, "webpack-runtime.js");
const vendorDir = path.join(serverDir, "chunks", "vendor-chunks");
const vendorNext = path.join(vendorDir, "next.js");

function remove(reason) {
  console.warn(`[predev] Removing .next (${reason}).`);
  fs.rmSync(nextDir, { recursive: true, force: true });
}

if (!fs.existsSync(routesManifest)) {
  remove("missing routes-manifest.json");
  process.exit(0);
}

// Only when vendor splitting was used and left a broken tree (folder exists but next chunk gone).
if (
  fs.existsSync(webpackRuntime) &&
  fs.existsSync(vendorDir) &&
  !fs.existsSync(vendorNext)
) {
  remove("stale webpack output (vendor-chunks/ exists but next.js chunk missing)");
}
