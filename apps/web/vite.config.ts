import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import dotenv from "dotenv";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Expose only vars starting with VITE_
const viteEnv = Object.keys(process.env)
  .filter((k) => k.startsWith("VITE_"))
  .reduce<Record<string, string>>((a, k) => {
    a[k] = process.env[k] ?? "";
    return a;
  }, {});

export default defineConfig(() => ({
  define: {
    "process.env": JSON.stringify(viteEnv),
  },
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [reactRouter(), tsconfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] })],
  resolve: {
    alias: {
      "@atlaskit/pragmatic-drag-and-drop/combine": import.meta.resolve(
        "@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/combine.js"
      ),
      "@atlaskit/pragmatic-drag-and-drop/element/adapter": import.meta.resolve(
        "@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/adapter.js"
      ),
      // Next.js compatibility shims used within web
      "next/link": path.resolve(__dirname, "app/compat/next/link.tsx"),
      "next/navigation": path.resolve(__dirname, "app/compat/next/navigation.ts"),
      "next/script": path.resolve(__dirname, "app/compat/next/script.tsx"),
    },
    dedupe: ["react", "react-dom", "@headlessui/react"],
  },
  server: {
    host: "127.0.0.1",
  },
  // No SSR-specific overrides needed; alias resolves to ESM build
}));
