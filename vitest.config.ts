import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Resolve o alias "@/..." (mesmo de tsconfig) também sob o vitest.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
