import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import codeforcesHandler from "./api/codeforces.js";

function localApiPlugin() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use("/api/codeforces", async (req, res) => {
        const url = new URL(req.url || "", "http://localhost");
        const response = {
          statusCode: 200,
          headers: {},
          setHeader(key, value) {
            this.headers[key] = value;
            res.setHeader(key, value);
          },
          status(code) {
            this.statusCode = code;
            res.statusCode = code;
            return this;
          },
          json(payload) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(payload));
          },
        };

        await codeforcesHandler({
          method: req.method,
          query: Object.fromEntries(url.searchParams.entries()),
          headers: req.headers,
          socket: req.socket,
        }, response);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    localApiPlugin(),
    wasm(),
    react(),
  ],
  assetsInclude: ["**/*.wasm"],
  worker: {
    plugins: () => [wasm()],
  },
  optimizeDeps: {
    exclude: ["@wasm-fmt/clang-format"],
  },
  build: {
    target: "esnext",
  },
});
