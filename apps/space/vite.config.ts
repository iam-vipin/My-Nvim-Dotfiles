import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { joinUrlPath } from "@plane/utils";

// Expose only vars starting with VITE_
const viteEnv = Object.keys(process.env)
  .filter((k) => k.startsWith("VITE_"))
  .reduce<Record<string, string>>((a, k) => {
    a[k] = process.env[k] ?? "";
    return a;
  }, {});

const basePath = joinUrlPath(process.env.VITE_SPACE_BASE_PATH ?? "", "/") ?? "/";

export default defineConfig(() => ({
  base: basePath,
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
