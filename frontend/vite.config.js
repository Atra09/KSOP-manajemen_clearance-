import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr' // <-- 1. Tambahkan baris import ini

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr() // <-- 2. Tambahkan svgr() di sini
  ],
})