# DNSVCDSYSTEM — Project Documentation

## Overview

DNSVCDSYSTEM is a KOEN electrical panel monitoring and operation management interface. Workers use it to view breaker panel status, track active operations, and identify target panels in the switchgear layout.

## Project Structure

```text
src/
├── main.ts                     # Vue application entry
├── App.vue                     # root router outlet
├── router.ts                   # Vue Router setup
├── pages/
│   ├── Dashboard.vue           # main operation dashboard
│   ├── UnitOverview.vue        # unit and panel overview
│   ├── Equipment.vue           # equipment table
│   ├── AlarmEvent.vue          # alarm and event list
│   ├── History.vue             # operation history
│   ├── Reports.vue             # reports page
│   └── Settings.vue            # integration settings
├── components/
│   ├── dashboard/
│   │   ├── FloorPlan.vue       # 2D SVG panel map
│   │   ├── ImageViewer.vue     # panel visualization area
│   │   ├── StatusPanel.vue     # active operation list
│   │   └── RecentActivity.vue  # recent activity feed
│   ├── layout/
│   │   ├── Header.vue
│   │   ├── Sidebar.vue
│   │   └── Layout.vue
│   └── ui/
│       ├── ActionButton.vue
│       └── StatusBadge.vue
├── api/
│   └── operations.ts           # API helper functions
├── data/
│   ├── panels.ts               # 47 panel definitions
│   ├── mockData.ts             # demo UI data
│   ├── operations.ts           # initial operations and helpers
│   └── keyBoxStatus.ts         # key box status data
└── types/
    └── index.ts                # shared TypeScript types
```

## Tech Stack

- Vue 3 with Composition API
- Vue Router 4
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide Vue icons
- Express server with JSON file persistence
- Three.js assets stored under `public/`

## Runtime Flow

1. `server.js` starts the local API server and Vite middleware.
2. `src/main.ts` creates the Vue app and installs the router.
3. `src/router.ts` renders `Layout.vue` and nested pages.
4. `Dashboard.vue` owns operation state, polling, active panel state, and dashboard actions.
5. Components under `src/components/dashboard/` render the floor plan, panel visualization, status list, and recent activity.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/operations` | Returns all operations. Supports optional `?status=진행중`. |
| POST | `/api/operations` | Creates a new operation. |
| PATCH | `/api/operations/complete` | Marks operations as complete with `{ ids: number[] }`. |
| GET | `/api/active-panels` | Returns active panels as `{ panels: ActivePanel[] }`. |
| POST | `/api/active-panels` | Replaces active panels. |
| DELETE | `/api/active-panels` | Clears active panels. |

## Shared Types

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

interface ActivePanel {
  id: number
  status: string
  description: string
}
```

## Dashboard State

`Dashboard.vue` keeps the following state with Vue refs and computed values:

- `modal` — currently open modal name or `null`
- `operations` — operation list from the API
- `sequencePanelIds` — panel IDs highlighted in the visual layout
- `activePanels` — active panel objects from `/api/active-panels`
- `isOperationActive` — whether operation highlighting is active
- `activeOperations` — computed list of in-progress operations
- `alertCount` — computed alarm count

## Polling

The dashboard polls `/api/active-panels` every second. If the serialized panel payload changes, the UI updates the active panel list and panel highlights.

## Build

```bash
npm run build
```

The build runs TypeScript project checks and Vite production bundling.
