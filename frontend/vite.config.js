import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // Allows access from other devices on the same local network
    host: "0.0.0.0",
    port: 5173,
  },
});
