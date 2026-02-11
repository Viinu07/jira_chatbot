import { defineConfig } from 'vite'
// @ts-expect-error - tailwindcss/vite types are not detected by some TS configurations
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
