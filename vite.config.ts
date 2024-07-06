import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

const root = resolve(__dirname, "src");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      emitFile: true,
      filename: "stats.html",
    }) as PluginOption,
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": resolve(root),
    },
  },
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: (id) => {
  //         if (id.includes("framer-motion")) {
  //           return "@framer-motion";
  //         }
  //
  //         if (
  //           id.includes("react-router-dom") ||
  //           id.includes("@remix-run") ||
  //           id.includes("react-router")
  //         ) {
  //           return "@react-router";
  //         }
  //
  //         if (id.includes("jszip")) {
  //           return "@jszip";
  //         }
  //         if (id.includes("reactflow")) {
  //           return "@reactflow";
  //         }
  //       },
  //     },
  //   },
  // },
});
