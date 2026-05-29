<template>
  <Header section="ALARM & EVENT" :alarmCount="3" :showConnectionStatus="false" />

  <div class="grid h-[calc(100vh-104px)] min-h-0 grid-rows-[96px_56px_minmax(0,1fr)] gap-4 overflow-hidden">
    
    <div class="grid grid-cols-4 gap-4">
      <StatCard :icon="Bell" label="Active Alarm" value="3" sub="unresolved" color="red" />
      <StatCard :icon="AlertTriangle" label="Warning" value="2" sub="checking" color="orange" />
      <StatCard :icon="CheckCircle" label="Resolved" value="18" sub="today" color="green" />
      <StatCard :icon="Bell" label="Total Event" value="47" sub="24h" color="blue" />
    </div>

    <section class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="query" 
          class="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500" 
          placeholder="Search alarm, unit, equipment..." 
        />
      </div>
      
      <select v-model="severity" class="h-10 rounded-lg border border-slate-200 px-3 text-sm">
        <option>All severity</option>
        <option>KEY-ALERT</option>
        <option>WARNING</option>
        <option>ALARM</option>
      </select>

      <select v-model="status" class="h-10 rounded-lg border border-slate-200 px-3 text-sm">
        <option>All status</option>
        <option>Unresolved</option>
        <option>Checking</option>
        <option>Resolved</option>
      </select>

      <button 
        type="button" 
        @click="applyFilters" 
        class="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        <Filter class="h-4 w-4" />
        Apply
      </button>
    </section>

    <section class="grid min-h-0 grid-cols-[1fr_320px] gap-4 overflow-hidden">
      
      <div class="overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500 z-10">
            <tr>
              <th v-for="head in ['Time', 'Severity', 'Unit', 'Equipment', 'Area', 'Message', 'Status']" :key="head" class="px-5 py-4">
                {{ head }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(alarm, index) in rows" 
              :key="`${alarm.unitId}-${index}`" 
              class="border-t border-slate-100 hover:bg-blue-50/40"
            >
              <td class="px-5 py-4 font-mono text-xs">{{ alarm.time }}</td>
              <td :class="['px-5 py-4 font-black', alarm.level === 'WARNING' ? 'text-amber-500' : 'text-red-600']">
                {{ alarm.level }}
              </td>
              <td class="px-5 py-4 font-bold text-blue-600">{{ alarm.unitId }}</td>
              <td class="px-5 py-4">{{ alarm.equipment }}</td>
              <td class="px-5 py-4">{{ alarm.area }}</td>
              <td class="px-5 py-4">{{ alarm.message }}</td>
              <td class="px-5 py-4">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{{ alarm.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="space-y-4 overflow-hidden">
        
        <section class="rounded-lg border border-red-100 bg-red-50 p-5 text-red-700 shadow-sm">
          <h2 class="mb-3 flex items-center gap-2 font-black">
            <Bell class="h-5 w-5" />
            Priority Queue
          </h2>
          <button 
            v-for="alarm in priorityQueue" 
            :key="alarm.unitId" 
            @click="selectPriority(alarm.unitId)" 
            class="mb-3 w-full rounded-lg border border-red-100 bg-white p-3 text-left shadow-sm transition hover:scale-[1.01]"
          >
            <div class="font-black text-slate-950">{{ alarm.unitId }}</div>
            <div class="text-xs text-slate-500">{{ alarm.message }}</div>
          </button>
        </section>

        <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="mb-3 font-black">Response Checklist</h2>
          <label 
            v-for="(item, index) in checklistItems" 
            :key="item" 
            class="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer select-none"
          >
            <input type="checkbox" :checked="index < 2" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            {{ item }}
          </label>
        </section>

      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
// Ikonkalar lucide-vue-next dan olinadi
import { AlertTriangle, Bell, CheckCircle, Filter, Search } from 'lucide-vue-next'

// Vite import-analysis xatoligining oldini olish uchun komponentlar kengaytmasi bilan import qilinadi
import Header from '../components/layout/Header.vue'
import StatCard from '../components/ui/StatCard.vue'
import { demoAlarms } from '../data/demo'

// Komponent ichida Lucide ikonkalarni render qilish uchun ularni markRaw bilan saqlaymiz (unumdorlik uchun)
const AlertTriangleIcon = markRaw(AlertTriangle)
const BellIcon = markRaw(Bell)
const CheckCircleIcon = markRaw(CheckCircle)

// React state -> Vue ref o'zgaruvchilari
const query = ref('')
const severity = ref('All severity')
const status = ref('All status')

// Filtr tugmasi bosilganda qo'llanadigan holat (Applied Filters)
const applied = ref({
  query: '',
  severity: 'All severity',
  status: 'All status'
})

// O'zgarmas massivlar
const checklistItems = ['Operator notified', 'Key-box signal confirmed', 'Field team assigned', 'History logged']

// Kuchaytirilgan filtr mantiqi (ReactuseMemo muqobili)
const rows = computed(() => {
  // React-dagi demoAlarms.concat(demoAlarms, demoAlarms) mantiqi: ma'lumotni 3 barobar ko'paytiradi
  const baseData = [...demoAlarms, ...demoAlarms, ...demoAlarms]
  const term = applied.value.query.trim().toLowerCase()

  return baseData.filter((alarm) => {
    const matchesText = !term || `${alarm.level} ${alarm.unitId} ${alarm.equipment} ${alarm.area} ${alarm.message} ${alarm.status}`
      .toLowerCase()
      .includes(term)
      
    const matchesSeverity = applied.value.severity === 'All severity' || alarm.level === applied.value.severity
    const matchesStatus = applied.value.status === 'All status' || alarm.status === applied.value.status

    return matchesText && matchesSeverity && matchesStatus
  })
})

// Top 3 ta eng muhim avariya
const priorityQueue = computed(() => demoAlarms.slice(0, 3))

// Apply tugmasi bosilganda filtrlarni saqlash
const applyFilters = () => {
  applied.value = {
    query: query.value,
    severity: severity.value,
    status: status.value
  }
}

// Yon paneldagi avariyaga bosilganda jadvalni qidiruvga berish
const selectPriority = (unitId: string) => {
  query.value = unitId
  applied.value = {
    query: unitId,
    severity: 'All severity',
    status: 'All status'
  }
}
</script>
