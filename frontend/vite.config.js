import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../");

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_SERVER_URL": JSON.stringify(env.VITE_SERVER_URL),
      "import.meta.env.VITE_WS_SERVER": JSON.stringify(env.WS_SERVER_URL),
    },
  };
});
