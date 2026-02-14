import { defineConfig } from 'vite';
import { resolve } from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  root: 'src',
  base: '/MustaqueHalderPortfolioWebsite/',   // <-- add this
  plugins: [
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { lossless: true }
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        portfolio: resolve(__dirname, 'src/portfolio-details.html'),
        service: resolve(__dirname, 'src/service-details.html'),
        starter: resolve(__dirname, 'src/starter-page.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          const extType = /png|jpe?g|svg|gif|tiff|bmp|ico/i.test(
            assetInfo.name.split('.')[4]
          )
            ? 'img'
            : assetInfo.name.split('.')[4];
          return `assets/${extType}/[name][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  },
  server: {
    open: true,
    port: 3000
  },
  css: {
    devSourcemap: true
  }
});
