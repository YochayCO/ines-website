import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// TODO: draw target from environment variable
export default defineConfig({
  server: {
      proxy: {
          '/wp-content/uploads': {
              target: 'http://localhost:8888',
              changeOrigin: true,
              secure: false,
          },
      },
  },
  plugins: [react()],
})
