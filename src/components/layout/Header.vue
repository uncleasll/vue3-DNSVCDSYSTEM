<template>
  <header :class="[flush ? 'h-full' : 'mb-3', 'grid grid-cols-[minmax(320px,1fr)_132px_164px_auto] items-stretch gap-3']">
    
    <div class="flex min-w-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm">
      <div class="text-[10px] font-black uppercase tracking-wide text-blue-600">YEONGDONG POWER PLANT UNIT 1</div>
      <div class="mt-1 flex min-w-0 items-center justify-center gap-3">
        <h1 class="truncate text-base font-black text-slate-950">{{ section ?? title }}</h1>
        <span class="shrink-0 rounded-full border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold lowercase text-emerald-600">normal</span>
      </div>
    </div>

    <div v-if="alarmCount !== undefined" class="flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 shadow-sm animate-pulse">
      <Bell class="h-5 w-5" /> 
      ALARM {{ alarmCount }}
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

    <div class="flex flex-col justify-center gap-1 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
      <div class="flex items-center justify-between gap-2 text-[11px] font-bold">
        <span class="flex items-center gap-1.5"><Zap class="h-3.5 w-3.5 text-blue-600" />GEN 연동</span>
        <span class="text-emerald-600">ON</span>
      </div>
      <div class="flex items-center justify-between gap-2 text-[11px] font-bold">
        <span class="flex items-center gap-1.5"><Bell class="h-3.5 w-3.5 text-blue-600" />기본전환 연동</span>
        <span class="text-emerald-600">ON</span>
      </div>
    </div>

    <button 
      type="button" 
      @click="emit('register')" 
      class="h-full min-w-36 rounded-lg bg-blue-600 px-8 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
    >
      조작등록
    </button>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { Bell, Calendar, Clock, Zap } from 'lucide-vue-next'

// Micro-compiler configuration setting defaults directly onto properties definitions
const props = withDefaults(
  defineProps<{
    title?: string
    section?: string
    alarmCount?: number
    flush?: boolean
  }>(),
  {
    title: '영동 1호기 고압차단기 위치안내시스템',
    flush: false
  }
)

// Macro configuration emitting context event hooks
const emit = defineEmits<{
  (e: 'register'): void
}>()

// React state variables replacement layers
const time = ref('13:30:59')
const dateStr = ref('2026.05.28')

let timer: ReturnType<typeof setInterval> | undefined

// Check if the parent template is listening to the '@register' action
const instance = getCurrentInstance()
const hasRegisterListener = instance?.vnode.props && (instance.vnode.props['onRegister'] || instance.vnode.props['on-register'])

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

onMounted(() => {
  updateDateTime() // Executed instantly to prevent display layout jumps on hydration
  timer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>