<template>
  <section class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-2 border-sky-200 bg-white shadow-sm">
    
    <div class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-sky-50 px-2.5 py-2">
      <h2 class="flex items-center gap-1 text-[10px] font-black tracking-wider text-slate-600">
        <SquarePen class="h-3 w-3 text-blue-500" />
        조작 등록 내역
      </h2>
      <span class="rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-blue-600 shadow-sm ring-1 ring-slate-100">
        {{ displayCount }}건
      </span>
    </div>
    
    <div class="grid shrink-0 grid-cols-[minmax(0,1fr)_48px_36px_28px] items-center gap-1 border-b border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[8px] font-black tracking-wide text-slate-400">
      <span>기기번호</span>
      <span>키상태</span>
      <span class="text-center">작업상태</span>
      <span class="text-center">상세</span>
    </div>
    
    <div class="h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">
      <div 
        v-for="(operation, index) in computedItems" 
        :key="operation.id" 
        :class="[
          'grid min-h-[42px] grid-cols-[minmax(0,1fr)_48px_36px_28px] items-center gap-1 border-b border-slate-100 px-2.5 py-1.5 text-[9px] transition-colors hover:bg-blue-50/40',
          index % 2 === 1 ? 'bg-slate-50/55' : 'bg-white'
        ]"
      >
        <div class="min-w-0">
          <div class="truncate text-[9px] font-black leading-tight text-blue-700">
            {{ operation.unitId }}
          </div>
          <div class="mt-0.5 truncate text-[7px] font-bold leading-tight text-slate-500">
            {{ operation.panelName || operation.equipName }}
          </div>
        </div>

        <div class="flex min-w-0 justify-start overflow-hidden">
          <span :class="['inline-flex max-w-full items-center truncate rounded px-1 py-0.5 text-[7px] font-black leading-none', keyStatusClass(operation.opType)]">
            {{ shortKeyStatus(operation.opType) }}
          </span>
        </div>

        <div class="flex min-w-0 justify-center overflow-hidden">
          <span class="inline-flex max-w-full items-center truncate rounded bg-blue-100 px-1 py-0.5 text-[7px] font-black leading-none text-blue-600">
            {{ operation.status }}
          </span>
        </div>

        <button 
          type="button" 
          class="flex h-6 w-7 items-center justify-center rounded border border-blue-100 bg-blue-50 text-[7px] font-black text-blue-600 transition-colors hover:bg-blue-100"
        >
          상세
        </button>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SquarePen } from 'lucide-vue-next'
import type { Operation } from '../../types'

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
  return source
})

const displayCount = computed(() => {
  return props.operations.length > 0 ? props.operations.length : fallbackItems.length
})

const shortKeyStatus = (status: string) => {
  if (status === 'KEY CLOSED') return 'CLOSED'
  if (status === 'KEY ALERT') return 'ALERT'
  if (status === 'KEY OPEN') return 'OPEN'
  return status.replace('KEY ', '')
}

const keyStatusClass = (status: string) => {
  if (status === 'KEY ALERT') return 'bg-red-100 text-red-600'
  if (status === 'KEY OPEN') return 'bg-emerald-100 text-emerald-600'
  if (status === 'KEY CLOSED') return 'bg-blue-100 text-blue-600'
  return 'bg-slate-100 text-slate-600'
}
</script>
