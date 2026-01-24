import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "favicon.png", "robots.txt"],
      manifest: {
        name: "TAXKORA - Nigeria Tax Calculator",
        short_name: "TAXKORA",
        description: "Nigeria's #1 tax compliance software. Calculate PIT, CIT, VAT & WHT. Free tax calculator for Nigerian businesses and freelancers.",
        theme_color: "#0D9488",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["finance", "business", "productivity"],
        lang: "en-NG",
        icons: [
          {
            src: "/pwa-icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/pwa-icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/pwa-icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/pwa-icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/pwa-icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/pwa-icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/pwa-icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/pwa-icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any"
          }
        ],
        screenshots: [
          {
            src: "/pwa-icons/screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "TAXKORA Dashboard"
          },
          {
            src: "/pwa-icons/screenshot-mobile.png",
            sizes: "720x1280",
            type: "image/png",
            form_factor: "narrow",
            label: "TAXKORA Mobile"
          }
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "Go to your tax dashboard",
            url: "/dashboard",
            icons: [{ src: "/pwa-icons/icon-96x96.png", sizes: "96x96" }]
          },
          {
            name: "Calculate Tax",
            short_name: "Tax",
            description: "Calculate your taxes",
            url: "/dashboard/tax",
            icons: [{ src: "/pwa-icons/icon-96x96.png", sizes: "96x96" }]
          },
          {
            name: "Add Income",
            short_name: "Income",
            description: "Record new income",
            url: "/dashboard/income",
            icons: [{ src: "/pwa-icons/icon-96x96.png", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/xvrmtsgagzcbdgxrwdly\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB limit
      },
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
