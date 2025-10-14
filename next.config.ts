import { execSync } from "child_process";
import type { NextConfig } from "next";

let commit = "?"
try {
  commit = execSync("git rev-parse --short HEAD").toString().trim()
} catch (e) {
  console.warn("Unable to get commit hash, falling back to '?'")
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true
  },
  distDir: "dist",

  env: {
    NEXT_PUBLIC_COMMIT_SHA: commit,
  }
};

export default nextConfig;
