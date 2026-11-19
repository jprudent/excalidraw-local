import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Excalidraw reads process.env.IS_PREACT at runtime; we use React, so pin it.
  define: { "process.env.IS_PREACT": JSON.stringify("false") },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
