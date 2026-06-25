import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    exclude: ["tests/**", "node_modules/**"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "BOOKEasy - Appointment Booking Platform",
        short_name: "BOOKEasy",
        description:
          "Seamless appointment booking platform for service providers and clients",
        theme_color: "#369936",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        categories: ["business", "productivity", "utilities"],
        lang: "en",
        dir: "ltr"
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              /\.(png|jpg|jpeg|svg|gif|webp|avif)$/.test(url.pathname) &&
              !url.hostname.includes("onrender.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:js|css|woff2|woff|ttf|eot)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: "module"
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: "esnext",
    minify: "terser",
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false, // Faster builds
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime — cached long-term
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return "vendor";
          }
          // Router — needed early
          if (id.includes("node_modules/react-router")) {
            return "router";
          }
          // Form libraries — only needed on form pages
          if (id.includes("node_modules/formik") || id.includes("node_modules/yup")) {
            return "forms";
          }
          // UI libraries
          if (id.includes("node_modules/react-modal") || id.includes("node_modules/react-datepicker")) {
            return "ui";
          }
          // Utility libraries
          if (id.includes("node_modules/date-fns") || id.includes("node_modules/axios")) {
            return "utils";
          }
          // Framer motion — heavy, only load when needed
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
          // Socket.io — only needed when authenticated
          if (id.includes("node_modules/socket.io")) {
            return "socket";
          }
          // Other node_modules
          if (id.includes("node_modules")) {
            return "vendor-misc";
          }
          // Pages are automatically split by React.lazy() dynamic imports
        },
        // Optimize chunk size for mobile networks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop().replace(".js", "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    },
    // Optimize for mobile
    chunkSizeWarningLimit: 600, // Lower limit for mobile
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"]
      }
    }
  }
});
