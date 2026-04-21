import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size limit to suppress warning (optional)
    chunkSizeWarningLimit: 1000,
    // Disable sourcemaps to save memory during build on Render
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunking to split large vendor libraries and prevent OOM on Render
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('swiper')) return 'vendor-swiper';
            if (id.includes('bootstrap')) return 'vendor-bootstrap';
            if (id.includes('axios')) return 'vendor-axios';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor-others';
          }
        }
      }
    }
  }
})
