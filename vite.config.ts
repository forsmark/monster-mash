import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// A relative base lets the build work under any GitHub Pages repo path.
export default defineConfig({
  base: './',
  plugins: [react()],
})
