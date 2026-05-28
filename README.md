# DNSVCDSYSTEM

Vue 3 implementation of the KOEN high-voltage breaker panel position guidance system.

The application gives operators a dashboard for breaker/key operations, active panel highlighting, operation history, and a 3D switchgear room view that guides the user to the selected panel.

## Quick Start

```bash
npm install
npm run dev
```

Open the app at:

```text
http://localhost:8000
```

Use `localhost` or `127.0.0.1` in the browser. The server binds to `0.0.0.0` so it can accept local network traffic, but `0.0.0.0` is not the browser URL.

## Commands

```bash
npm run dev       # Starts the local API server and Vite middleware on port 8000
npm run dev:vite  # Starts only Vite, without the local API
npm run build     # TypeScript check and production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

For normal development and hardware-team testing, use `npm run dev`. The dashboard expects the local API endpoints from `server.js`.

## Main Features

- Dashboard with active operations, alarms, recent activity, and operation controls
- Register, start, complete, and history modals
- 2D panel floor map with 47 panel positions
- 3D switchgear room rendered with Three.js and GLB assets
- Active panel blinking and camera guidance sequence
- Local API for operations and active-panel state
- JSON persistence for active panel state in `panels-state.json`

## Important Paths

```text
server.js                                Local API and Vite middleware server
panels-state.json                        Active panel persistence file
src/main.ts                              Vue application entry
src/router.ts                            Vue Router configuration
src/pages/Dashboard.vue                  Main dashboard state and workflows
src/components/dashboard/ThreePanelViewer.vue  3D room and panel visualization
src/components/dashboard/FloorPlan.vue   2D panel map
src/components/modals/                   Register/start/complete/history dialogs
src/components/ui/ActionButton.vue       Dashboard action buttons
src/api/operations.ts                    Frontend API helpers
src/data/panels.ts                       Canonical panel metadata
public/*.glb                             3D panel, floor, and ceiling models
public/textures/                         3D texture and HDR assets
```

## API Summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/operations` | Returns operation records |
| `POST` | `/api/operations` | Creates a new operation |
| `PATCH` | `/api/operations/complete` | Marks operations complete |
| `GET` | `/api/active-panels` | Returns active panel highlights |
| `POST` | `/api/active-panels` | Replaces active panel highlights |
| `DELETE` | `/api/active-panels` | Clears active panel highlights |

See [DNSVCDSYSTEM_DOCS.md](./DNSVCDSYSTEM_DOCS.md) for integration details, payload examples, and troubleshooting notes.
