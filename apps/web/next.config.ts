import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";
import type { NextConfig } from "next";

// The monorepo keeps secrets in its root `.env`; Next otherwise only loads apps/web/.env.
loadEnvConfig(resolve(import.meta.dirname, "../.."));

const nextConfig: NextConfig = {
  // Workspace packages publish TypeScript source during local development.
  transpilePackages: ["@subscript/contracts", "@subscript/database", "@subscript/utils"]
};
export default nextConfig;
