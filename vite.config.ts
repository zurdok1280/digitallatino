import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from '@vitejs/plugin-legacy';
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimizaciones de rendimiento
    
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Code splitting manual más granular
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs'
          ],
          'vendor-charts': ['recharts'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-utils': ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    },
    // Optimizar chunk size
    chunkSizeWarningLimit: 1000,
    // Optimizar assets
    assetsInlineLimit: 4096, // Inline assets < 4kb
    cssCodeSplit: true,
    sourcemap: mode === 'development',
  },
  // Optimizar carga de assets
  assetsInclude: ['**/*.webp', '**/*.avif'],
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ],
  },
  // Configurar headers para caching
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
}));
