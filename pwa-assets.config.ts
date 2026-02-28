import { defineConfig } from '@vite-pwa/assets-generator/config'

/**
 * PWA assets generator configuration.
 *
 * Generates all required icon sizes (64, 192, 512px PNGs, maskable 512, and
 * apple-touch-icon 180px) from the single SVG source in public/icon.svg using
 * the minimal preset. Run `npm run generate-pwa-assets` to regenerate after
 * updating the source SVG.
 */
export default defineConfig({
  preset: 'minimal-2023',
  images: ['public/icon.svg'],
})
