<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
// Import the underlying ThreePanelViewer component
// Ensure the path matches your project structure
import ThreePanelViewer from './ThreePanelViewer.vue'

// Define interfaces for complex prop types
interface CameraPosition {
  x: number
  z: number
  rotation: number
}

interface AlertPanel {
  id: number
  status?: string
  description?: string
}

// Define props with TypeScript types and default values matching React
withDefaults(
  defineProps<{
    activePanelIds?: number[]
    alertPanels?: AlertPanel[]
    sequenceId?: number
    isOperationActive?: boolean
  }>(),
  {
    activePanelIds: () => [],
    alertPanels: () => [],
    sequenceId: 0,
    isOperationActive: false,
  }
)

// Define emits to handle callbacks/events
defineEmits<{
  (e: 'cameraUpdate', position: CameraPosition): void
  (e: 'sequenceDone'): void
}>()
</script>

<template>
  <!-- Main container preserving exact React Tailwind CSS styles and glow effects -->
  <div 
    class="relative h-full min-h-0 overflow-hidden rounded-xl border-2 border-sky-500/50 bg-slate-950 shadow-[0_0_0_1px_rgba(14,165,233,0.15),0_0_60px_rgba(14,165,233,0.18),inset_0_0_30px_rgba(14,165,233,0.04)]"
  >
    <!-- Child component with dynamic bindings and event listeners -->
    <ThreePanelViewer
      :active-panel-ids="activePanelIds"
      :sequence-id="sequenceId"
      :is-operation-active="isOperationActive"
      @camera-update="(pos) => $emit('cameraUpdate', pos)"
      @sequence-done="() => $emit('sequenceDone')"
    />

    <div 
      v-if="alertPanels.length > 0"
      class="pointer-events-none absolute left-4 top-4 z-20 flex w-[min(420px,calc(100%-32px))] flex-col gap-2"
    >
      <div
        v-for="panel in alertPanels"
        :key="panel.id"
        class="flex h-9 items-center gap-2 rounded-lg border border-red-400/50 bg-red-950/82 px-3 text-[11px] font-black text-red-50 shadow-[0_14px_32px_rgba(127,29,29,0.35)] backdrop-blur-md"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.22)]">
          <AlertTriangle class="h-3.5 w-3.5" />
        </span>
        <span class="min-w-0 truncate font-mono tracking-wide">
          {{ panel.description || `PANEL-${String(panel.id).padStart(2, '0')}` }}
        </span>
        <span class="ml-auto shrink-0 rounded-md border border-emerald-300/25 bg-emerald-400/15 px-2 py-0.5 text-[9px] font-black text-emerald-200">
          {{ panel.status || 'ON' }}
        </span>
      </div>
    </div>
  </div>
</template>
