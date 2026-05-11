const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [
    react(),
    {
      name: 'custom-csp',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace(
          'content="default-src \'self\' \'unsafe-inline\' data: blob:; img-src \'self\' data: blob:;',
          'content="default-src \'self\' \'unsafe-inline\' data: blob:; img-src \'self\' data: blob: file:;'
        );
      }
    }
  ],
  base: "./",
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "renderer-dist",
    emptyOutDir: true,
  },
});