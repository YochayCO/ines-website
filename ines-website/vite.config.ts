import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// TODO: draw target from environment variable
export default defineConfig({
    plugins: [react()],
})
