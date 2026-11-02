import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";

// Next only auto-loads env files from the app directory. Server workers also
// need the monorepo root configuration, without exposing server secrets.
loadEnvConfig(resolve(process.cwd(), "../.."));
