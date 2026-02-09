import path from "node:path";
import * as dotenv from "@dotenvx/dotenvx";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Expose only vars starting with VITE_
const viteEnv = Object.keys(process.env)
  .filter((k) => k.startsWith("VITE_"))
  .reduce<Record<string, string>>((a, k) => {
    a[k] = process.env[k] ?? "";
    return a;
  }, {});

const plugins = [reactRouter(), tsconfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] })];

if (process.env.SENTRY_AUTH_TOKEN) {
  const release = process.env.VITE_APP_VERSION ?? "v26.01.01";
  plugins.push(
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "plane-hq",
      project: "plane-web",
      release: { name: release },
      sourcemaps: {
        filesToDeleteAfterUpload: ["build/client/**/*.map", "build/server/**/*.map"],
      },
    })
  );
}

export default defineConfig({
  define: {
    "process.env": JSON.stringify(viteEnv),
  },
  build: {
    sourcemap: "hidden",
    assetsInlineLimit: 0,
  },
  plugins,
  resolve: {
    alias: {
      // Next.js compatibility shims used within web
      "next/link": path.resolve(__dirname, "app/compat/next/link.tsx"),
      "next/navigation": path.resolve(__dirname, "app/compat/next/navigation.ts"),
    },
    dedupe: ["react", "react-dom", "@headlessui/react"],
  },
  server: {
    host: "127.0.0.1",
    warmup: {
      clientFiles: ["./app/root.tsx", "./app/entry.client.tsx", "./styles/globals.css"],
    },
  },
  css: {
    devSourcemap: false,
  },
  optimizeDeps: {
    exclude: ["@plane/tailwind-config"],
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "mobx",
      "mobx-react",
      "mobx-utils",
      "react-router",
      "clsx",
      "lucide-react",
      "swr",
      "axios",
      "lodash-es",
      "date-fns",
      "uuid",
      "@headlessui/react",
      "react-hook-form",
      "fuse.js",
      "cmdk",
    ],
  },
  // No SSR-specific overrides needed; alias resolves to ESM build
});
