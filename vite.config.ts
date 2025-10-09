import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    allowedHosts: [".ngrok-free.app", ".ngrok.io", ".ngrok.app"],
    host: "0.0.0.0",
    port: 5173,
  },
});
