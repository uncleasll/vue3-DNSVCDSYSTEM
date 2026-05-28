<template>
  <section class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-2 border-sky-200 bg-white shadow-sm">
    
    <div class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-sky-50 px-3 py-2">
      <h2 class="text-[11px] font-black uppercase tracking-widest text-slate-600">
        조작 등록 내역
      </h2>
      <span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-blue-600 shadow-sm">
        {{ displayCount }}건
      </span>
    </div>
    
    <div class="grid shrink-0 grid-cols-[1fr_auto] border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
      <span>기기번호 / 키상태</span>
      <span>상세</span>
    </div>
    
    <div class="h-0 flex-1 space-y-2 overflow-y-auto p-2">
      <div 
        v-for="(operation, index) in computedItems" 
        :key="operation.id" 
        :class="[
          'rounded-lg border border-slate-100 px-2.5 py-2 text-[10px] shadow-sm transition-colors',
          index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
        ]"
      >
        <div class="mb-2 flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate font-black text-blue-700">
              {{ operation.unitId }}
            </div>
            <div class="truncate text-[9px] font-semibold text-slate-500">
              {{ operation.panelName || operation.equipName }}
            </div>
          </div>
          <button 
            type="button" 
            class="shrink-0 rounded-md border border-blue-100 bg-blue-50 px-1.5 py-1 text-[9px] font-black text-blue-600 hover:bg-blue-100 transition-colors"
          >
            상세
          </button>
        </div>
        
        <div class="flex flex-wrap items-center gap-1.5">
          <StatusBadge :status="operation.opType" :blink="operation.opType === 'KEY ALERT'" />
          <StatusBadge :status="operation.status" />
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Operation } from '../../types'
import StatusBadge from '../ui/StatusBadge.vue'

// Props definitions targeting component attributes configuration
const props = withDefaults(
  defineProps<{
    operations?: Operation[]
  }>(),
  {
    operations: () => []
  }
)

// Static Fallback Fallback Dataset Engine Array
const fallbackItems: Operation[] = [
  { id: 0, panelId: 42, unitId: 'UNIT-12B', equipName: 'ASP-A', panelName: 'ASP-A', opType: 'KEY ALERT', operator: '-', department: '-', purpose: '-', status: '진행중', notes: '', operatedAt: '2026-05-19T14:30:00' },
  { id: -1, panelId: 26, unitId: 'COM-20B', equipName: 'START-UP TR INCOMING', panelName: 'START-UP TR INCOMING', opType: 'KEY OPEN', operator: '-', department: '-', purpose: '-', status: '진행중', notes: '', operatedAt: '2026-05-19T13:00:00' },
  { id: -2, panelId: 12, unitId: 'UNIT-07B', equipName: 'STAGE 2 HAMMER MILL', panelName: 'STAGE 2 HAMMER MILL', opType: 'KEY CLOSED', operator: '-', department: '-', purpose: '-', status: '완료', notes: '', operatedAt: '2026-05-19T11:00:00' },
  { id: -3, panelId: 88, unitId: 'UNIT-05A', equipName: 'COOLING FAN #1', panelName: 'COOLING FAN #1', opType: 'KEY OPEN', operator: '-', department: '-', purpose: '-', status: '대기중', notes: '', operatedAt: '2026-05-19T10:15:00' },
  { id: -4, panelId: 14, unitId: 'SYS-MAIN', equipName: 'MAIN FEEDER SUB', panelName: 'MAIN FEEDER SUB', opType: 'KEY ALERT', operator: '-', department: '-', purpose: '-', status: '진행중', notes: '', operatedAt: '2026-05-19T09:45:00' },
]

// Computed Data Processors for safety constraints checks (Replaces component body recalculations)
const computedItems = computed(() => {
  const source = props.operations.length > 0 ? props.operations : fallbackItems
  return source.slice(0, 8)
})

const displayCount = computed(() => {
  return props.operations.length > 0 ? props.operations.length : fallbackItems.length
})
</script>