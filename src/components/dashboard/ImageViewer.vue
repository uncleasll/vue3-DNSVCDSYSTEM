<script setup lang="ts">
// Import the underlying ThreePanelViewer component
// Ensure the path matches your project structure
import ThreePanelViewer from './ThreePanelViewer.vue'

// Define interfaces for complex prop types
interface CameraPosition {
  x: number
  z: number
  rotation: number
}

// Define props with TypeScript types and default values matching React
withDefaults(
  defineProps<{
    activePanelIds?: number[]
    sequenceId?: number
    isOperationActive?: boolean
  }>(),
  {
    activePanelIds: () => [],
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
  </div>
</template>