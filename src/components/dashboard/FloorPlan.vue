<script setup lang="ts">
import { computed } from 'vue'
import { PANEL_DATA } from '../../data/panels'

type CameraPosition = { x: number; z: number; rotation: number }

const props = withDefaults(
  defineProps<{
    targetPanelIds?: number[]
    cameraPosition?: CameraPosition
  }>(),
  {
    targetPanelIds: () => [],
    cameraPosition: () => ({ x: -6, z: 0, rotation: 0 }),
  }
)

type PanelCabinet = { id: string; upperId: number; lowerId: number; position: [number, number, number] }

function buildCabinets(): PanelCabinet[] {
  const items: PanelCabinet[] = []
  const rowZ: [number, number] = [-4.9, 4.9]
  const startX = 11
  for (let col = 0; col < 12; col += 1) items.push({ id: `right-${col}`, upperId: col * 2 + 1, lowerId: col * 2 + 2, position: [startX + col * 2, 2.5, rowZ[1]] })
  for (let col = 0; col < 12; col += 1) {
    if (col === 0) items.push({ id: 'left-0', upperId: 47, lowerId: 47, position: [startX, 2.5, rowZ[0]] })
    else {
      const upperId = 47 - col * 2
      items.push({ id: `left-${col}`, upperId, lowerId: upperId + 1, position: [startX + col * 2, 2.5, rowZ[0]] })
    }
  }
  return items
}

const cabinets = buildCabinets()
const width = 3400
const height = 7000
const normalScale = 270
const panelWidth = 1120
const panelHeight = 480
const selected = computed(() => new Set(props.targetPanelIds))
const mapX2D = (z: number) => 1700 + z * 195
const mapY2D = (x: number) => x >= 11 ? 260 + (35 - x) * normalScale : 260 + (35 - 11) * normalScale + (11 - x) * 25
const cameraLineX = mapX2D(0)
const mapCameraY2D = (x: number) => x >= 11 ? mapY2D(x) : height - 220
const cameraMarker = computed(() => ({
  x: cameraLineX,
  y: Math.min(height - 220, Math.max(220, mapCameraY2D(props.cameraPosition.x))),
}))
const info = (id: number) => PANEL_DATA.find((panel) => panel.id === id)
</script>

<template>
  <section class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
    <div class="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <svg :viewBox="`0 0 ${width} ${height}`" class="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="floor-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="1" />
            <circle cx="50" cy="50" r="1.5" fill="rgba(37,99,235,0.16)" />
          </pattern>
          <radialGradient id="camera-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ef4444" stop-opacity="0.28" /><stop offset="100%" stop-color="#ef4444" stop-opacity="0" /></radialGradient>
          <linearGradient id="floor-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" /><stop offset="100%" stop-color="#eff6ff" /></linearGradient>
          <linearGradient id="floor-selected" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#dbeafe" /><stop offset="100%" stop-color="#bfdbfe" /></linearGradient>
          <filter id="floor-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#floor-grid)" />
        <g :transform="`translate(${cameraMarker.x}, ${cameraMarker.y})`" class="pointer-events-none">
          <circle r="120" fill="url(#camera-glow)" />
          <circle r="60" fill="#ef4444" fill-opacity="0.25" />
          <circle r="30" fill="#ef4444" stroke="#ffffff" stroke-width="10" class="animate-pulse" />
        </g>
        <g v-for="cabinet in cabinets" :key="cabinet.id">
          <rect v-if="selected.has(cabinet.upperId) || selected.has(cabinet.lowerId)" :x="mapX2D(cabinet.position[2]) - panelWidth / 2 - 12" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 - 12" :width="panelWidth + 24" :height="panelHeight + 24" fill="none" stroke="#2563eb" stroke-width="6" rx="8" filter="url(#floor-glow)" class="animate-pulse" />
          <rect :x="mapX2D(cabinet.position[2]) - panelWidth / 2" :y="mapY2D(cabinet.position[0]) - panelHeight / 2" :width="panelWidth" :height="panelHeight" :fill="selected.has(cabinet.upperId) || selected.has(cabinet.lowerId) ? 'url(#floor-selected)' : 'url(#floor-panel)'" :stroke="selected.has(cabinet.upperId) || selected.has(cabinet.lowerId) ? '#2563eb' : '#cbd5e1'" :stroke-width="selected.has(cabinet.upperId) || selected.has(cabinet.lowerId) ? '4' : '3'" rx="6" />
          <rect :x="mapX2D(cabinet.position[2]) - panelWidth / 2 + 2" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 + 2" :width="panelWidth - 4" :height="panelHeight * 0.15" fill="rgba(37,99,235,0.08)" rx="4" />
          <text :x="mapX2D(cabinet.position[2]) - panelWidth / 2 + 34" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 + 94" font-size="108" font-weight="800" :fill="selected.has(cabinet.upperId) ? '#1d4ed8' : '#2563eb'" text-anchor="start" alignment-baseline="middle">{{ String(cabinet.upperId).padStart(2, '0') }}</text>
          <text :x="mapX2D(cabinet.position[2]) - panelWidth / 2 + 214" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 + 94" font-size="98" font-weight="800" :fill="selected.has(cabinet.upperId) ? '#0f172a' : '#1e293b'" text-anchor="start" alignment-baseline="middle">{{ info(cabinet.upperId)?.unitId ?? '' }}</text>
          <text :x="mapX2D(cabinet.position[2]) - panelWidth / 2 + 34" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 + 180" font-size="68" font-weight="700" :fill="selected.has(cabinet.upperId) ? '#1d4ed8' : '#64748b'" text-anchor="start" alignment-baseline="middle">{{ (info(cabinet.upperId)?.name ?? '').slice(0, 25) }}</text>
          <g v-if="cabinet.upperId !== cabinet.lowerId">
            <text :x="mapX2D(cabinet.position[2]) - panelWidth / 2 + 34" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 + 278" font-size="108" font-weight="800" :fill="selected.has(cabinet.lowerId) ? '#1d4ed8' : '#2563eb'" text-anchor="start" alignment-baseline="middle">{{ String(cabinet.lowerId).padStart(2, '0') }}</text>
            <text :x="mapX2D(cabinet.position[2]) - panelWidth / 2 + 214" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 + 278" font-size="98" font-weight="800" :fill="selected.has(cabinet.lowerId) ? '#0f172a' : '#1e293b'" text-anchor="start" alignment-baseline="middle">{{ info(cabinet.lowerId)?.unitId ?? '' }}</text>
            <text :x="mapX2D(cabinet.position[2]) - panelWidth / 2 + 34" :y="mapY2D(cabinet.position[0]) - panelHeight / 2 + 364" font-size="68" font-weight="700" :fill="selected.has(cabinet.lowerId) ? '#1d4ed8' : '#64748b'" text-anchor="start" alignment-baseline="middle">{{ (info(cabinet.lowerId)?.name ?? '').slice(0, 25) }}</text>
          </g>
        </g>
      </svg>
    </div>
  </section>
</template>
