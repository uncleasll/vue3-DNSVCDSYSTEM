# DNSVCDSYSTEM Project Documentation

## 1. Purpose

DNSVCDSYSTEM is a local operator interface for high-voltage breaker/key operation guidance.

The system is intended for control-room and hardware-team workflows where an operator needs to:

- Register a breaker/key operation request.
- Start one or more operation targets.
- Highlight active target panels on the dashboard.
- Guide the user to the target panel in the 3D switchgear room.
- Complete active operations.
- Review operation history.

The current application is a Vue 3 frontend with a local Node.js server. The local server provides API endpoints and Vite middleware for development.

## 2. How to Run

Install dependencies once:

```bash
npm install
```

Start the application:

```bash
npm run dev
```

Open:

```text
http://localhost:8000
```

Alternative local URL:

```text
http://127.0.0.1:8000
```

Do not use `http://0.0.0.0:8000` in the browser. `0.0.0.0` is only the server bind address.

## 3. Build and Verification

Production build:

```bash
npm run build
```

This runs:

```bash
tsc -b
vite build
```

Expected output is a generated `dist/` directory.

## 4. Runtime Architecture

```text
Browser
  |
  | HTTP requests
  v
server.js
  |
  |-- /api/* endpoints
  |-- public asset serving
  |-- Vite middleware for Vue files during development
  v
Vue 3 application
```

`server.js` is required for normal dashboard testing because the frontend calls `/api/operations` and `/api/active-panels`.

Running only Vite with `npm run dev:vite` is useful for isolated frontend debugging, but API calls will not behave like the integrated app unless a proxy or backend is available.

## 5. Project Structure

```text
src/
  main.ts                         Vue app entry
  App.vue                         Root component
  router.ts                       Route definitions

  pages/
    Dashboard.vue                 Main dashboard workflow
    UnitOverview.vue              Panel/unit overview
    AlarmEvent.vue                Alarm and event page
    History.vue                   History page
    Settings.vue                  Settings page

  components/
    dashboard/
      FloorPlan.vue               2D panel map
      ImageViewer.vue             3D viewer wrapper
      ThreePanelViewer.vue        Three.js scene, GLB loading, camera movement
      RecentActivity.vue          Recent operation list
      StatusPanel.vue             Active operation panel
      UnitList.vue                Unit list component

    layout/
      Layout.vue                  App shell
      Header.vue                  Top header
      Sidebar.vue                 Main navigation

    modals/
      RegisterModal.vue           Operation registration dialog
      OperationModal.vue          Start/complete operation dialog
      HistoryModal.vue            History dialog
      SuccessModal.vue            Registration success dialog
      ModalShell.vue              Shared modal container

    ui/
      ActionButton.vue            Dashboard action buttons
      StatusBadge.vue             Shared status badge
      StatCard.vue                Shared stat card

  api/
    operations.ts                 Frontend API helper functions

  data/
    panels.ts                     Canonical 47-panel metadata
    operations.ts                 Initial operation data and reasons
    mockData.ts                   Demo lists for UI workflows
    keyBoxStatus.ts               Key status demo data

public/
  A.glb ... G.glb                 Panel model variants
  floor.glb                       3D floor model
  ceiling.glb                     3D ceiling model
  textures/                       HDR and texture assets
  koen_logo.png                   Sidebar logo

server.js                         Local API and Vite middleware server
panels-state.json                 Active panel persistence
```

## 6. Dashboard Workflow

### Register

The Register button opens `RegisterModal.vue`.

The operator selects:

- Department/team
- Operation reason
- Target unit by QR demo or search

On submit, the frontend calls:

```text
POST /api/operations
```

The server creates operation records and returns them to the dashboard.

### Start

The Start button opens `OperationModal.vue` in `start` mode.

On confirm:

1. The selected operation panel IDs are converted into active panel objects.
2. The frontend calls `POST /api/active-panels`.
3. The dashboard updates `sequencePanelIds`.
4. The 2D map and 3D scene highlight the target panels.
5. If one panel is selected, the 3D camera guidance sequence runs.

### Complete

The Complete button opens `OperationModal.vue` in `complete` mode.

On confirm:

1. The frontend calls `PATCH /api/operations/complete`.
2. The frontend calls `DELETE /api/active-panels`.
3. Highlighting is cleared.
4. The operation list refreshes.

### History

The History button opens `HistoryModal.vue`.

It displays API operation records when available and falls back to demo history data when no records are present.

## 7. API Reference

### `GET /api/operations`

Returns operation records.

Optional query:

```text
?status=<status>
```

Example response:

```json
{
  "operations": [
    {
      "id": 15,
      "panelId": 31,
      "unitId": "UNIT-12B",
      "panelName": "ASP-A",
      "equipName": "ASP-A",
      "opType": "KEY ALERT",
      "operator": "Operator",
      "department": "Electrical Team",
      "purpose": "Inspection",
      "status": "in-progress",
      "notes": "",
      "operatedAt": "2026-05-19T14:30:00"
    }
  ]
}
```

### `POST /api/operations`

Creates a new operation.

Request body:

