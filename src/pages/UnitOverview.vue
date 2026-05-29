<template>
  <Header section="UNIT OVERVIEW" :alarmCount="3" :showConnectionStatus="false" />
  
  <div class="flex h-[calc(100vh-104px)] min-h-0 flex-col gap-4 overflow-hidden">
    
    <div class="grid grid-cols-4 gap-4">
      <section class="flex h-24 items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Boxes class="h-8 w-8 text-blue-600" />
        <div>
          <div class="text-sm font-semibold">UNITS</div>
          <div class="text-3xl font-black leading-none">{{ PANEL_DATA.length }}</div>
        </div>
      </section>

      <section class="flex h-24 items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <CheckCircle class="h-8 w-8 text-emerald-500" />
        <div>
          <div class="text-sm font-semibold">정상</div>
          <div class="text-3xl font-black leading-none">{{ distribution[0].value }}</div>
          <div class="mt-1 text-xs font-bold text-emerald-500">
            {{ ((distribution[0].value / PANEL_DATA.length) * 100).toFixed(1) }}%
          </div>
        </div>
      </section>

      <section class="flex h-24 items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Bell class="h-8 w-8 text-red-500" />
        <div>
          <div class="text-sm font-semibold">경보</div>
          <div class="text-3xl font-black leading-none">{{ distribution[1].value + distribution[2].value }}</div>
          <div class="mt-1 text-xs font-bold text-red-500">
            {{ (((distribution[1].value + distribution[2].value) / PANEL_DATA.length) * 100).toFixed(1) }}%
          </div>
        </div>
      </section>

      <section class="flex h-24 items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <PlugZap class="h-8 w-8 text-amber-500" />
        <div>
          <div class="text-sm font-semibold">오늘 작업</div>
          <div class="text-3xl font-black leading-none">7</div>
        </div>
      </section>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-[minmax(520px,1fr)_280px] gap-4 overflow-hidden">
      
      <main class="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-black">UNIT 상태 목록</h2>
        
        <div class="max-h-[calc(100%-76px)] overflow-auto rounded-lg">
          <table class="min-w-[720px] w-full text-left text-xs">
            <thead class="sticky top-0 bg-blue-50 text-slate-700">
              <tr>
                <th v-for="head in ['UNIT ID', '구역', '상태', '작업상태', '통신 상태']" :key="head" class="px-3 py-2">
                  {{ head }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in rows" :key="`${row.unitId}-${index}`" class="border-t border-slate-100">
                <td class="px-3 py-2 font-bold">{{ row.unitId }}</td>
                <td class="px-3 py-2">{{ row.area }}</td>
                <td class="px-3 py-2 font-black" :class="row.status === 'KEY-ALERT' ? 'text-red-600' : row.status === 'WARNING' ? 'text-amber-500' : 'text-sky-600'">
                  {{ row.status }}
                </td>
                <td class="px-3 py-2 font-bold text-blue-600">
                  {{ operationStatuses[(page - 1 + index) % operationStatuses.length] }}
                </td>
                <td class="px-3 py-2">
                  <span class="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {{ row.communication }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-3 flex items-center gap-2 text-xs">
          <button 
            v-for="item in Math.min(4, maxPage)" 
            :key="item" 
            type="button" 
            @click="page = item" 
            class="h-8 w-8 rounded-md border"
            :class="item === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'"
          >
            {{ item }}
          </button>
          
          <button 
            type="button" 
            @click="page = Math.min(maxPage, page + 1)" 
            class="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200"
          >
            <ChevronsRight class="h-4 w-4" />
          </button>
          
          <span class="ml-auto text-slate-600">총 {{ unitRows.length }}개 표시</span>
        </div>
      </main>

      <aside class="min-h-0 overflow-hidden">
        <section class="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-black">최근 알람</h2>
            <button 
              type="button" 
              @click="showAllAlarms = !showAllAlarms" 
              class="text-sm font-bold text-blue-600"
            >
              {{ showAllAlarms ? 'show less' : 'view all →' }}
            </button>
          </div>
          
          <div class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <div 
              v-for="(alarm, index) in computedAlarms" 
              :key="`${alarm.unitId}-${index}`" 
              class="grid grid-cols-[68px_58px_1fr_46px] gap-2 text-[11px]"
            >
              <b :class="alarm.level === 'WARNING' ? 'text-amber-500' : 'text-red-600'">{{ alarm.level }}</b>
              <span>{{ alarm.unitId }}</span>
              <span class="truncate text-slate-600">{{ alarm.equipment }}</span>
              <span class="text-right text-slate-500">{{ alarm.time }}</span>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell, Boxes, CheckCircle, ChevronsRight, PlugZap } from 'lucide-vue-next'

import Header from '../components/layout/Header.vue'
import { demoAlarms, unitRows } from '../data/demo'
import { PANEL_DATA } from '../data/panels'

// Quantitative Distribution Math Pre-computation Mapping
const distribution = [
  { name: '정상', value: PANEL_DATA.filter((panel) => panel.status === 'normal').length },
  { name: '경고', value: PANEL_DATA.filter((panel) => panel.status === 'warning').length },
  { name: '알람', value: PANEL_DATA.filter((panel) => panel.status === 'alert').length },
]

// Constant Operational Status Definitions Block
const operationStatuses = ['조작등록', '조작시작', '조작완료'] as const

// Pagination Tracking Engine State Core Variables
const page = ref(1)
const showAllAlarms = ref(false)
const pageSize = 12

// Computations driving reactive view pagination loops
const maxPage = computed(() => Math.max(1, Math.ceil(unitRows.length / pageSize)))
const rows = computed(() => unitRows.slice((page.value - 1) * pageSize, page.value * pageSize))

// Alarm stack evaluation pipeline
const computedAlarms = computed(() => {
  return showAllAlarms.value ? demoAlarms.concat(demoAlarms) : demoAlarms.slice(0, 5)
})
</script>
