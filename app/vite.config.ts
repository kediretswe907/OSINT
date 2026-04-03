import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    plugins: [react()],
    server: {
      proxy: {
        '/api/osint': {
          target: env.VITE_N8N_WEBHOOK_URL || 'https://n8n.example.com/webhook/osint',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/osint/, '')
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
