import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Absolute base path — clean URLs at the domain root
  // (use './' instead if the app is ever served from a subdirectory).
  base: '/',

  build: {
    outDir: 'dist',

    // Hashed, content-addressed asset filenames (needed for the 1-year
    // immutable Cache-Control headers in .htaccess).
    assetsDir: 'assets',
    assetsInlineLimit: 4096,

    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Manual chunking -> smaller parallel downloads, better caching.
        // The vendor bundles only re-download when their own deps bump.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'helmet': ['react-helmet-async'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  server: {
    port: 5173,
  },
})
