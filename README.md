# DNSVCDSYSTEM

Vue 3 + TypeScript + Vite implementation of the KOEN high-voltage breaker panel position guidance system.

## Stack

- Vue 3
- Vue Router 4
- TypeScript
- Vite
- Tailwind CSS v4
- Express server with JSON persistence
- Three.js assets kept in `public/` for panel and room models

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

The development server runs through `server.js` and serves the Vite app plus local API endpoints.

## Main Paths

- `src/main.ts` — Vue application entry
- `src/App.vue` — root router outlet
- `src/router.ts` — Vue Router configuration
- `src/pages/Dashboard.vue` — main dashboard
- `src/components/layout/` — layout, header, sidebar
- `src/components/dashboard/` — dashboard widgets and panel views
- `src/components/ui/` — shared UI primitives
- `src/api/operations.ts` — API helpers
- `src/data/` — panel, operation, and demo data
- `server.js` — local API and Vite middleware server
