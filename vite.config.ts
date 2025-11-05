import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/anki-learner/',   // <-- IMPORTANT for GitHub Pages project site
  plugins: [react()],
})
