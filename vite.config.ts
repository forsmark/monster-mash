import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// On olympus-edge the Containerfile sets APP_BASE (/monster-mash/). There the page links the
// platform's per-user manifest, so a home-screen install stays signed in. GitHub Pages builds
// leave it out, because that URL only exists on the platform.
function edgeManifest(): Plugin {
  const appId = (process.env.APP_BASE ?? '/').replace(/^\/|\/$/g, '')
  return {
    name: 'edge-manifest',
    transformIndexHtml: () =>
      appId
        ? [{ tag: 'link', attrs: { rel: 'manifest', href: `/_auth/manifest/${appId}.webmanifest`, crossorigin: 'use-credentials' }, injectTo: 'head' }]
        : [],
  }
}

// A relative base lets the build work under any GitHub Pages repo path, and under /monster-mash/.
export default defineConfig({
  base: './',
  plugins: [react(), edgeManifest()],
})