```json
{
  "panelId": 31,
  "unitId": "UNIT-12B",
  "panelName": "ASP-A",
  "equipName": "ASP-A",
  "opType": "KEY CLOSED",
  "operator": "Operator",
  "department": "Electrical Team",
  "purpose": "Inspection",
  "notes": ""
}
```

Response:

```json
{
  "status": "success",
  "operation": {
    "id": 16,
    "panelId": 31,
    "unitId": "UNIT-12B",
    "panelName": "ASP-A",
    "equipName": "ASP-A",
    "opType": "KEY CLOSED",
    "operator": "Operator",
    "department": "Electrical Team",
    "purpose": "Inspection",
    "status": "in-progress",
    "notes": "",
    "operatedAt": "2026-05-28T10:20:30"
  }
}
```

### `PATCH /api/operations/complete`

Marks operations complete.

Request body:

```json
{
  "ids": [16, 17]
}
```

Response:

```json
{
  "status": "success",
  "completed": 2
}
```

### `GET /api/active-panels`

Returns currently highlighted panels.

Response:

```json
{
  "panels": [
    {
      "id": 31,
      "status": "ON",
      "description": "UNIT-12B"
    }
  ]
}
```

### `POST /api/active-panels`

Replaces the active panel list.

Request body:

```json
[
  {
    "id": 31,
    "status": "ON",
    "description": "UNIT-12B"
  }
]
```

### `DELETE /api/active-panels`

Clears all active panel highlights.

Response:

```json
{
  "status": "success",
  "panels": []
}
```

## 8. Data Model

### Operation

```ts
interface Operation {
  id: number
  panelId: number
  unitId: string
  equipName: string
  panelName?: string
  opType: 'KEY CLOSED' | 'KEY OPEN' | 'KEY ALERT'
  operator: string
  department: string
  purpose: string
  status: string
  notes: string
  operatedAt: string
}
```

### ActivePanel

```ts
interface ActivePanel {
  id: number
  status: string
  description: string
}
```

### Panel Metadata

Panel definitions are stored in:

```text
src/data/panels.ts
```

Each panel includes:

- Numeric panel ID
- GLB model key (`A` through `G`)
- Unit ID
- Display name
- System and group metadata
- UI status

The dashboard and 3D viewer both use this metadata to keep panel IDs consistent.

## 9. 3D Viewer Notes

The 3D viewer is implemented in:

```text
src/components/dashboard/ThreePanelViewer.vue
```

It uses:

- Three.js renderer
- `GLTFLoader` for GLB assets
- GSAP for camera movement
- Local panel placement logic matching the 47-panel layout

Loaded models:

```text
public/A.glb
public/B.glb
public/C.glb
public/D.glb
public/E.glb
public/F.glb
public/G.glb
public/floor.glb
public/ceiling.glb
```

If GLB loading fails, the viewer draws a fallback room with simple panel geometry. This prevents a blank 3D area during asset or path issues.

## 10. Hardware Integration Points

The most important endpoint for external hardware or middleware integration is:

```text
POST /api/active-panels
```

Example external trigger:

```json
[
  {
    "id": 42,
    "status": "ON",
    "description": "UNIT-12B"
  }
]
```

When this payload is posted, the dashboard polling loop detects the change and updates:

- Active panel banners
- 2D floor plan highlight
- 3D panel blinking
- Camera guidance sequence for a single selected panel

The dashboard polls:

```text
GET /api/active-panels
```

every second.

## 11. Troubleshooting

### Browser opens a white page

Check the browser console first.

Common causes:

- Running `npm run dev:vite` instead of `npm run dev`
- Old server process still running after code changes
- Browser cache serving an old module URL
- Static asset being served with the wrong MIME type

Recommended reset:

```bash
Ctrl+C
npm run dev
```

Then hard refresh the browser:

```text
Ctrl+Shift+R
```

### `Unexpected token '<'` from an API request

This means the frontend expected JSON but received HTML.

Use:

```bash
npm run dev
```

not:

```bash
npm run dev:vite
```

### `Expected a JavaScript module script but the server responded with image/png`

This means an image URL was requested as a JavaScript module.

The current server ignores `?import` requests in the static asset handler and lets Vite transform them correctly.

If this appears again:

1. Restart the dev server.
2. Hard refresh the browser.
3. Check for image paths in Vue templates using plain static `src="/file.png"` with custom middleware.

### Port is already in use

Stop the previous server terminal with `Ctrl+C`.

Default ports:

```text
App server: 8000
Vite HMR: 24678
```

### 3D area is blank

Check that these files exist:

```text
public/A.glb
public/B.glb
public/C.glb
public/D.glb
public/E.glb
public/F.glb
public/G.glb
public/floor.glb
public/ceiling.glb
```

The viewer has a fallback renderer, so a completely blank 3D area usually means the Vue app failed before the viewer mounted.

## 12. Development Notes

- Use `src/data/panels.ts` as the source of truth for panel metadata.
- Keep panel IDs stable. Hardware integration should send panel IDs, not display labels.
- Keep GLB files in `public/` so they are served from root URLs.
- Restart the server after editing `server.js`.
- Use `npm run build` before handoff to verify TypeScript and production bundling.
