import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// @ts-ignore
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss()],
  build: {
    minify: false,
    outDir: "dist",
    emptyOutDir: true,
    lib: false,
    target: "es6",
  },
});
