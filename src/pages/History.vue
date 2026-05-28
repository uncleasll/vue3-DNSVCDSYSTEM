<template>
  <Header section="이력 조회" class="pb-2 border-b border-slate-100" />
  
  <section class="flex h-[calc(100vh-120px)] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300">
    
    <div class="mb-5 flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
      
      <div class="relative">
        <select 
          v-model="status" 
          class="h-11 rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer appearance-none min-w-[140px]"
        >
          <option>전체 상태</option>
          <option>KEY_ALERT</option>
          <option>KEY_OPEN</option>
          <option>KEY_CLOSED</option>
        </select>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</span>
      </div>
      
      <input 
        v-model="date" 
        type="date" 
        class="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
      />
      
      <div class="relative min-w-[280px] flex-1">
        <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="query" 
          placeholder="UNIT ID, 설비명, 조작내용 검색..." 
          class="h-11 w-full rounded-lg border border-slate-200 pl-11 pr-4 text-sm placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>
      
      <button 
        type="button" 
        @click="reset" 
        class="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 active:scale-95 transition-all duration-200"
      >
        <FilterIcon class="h-4 w-4 text-slate-500" />
        <span>필터 초기화</span>
      </button>
      
      <button 
        type="button" 
        @click="exportCsv" 
        class="flex h-11 items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-6 text-sm font-bold text-white shadow-sm hover:shadow-emerald-100 hover:shadow-lg active:scale-95 transition-all duration-200"
      >
        <Download class="h-4 w-4" />
        <span>Excel 내보내기</span>
      </button>
    </div>

    <div class="mb-5 grid grid-cols-6 gap-4">
      <StatCard :icon="Users" label="전체" :value="String(rows.length)" sub="건" color="blue" class="hover:shadow-md transition-shadow" />
      <StatCard :icon="Bell" label="KEY ALERT" :value="String(rows.filter((row) => row.status === 'KEY_ALERT').length)" sub="건" color="red" class="hover:shadow-md transition-shadow border-l-4 border-l-red-500" />
      <StatCard :icon="Shield" label="KEY OPEN" :value="String(rows.filter((row) => row.status === 'KEY_OPEN').length)" sub="건" color="green" class="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500" />
      <StatCard :icon="Shield" label="KEY CLOSED" :value="String(rows.filter((row) => row.status === 'KEY_CLOSED').length)" sub="건" color="blue" class="hover:shadow-md transition-shadow border-l-4 border-l-blue-500" />
      <StatCard :icon="Bell" label="WARNING" value="0" sub="건" color="orange" class="hover:shadow-md transition-shadow opacity-60" />
      <StatCard :icon="CheckCircle" label="완료" :value="String(rows.filter((row) => row.workStatus.includes('완료') || row.workStatus.includes('м™')).length)" sub="건" color="green" class="hover:shadow-md transition-shadow" />
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_280px] gap-5 overflow-hidden">
      
      <div class="overflow-auto rounded-xl border border-slate-200 shadow-inner bg-slate-50/30">
        <table class="min-w-[1020px] w-full text-left text-sm border-collapse">
          <thead class="sticky top-0 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200 z-10 shadow-sm">
            <tr>
              <th v-for="head in tableHeaders" :key="head" class="px-6 py-4 font-bold">
                {{ head }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            <tr 
              v-for="(row, index) in rows" 
              :key="`${row.unitId}-${row.timestamp}-${index}`" 
              class="hover:bg-slate-50/80 transition-colors duration-150"
            >
              <td class="px-6 py-3.5 text-slate-500 font-mono text-xs">{{ row.timestamp }}</td>
              <td class="px-6 py-3.5"><span class="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">{{ row.unitId }}</span></td>
              <td class="px-6 py-3.5 font-semibold text-slate-800">{{ row.equipName }}</td>
              <td 
                class="px-6 py-3.5 font-bold"
                :class="{
                  'text-red-600 bg-red-50/30': row.status === 'KEY_ALERT',
                  'text-emerald-600 bg-emerald-50/30': row.status === 'KEY_OPEN',
                  'text-blue-600': row.status !== 'KEY_ALERT' && row.status !== 'KEY_OPEN'
                }"
              >
                {{ row.content }}
              </td>
              <td class="px-6 py-3.5 text-slate-600 font-medium">{{ row.operator }}</td>
              <td class="px-6 py-3.5"><StatusBadge :status="row.status" /></td>
              <td class="px-6 py-3.5"><StatusBadge :status="row.workStatus" /></td>
            </tr>
            <tr v-if="rows.length === 0">
              <td :colspan="tableHeaders.length" class="text-center py-12 text-slate-400 font-medium">
                검색 결과가 없습니다. 다른 조건으로 시도해 보세요.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="space-y-4 overflow-auto pr-1">
        <div class="rounded-xl border border-slate-200 p-5 bg-white shadow-sm">
          <h3 class="mb-4 text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>상세 필터
          </h3>
          <div class="space-y-3.5">
            <label 
              v-for="label in asideFilters" 
              :key="label" 
              class="block text-xs font-bold text-slate-500"
            >
              {{ label }}
              <div class="relative mt-1.5">
                <select class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer">
                  <option>전체 선택</option>
                </select>
                <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
              </div>
            </label>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 p-5 bg-white shadow-sm">
          <h3 class="mb-4 text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>기간 선택
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" @click="setRelativeDate(0)" class="rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95">오늘</button>
            <button type="button" @click="setRelativeDate(1)" class="rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95">어제</button>
            <button type="button" @click="date = '2026-05-19'" class="rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95">최근 7일</button>
            <button type="button" @click="date = '2026-05-01'" class="rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95">최근 30일</button>
            <button type="button" @click="date = '2026-03-01'" class="rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95">최근 3개월</button>
            <button type="button" @click="date = ''" class="rounded-lg border border-blue-200 py-2.5 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all active:scale-95 col-span-2">사용자 지정 (전체)</button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { 
  Bell, 
  CheckCircle, 
  Download, 
  Filter as FilterIcon, 
  Search, 
  Shield, 
  Users 
} from 'lucide-vue-next'

import Header from '../components/layout/Header.vue'
import StatCard from '../components/ui/StatCard.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import { MOCK_HISTORY } from '../data/mockData'

const tableHeaders = ['시간', 'UNIT ID', '설비명', '조작내용', '조작자', '키상태', '작업상태']
const asideFilters = ['UNIT', '설비 타입', '설비명', '조작내용', '작업 상태']

const status = ref('전체 상태')
const date = ref('')
const query = ref('')

const rows = computed(() => {
  return MOCK_HISTORY.concat(MOCK_HISTORY).filter((row) => {
    const term = query.value.trim().toLowerCase()
    const matchesText = !term || `${row.unitId} ${row.equipName} ${row.content} ${row.operator}`.toLowerCase().includes(term)
    const matchesStatus = status.value === '전체 상태' || row.status === status.value
    const matchesDate = !date.value || row.timestamp.startsWith(date.value)

    return matchesText && matchesStatus && matchesDate
  })
})

const reset = () => {
  status.value = '전체 상태'
  date.value = ''
  query.value = ''
}

const exportCsv = () => {
  const header = ['time', 'unitId', 'equipment', 'content', 'operator', 'keyStatus', 'workStatus']
  const body = rows.value.map((row) => [
    row.timestamp, row.unitId, row.equipName, row.content, row.operator, row.status, row.workStatus
  ].join(','))
  const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'koen-history.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const setRelativeDate = (days) => {
  const value = new Date()
  value.setDate(value.getDate() - days)
  date.value = value.toISOString().slice(0, 10)
}
</script>