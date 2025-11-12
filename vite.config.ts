import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  
  const env = {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  };

  return {
    plugins: [react()],
    define: env,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 4000
    },
    server: {
      host: true, // Expose server to the network
    }
  };
});