import { defineConfig } from 'vite';
import { resolve } from 'path';
// import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';  // ← commented out

/** FOUC + theme flash: sync data-theme before paint; load critical.css before Vite-injected module entry. */
function foucHeadPlugin() {
  const earlyBoot = `  <script>
    (function () {
      try {
        var light = localStorage.getItem('theme') === 'light';
        document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
        document.documentElement.style.backgroundColor = light ? '#f5f7fa' : '#090c11';
        function syncBody() {
          if (!document.body) return;
          if (light) document.body.classList.remove('dark-background');
        }
        syncBody();
        document.addEventListener('DOMContentLoaded', syncBody, { once: true });
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.backgroundColor = '#090c11';
      }
    })();
  </script>
  <link rel="stylesheet" href="./assets/css/critical.css" />`;

  return {
    name: 'fouc-early-theme-critical-css',
    transformIndexHtml(html) {
      let out = html.replace(/<meta\s+charset=["']utf-8["']\s*\/?>/i, (m) => `${m}\n${earlyBoot}`);
      out = out.replace(
        /(<script[^>]*\btype\s*=\s*["']module["'][^>]*>\s*<\/script>)\s*\n?\s*(<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*>)/i,
        '$2\n  $1'
      );
      return out;
    }
  };
}

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'src/public'),
  base: './',  // ← relative paths for any static host
  plugins: [foucHeadPlugin()],
  build: {
    outDir: '../docs',
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
