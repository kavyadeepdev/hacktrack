# PWA roadmap (deferred, not in MVP)

The app is **PWA-ready by structure** (mobile-first shell, manifest stub,
safe-area handling) but intentionally **not installable/offline yet**.
Ship the tracker + Neon first; do this milestone when retention matters.

## Already in place

- `public/manifest.webmanifest` (stub — needs real icons)
- `manifest` + `appleWebApp` + `viewportFit: cover` in `src/app/layout.tsx`
- Bottom nav reserves `env(safe-area-inset-bottom)`

## To become a real PWA

1. **Icons**: generate 192px + 512px (maskable) icons, reference in manifest.
2. **Service worker**: add `seriwati`-style SW or `next-pwa`-equivalent;
   precache shell (`/`, `/hackathons`), runtime-cache Neon-backed API reads.
3. **Offline writes**: queue `add/update` ops in IndexedDB when offline,
   sync on `online` + background sync; surface “synced” state in UI.
4. **Install UX**: `beforeinstallprompt` capture → custom “Install app” row
   in settings (mobile Safari: Add-to-Home-Screen guidance instead).
5. **Verify**: Lighthouse PWA ≥ 90, install on Android + iOS, airplane-mode
   smoke test (list renders, queued write syncs on reconnect).

## Non-goals for the PWA milestone

Push notifications and background fetch — revisit only with a concrete
deadline-reminder use case.
