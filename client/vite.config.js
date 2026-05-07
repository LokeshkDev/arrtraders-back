import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jodit-react', 'dompurify'],
    force: true
  },
  build: {
    // Increase chunk size limit to suppress warning (optional)
    chunkSizeWarningLimit: 1000,
    // Disable sourcemaps to keep production builds lighter.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split large vendor libraries for lower memory usage during production builds.
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
