<template>
  <header :class="[flush ? 'h-full' : 'mb-3', 'grid grid-cols-[clamp(170px,9vw,340px)_minmax(320px,1fr)_clamp(360px,18.5vw,680px)_clamp(180px,9.5vw,360px)] items-stretch gap-3']">
    <div class="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
      <img src="/koen_logo.png" alt="KOEN" class="max-h-[70%] w-full object-contain" />
    </div>

    <div class="flex min-w-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm">
      <div class="text-[15px] font-black uppercase tracking-wide text-blue-600">YEONGDONG POWER PLANT UNIT 1</div>
      <div class="mt-1 flex min-w-0 items-center justify-center gap-3">
        <h1 class="truncate text-base font-black text-slate-950">{{ title }}</h1>
        <span class="shrink-0 rounded-full border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold lowercase text-emerald-600">normal</span>
      </div>
      <div v-if="section" class="mt-1 text-[11px] font-black uppercase tracking-wide text-slate-500">{{ section }}</div>
    </div>

    <div v-if="showConnectionStatus" class="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div class="grid h-full grid-cols-[repeat(3,max-content)] content-center justify-center gap-x-3 gap-y-1">
        <div
          v-for="item in connectionIndicators"
          :key="item.key"
          class="flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-50 px-2.5 text-[10px] font-black uppercase leading-none text-slate-700 ring-1 ring-slate-200"
          :title="item.message"
        >
          <span :class="['h-2 w-2 shrink-0 rounded-full shadow-sm', item.ok ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200']"></span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col justify-center rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
      <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Clock class="h-4 w-4 text-blue-600" />
        {{ time }}
      </div>
      <div class="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
        <Calendar class="h-3.5 w-3.5 text-blue-600" />
        {{ dateStr }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Calendar, Clock } from 'lucide-vue-next'

// Micro-compiler configuration setting defaults directly onto properties definitions
const props = withDefaults(
  defineProps<{
    title?: string
    section?: string
    alarmCount?: number
    flush?: boolean
    showConnectionStatus?: boolean
  }>(),
  {
    title: '영동 1호기 고압차단기 위치안내시스템',
    flush: false,
    showConnectionStatus: true
  }
)

// React state variables replacement layers
const time = ref('13:30:59')
const dateStr = ref('2026.05.28')
type ConnectionStatusKey = 'geni' | 'server' | 'keyCabinet' | 'signBoard' | 'led'
type ConnectionStatus = Record<ConnectionStatusKey, { ok: boolean; message: string }>

const connectionStatus = ref<ConnectionStatus>({
  geni: { ok: true, message: 'GENi connected' },
  server: { ok: true, message: 'Local DB connected' },
  keyCabinet: { ok: true, message: 'Key cabinet connected' },
  signBoard: { ok: true, message: 'Sign board connected' },
  led: { ok: true, message: 'LED connected' },
})

let timer: ReturnType<typeof setInterval> | undefined
let connectionTimer: ReturnType<typeof setInterval> | undefined

// Internal formatting scheduler pipe
const updateDateTime = () => {
  const now = new Date()
  
  // Format current live system clock ticks
  time.value = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now)

  // Format real-time synchronized date context strings
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  dateStr.value = `${year}.${month}.${day}`
}

const connectionIndicators = computed(() => [
  { key: 'geni', label: 'GENi', ...connectionStatus.value.geni },
  { key: 'server', label: 'SERVER', ...connectionStatus.value.server },
  { key: 'keyCabinet', label: 'KEY CABINET', ...connectionStatus.value.keyCabinet },
  { key: 'signBoard', label: 'SIGN BOARD', ...connectionStatus.value.signBoard },
  { key: 'led', label: 'LED', ...connectionStatus.value.led },
])

const fetchConnectionStatus = async () => {
  try {
    const response = await fetch('/api/connection-status')
    if (!response.ok) throw new Error('Connection status endpoint failed')
    const data = await response.json()
    connectionStatus.value = {
      ...connectionStatus.value,
      ...data.status,
    }
  } catch {
    connectionStatus.value = {
      geni: { ok: false, message: 'GENi status unavailable' },
      server: { ok: false, message: 'Local DB status unavailable' },
      keyCabinet: { ok: false, message: 'Key cabinet status unavailable' },
      signBoard: { ok: false, message: 'Sign board status unavailable' },
      led: { ok: false, message: 'LED status unavailable' },
    }
  }
}

onMounted(() => {
  updateDateTime() // Executed instantly to prevent display layout jumps on hydration
  timer = setInterval(updateDateTime, 1000)
  void fetchConnectionStatus()
  connectionTimer = setInterval(fetchConnectionStatus, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (connectionTimer) clearInterval(connectionTimer)
})
</script>
