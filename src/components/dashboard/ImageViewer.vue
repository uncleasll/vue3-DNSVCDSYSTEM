<script setup lang="ts">
import { computed } from 'vue'
import { PANEL_DATA } from '../../data/panels'

const props = withDefaults(defineProps<{ activePanelIds?: number[]; sequenceId?: number; isOperationActive?: boolean }>(), {
  activePanelIds: () => [],
  sequenceId: 0,
  isOperationActive: false,
})

const active = computed(() => new Set(props.activePanelIds))
const rows = computed(() => {
  const top = PANEL_DATA.slice(0, 24)
  const bottom = PANEL_DATA.slice(24, 47).reverse()
  return [top, bottom]
})
</script>

<template>
  <div class="relative h-full min-h-0 overflow-hidden rounded-xl border-2 border-sky-500/50 bg-slate-950 shadow-[0_0_0_1px_rgba(14,165,233,0.15),0_0_60px_rgba(14,165,233,0.18),inset_0_0_30px_rgba(14,165,233,0.04)]">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.18),transparent_42%),linear-gradient(180deg,#020617,#0f172a)]" />
    <div class="absolute inset-x-8 top-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-sky-200/70">
      <span>3D PANEL VIEW</span>
      <span>{{ isOperationActive ? 'OPERATION ACTIVE' : 'STANDBY' }}</span>
    </div>
    <div class="absolute inset-10 top-14 flex flex-col justify-center gap-7 perspective-[1200px]">
      <div v-for="(row, rowIndex) in rows" :key="rowIndex" :class="['grid grid-cols-12 gap-1.5', rowIndex === 0 ? 'rotate-x-[56deg]' : '-rotate-x-[56deg]']">
        <div v-for="panel in row" :key="panel.id" :class="['relative min-h-20 rounded border p-1.5 shadow-lg transition', active.has(panel.id) ? 'border-red-400 bg-red-500/25 shadow-red-500/40 animate-pulse' : 'border-sky-300/30 bg-slate-800/90 shadow-sky-900/20']">
          <div class="absolute inset-x-1 top-1 h-5 rounded bg-slate-300/90" />
          <div class="relative mt-7 truncate text-center text-[10px] font-black text-white">{{ panel.unitId }}</div>
          <div class="relative mt-1 truncate text-center text-[8px] font-bold text-slate-300">{{ panel.name }}</div>
          <div class="absolute bottom-1 left-1 rounded bg-slate-950/80 px-1 text-[8px] font-black text-sky-300">{{ String(panel.id).padStart(2, '0') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
