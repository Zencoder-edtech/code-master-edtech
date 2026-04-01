import { config } from "dotenv";
import path from "path";

// Load .env from the monorepo root (2 levels up from packages/infrastructure)
config({ path: path.resolve(__dirname, "../../.env") });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
