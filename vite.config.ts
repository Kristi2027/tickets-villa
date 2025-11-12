import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Optional bundle analyzer. Set ANALYZE=true in the environment to generate report.html in the build output.
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const shouldAnalyze = Boolean(process.env.ANALYZE);
  const pluginsList = [react()];
  if (shouldAnalyze) {
    pluginsList.push(visualizer({ filename: 'dist/report.html', open: false }) as any);
  }

  return {
    base: './',
    plugins: pluginsList,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Reduced warning limit after code-splitting improvements
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split node_modules into vendor chunks and separate very large libs.
          manualChunks(id) {
            if (!id) return undefined;
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'vendor_react';
              if (id.includes('@google/genai')) return 'vendor_genai';
              if (id.includes('lodash')) return 'vendor_lodash';
              return 'vendor';
            }

            // Group admin/dashboard pages into their own chunk (large UI sections)
            if (id.includes('/components/Admin') || id.includes('AdminDashboard')) return 'admin';
            if (id.includes('/components/TheatreManager') || id.includes('TheatreManagerDashboard')) return 'theatre_manager';
            if (id.includes('/components/Artist') || id.includes('ArtistDashboard')) return 'artist';

            return undefined;
          }
        }
      }
    }
  }
})

