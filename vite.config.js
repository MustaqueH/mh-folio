import { defineConfig } from 'vite';
import { resolve } from 'path';
// import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';  // ← commented out

export default defineConfig({
  root: 'src',
  base: './',  // ← relative paths for any static host
  plugins: [
    //  ViteImageOptimizer({
    //    png: { quality: 80 },
    //    jpeg: { quality: 80 },
    //    webp: { lossless: true }
    //  })
    ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        portfolio: resolve(__dirname, 'src/portfolio-details.html'),
        portfolio2: resolve(__dirname, 'src/portfolio-details2.html'),
        portfolioSecurity: resolve(__dirname, 'src/portfolio-security.html'),
        portfolioAutomation: resolve(__dirname, 'src/portfolio-automation.html'),
        portfolioHybrid: resolve(__dirname, 'src/portfolio-hybrid.html'),
        service: resolve(__dirname, 'src/service-details.html'),
        starter: resolve(__dirname, 'src/starter-page.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop() || '';
          const type = ext.match(/png|jpe?g|webp|gif|svg/) ? 'img' : ext;
          return `assets/${type}/[name].[hash][extname]`;
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
