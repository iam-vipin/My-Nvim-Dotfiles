import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import dotenv from "dotenv";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { joinUrlPath } from "@plane/utils";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Automatically expose all environment variables prefixed with NEXT_PUBLIC_
const publicEnv = Object.keys(process.env)
  .filter((key) => key.startsWith("NEXT_PUBLIC_"))
  .reduce<Record<string, string>>((acc, key) => {
    acc[key] = process.env[key] ?? "";
    return acc;
  }, {});

const basePath = joinUrlPath(process.env.NEXT_PUBLIC_SPACE_BASE_PATH ?? "", "/") ?? "/";

export default defineConfig(() => ({
  base: basePath,
  define: {
    "process.env": JSON.stringify(publicEnv),
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
      "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element": import.meta.resolve(
        "@atlaskit/pragmatic-drag-and-drop-auto-scroll/dist/esm/entry-point/element.js"
      ),
      "@atlaskit/pragmatic-drag-and-drop/element/adapter": import.meta.resolve(
        "@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/adapter.js"
      ),
      "@atlaskit/pragmatic-drag-and-drop/private/get-element-from-point-without-honey-pot": import.meta.resolve(
        "@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/private/get-element-from-point-without-honey-pot.js"
      ),
      // Next.js compatibility shims used within space
      "next/image": path.resolve(__dirname, "app/compat/next/image.tsx"),
      "next/link": path.resolve(__dirname, "app/compat/next/link.tsx"),
      "next/navigation": path.resolve(__dirname, "app/compat/next/navigation.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
