/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA pieces are deliberately plugin-free: public/manifest.webmanifest is
// static, registration lives in src/main.tsx, and scripts/build-sw.mjs
// generates dist/sw.js as the last build step (see package.json).
export default defineConfig({
  // GitHub Pages serves from /nutri/ — the deploy workflow sets BASE_PATH.
  // Local dev/preview stay at '/'. scripts/build-sw.mjs reads the same var.
  base: process.env.BASE_PATH ?? '/',
  preview: { port: Number(process.env.PORT) || 4173 },
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
