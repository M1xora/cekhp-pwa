import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // ── Web App Manifest (Requirement 11.1) ────────────────────────────────
      manifest: {
        name: 'CekHP — Diagnostic Tool',
        short_name: 'CekHP',
        description: 'Diagnose smartphone hardware and software problems with a guided AI-powered expert system.',
        theme_color: '#8b5cf6',
        background_color: '#f5f3ff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // ── Workbox configuration (Requirement 11.2) ──────────────────────────
      workbox: {
        // Pre-cache all static assets at service worker install time.
        // The mockData bundle (compiled to JS) is automatically included via
        // the **/*.js glob so the mock Knowledge Base is available offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Use NetworkFirst for navigation (HTML) so updates are picked up
        // promptly, and CacheFirst for all other static assets.
        runtimeCaching: [
          {
            // Static assets: JS, CSS, fonts, images — CacheFirst for speed
            urlPattern: /\.(?:js|css|woff2?|png|svg|ico|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // HTML navigation requests — NetworkFirst so the latest shell is
            // delivered when online; falls back to cached shell when offline.
            urlPattern: /\.html$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages',
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],

        // Ensure the service worker claims all open clients immediately on
        // activation so the updated version takes effect without a reload loop.
        clientsClaim: true,
        skipWaiting: true,
      },

      // ── Dev options ────────────────────────────────────────────────────────
      devOptions: {
        // Enable the service worker in dev so offline behaviour can be
        // verified locally with `vite dev` + DevTools "Offline" toggle.
        enabled: false, // set to true to debug SW locally
        type: 'module',
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        // ── Manual chunk splitting ──────────────────────────────────────────
        // All third-party node_modules go to a single "vendor" chunk so it
        // can be cached independently from the app code.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split heavy libraries into dedicated sub-chunks to allow fine-
            // grained caching while still keeping them out of the app chunk.
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('react-router') || id.includes('react-dom')) return 'vendor-react'
            if (id.includes('zustand')) return 'vendor-zustand'
            // Everything else in node_modules → generic vendor chunk
            return 'vendor'
          }
          // App code: each route/page gets its own async chunk via React.lazy
          // (handled automatically by Rollup when using dynamic imports)
        },

        // ── Asset file naming with content hash (enables long-term caching) ─
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',
      },
    },
  },

  server: {
    headers: {
      // In production these headers are typically set by the CDN/web server.
      // Kept here for reference — the actual 1-year immutable cache header is
      // applied in Task 23.1 via the deployment/server config.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
})
