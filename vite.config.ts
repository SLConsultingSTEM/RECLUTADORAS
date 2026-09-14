import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Drop mock project artwork from production builds that talk to a real API. */
function omitMockPublicAssets(): Plugin {
  return {
    name: 'omit-mock-public-assets',
    apply: 'build',
    closeBundle() {
      const useMock = process.env.VITE_USE_MOCK === 'true'
      if (useMock) return

      const mockDir = path.resolve(__dirname, 'dist/proyectos')
      if (fs.existsSync(mockDir)) {
        fs.rmSync(mockDir, { recursive: true, force: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), omitMockPublicAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    sourcemap: false,
    target: 'es2022',
    cssCodeSplit: true,
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        // Avoid preloading every lazy route chunk on first paint.
        deps.filter((dep) => !/PanelReclutadora|NuevoRegistro|AdminPage/.test(dep)),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('dompurify')) return 'dompurify'
            if (id.includes('zod')) return 'zod'
          }
        },
      },
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy':
        "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:",
      // Long-cache hashed assets; HTML stays short-lived via hosting config.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  },
})
