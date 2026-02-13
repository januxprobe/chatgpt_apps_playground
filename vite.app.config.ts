import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const APP = process.env.APP;

if (!APP) throw new Error("APP environment variable not set");

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    sourcemap: process.env.NODE_ENV === "development" ? "inline" : undefined,
    cssMinify: process.env.NODE_ENV !== "development",
    minify: process.env.NODE_ENV !== "development",
    rollupOptions: {
      input: `apps/${APP}/widget/${APP}-widget.html`,
    },
    outDir: `dist/${APP}/widget`,
    emptyOutDir: false,
  },
});
