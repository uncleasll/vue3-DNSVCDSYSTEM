<template>
  <div class="grid h-[calc(100vh-32px)] min-h-0 grid-cols-[minmax(320px,360px)_minmax(0,1fr)_200px] grid-rows-[82px_minmax(0,1fr)] gap-3 overflow-hidden">
    
    <div class="row-span-2 min-h-0">
      <FloorPlan :targetPanelIds="viewerPanelIds" />
    </div>
    
    <div class="col-span-2 min-w-0">
      <Header flush />
    </div>
    
    <main class="grid min-h-0 min-w-0 grid-rows-[minmax(180px,1fr)_238px] gap-3">
      <div v-if="activePanels.length > 0" class="pointer-events-none absolute left-[380px] right-[220px] top-[118px] z-20 flex flex-col gap-1">
        <div 
          v-for="panel in activePanels" 
          :key="panel.id" 
          class="flex max-w-xl items-center gap-2 rounded-md border border-red-800/60 bg-red-950/90 px-2.5 py-1 text-[11px] font-bold text-red-200 shadow-lg"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.25)]" />
          <span class="font-mono">{{ panel.description || String(panel.id).padStart(2, '0') }}</span>
          <span class="ml-auto rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] text-emerald-400">{{ panel.status || 'ON' }}</span>
        </div>
      </div>

      <ImageViewer
        :activePanelIds="viewerPanelIds"
        :sequenceId="sequenceId"
        :isOperationActive="isOperationActive"
        @sequenceDone="handleSequenceDone"
      />
      
      <div class="grid min-h-0 min-w-0 grid-cols-[230px_minmax(0,1fr)] gap-3">
        <section class="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-200 bg-slate-50 px-3 py-2">
            <h2 class="text-[11px] font-black uppercase tracking-widest text-slate-600">통신정보</h2>
          </div>
          <div class="grid gap-1.5 p-2.5">
            <div 
              v-for="stat in communicationStats" 
              :key="stat.label" 
              class="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5"
            >
              <div :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', stat.bg, stat.color]">
                <component :is="stat.icon" class="h-3.5 w-3.5" />
              </div>
              <span class="min-w-0 truncate text-[11px] font-bold text-slate-600">{{ stat.label }}</span>
              <span :class="['ml-auto text-xs font-black', stat.color]">{{ stat.value }}</span>
            </div>
          </div>
        </section>

        <div class="grid min-h-0 min-w-0 grid-cols-[minmax(190px,0.85fr)_minmax(220px,1.15fr)] gap-3">
          <section class="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <h2 class="text-[11px] font-black uppercase tracking-widest text-slate-600">시스템 상태</h2>
              <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-600">정상가동</span>
            </div>
            <div class="grid h-[calc(100%-37px)] items-center gap-3 p-3">
              <div class="space-y-2 text-xs font-bold">
                <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-slate-500">월간</span>
                  <span class="text-violet-600">{{ operations.length }}건</span>
                </div>
                <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-slate-500">진행중</span>
                  <span class="text-blue-600">{{ activeOperations.length }}건</span>
                </div>
                <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-slate-500">알람</span>
                  <span class="text-red-600">{{ alertCount }}건</span>
                </div>
              </div>
            </div>
          </section>

          <RecentActivity :operations="operations" @viewAll="modal = 'activity'" />
        </div>
      </div>
    </main>

    <aside class="grid min-h-0 min-w-0 grid-rows-[minmax(120px,1fr)_52px_52px_52px_52px] gap-2 overflow-hidden">
      <StatusPanel :operations="activeOperations" />
      <ActionButton :icon="PlusCircle" label="조작등록" variant="blue" @click="modal = 'register'" />
      <ActionButton :icon="Play" label="조작시작" variant="dark" @click="modal = 'start'" />
      <ActionButton :icon="CheckCircle" label="조작완료" variant="green" @click="modal = 'complete'" />
      <ActionButton :icon="HistoryIcon" label="이력조회" variant="orange" @click="modal = 'history'" />
    </aside>
  </div>

  <RegisterModal v-if="modal === 'register'" @close="modal = null" @submit="submitRegister" />
  <SuccessModal v-if="modal === 'success'" @close="modal = null" />
  <OperationModal v-if="modal === 'start'" mode="start" :operations="operations" @close="modal = null" @confirm="startOperations" />
  <OperationModal v-if="modal === 'complete'" mode="complete" :operations="operations" @close="modal = null" @confirm="finishOperations" />
  <HistoryModal v-if="modal === 'history'" :operations="operations" @close="modal = null" />
  <HistoryModal v-if="modal === 'activity'" :operations="operations" @close="modal = null" />
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted, onUnmounted } from 'vue'
import { Bell, CheckCircle, History as HistoryIcon, Play, PlusCircle, Radio, Server, ShieldCheck } from 'lucide-vue-next'

// API Network Core Hooks and Endpoint Interfaces
import { clearActivePanels, completeOperations, fetchOperations, setActivePanels } from '../api/operations'
import type { ActivePanel } from '../api/operations'

// Structural Interface Components Mapping
import FloorPlan from '../components/dashboard/FloorPlan.vue'
import ImageViewer from '../components/dashboard/ImageViewer.vue'
import RecentActivity from '../components/dashboard/RecentActivity.vue'
import StatusPanel from '../components/dashboard/StatusPanel.vue'
import Header from '../components/layout/Header.vue'

// Custom UI Form Elements
import ActionButton from '../components/ui/ActionButton.vue'

// Modular Overlays Dialog Registries 
import HistoryModal from '../components/modals/HistoryModal.vue'
import OperationModal from '../components/modals/OperationModal.vue'
import RegisterModal from '../components/modals/RegisterModal.vue'
import SuccessModal from '../components/modals/SuccessModal.vue'

// Static Mock Telemetry Initialization Assets
import { INITIAL_OPERATIONS } from '../data/operations'
import type { Operation } from '../types'

// Typing Constraints defining available layout dialog variants
type ModalType = 'register' | 'success' | 'start' | 'complete' | 'history' | 'activity' | null

// String match evaluator tracking Korean charset variance statuses from original React node
const isProgress = (status: string) => status === '진행중' || status === 'м§„н–‰м¤‘'

// Local Reactive Functional Memory Allocations
const modal = ref<ModalType>(null)
const operations = ref<Operation[]>(INITIAL_OPERATIONS)
const sequencePanelIds = ref<number[]>([])
const sequenceId = ref(0)
const activePanels = ref<ActivePanel[]>([])
const isOperationActive = ref(false)

// Tracking buffers preventing redundant view mutations on repetitive incoming network data frames
const lastActivePanelsSerialized = ref('[]')
let pollIntervalId: ReturnType<typeof setInterval> | null = null

// Re-computes and syncs centralized active process records with local memory state
const refreshOperations = async () => {
  try {
    const data = await fetchOperations()
    operations.value = data
  } catch (error) {
    console.error('Operation synchronization failed:', error)
  }
}

// Background Network Sync Daemon Cycle Poller matching original React implementation
const pollActivePanels = async () => {
  try {
    const response = await fetch('/api/active-panels')
    const data = await response.json()
    if (!Array.isArray(data.panels)) return
    
    const serialized = JSON.stringify(data.panels)
    if (serialized === lastActivePanelsSerialized.value) return
    
    lastActivePanelsSerialized.value = serialized
    activePanels.value = data.panels
    sequencePanelIds.value = data.panels.map((panel: ActivePanel) => panel.id)
    
    if (data.panels.length > 0) {
      sequenceId.value += 1
      isOperationActive.value = true
    }
  } catch {
    // API starting boundaries gracefully intercepted to bypass volatile UI updates
  }
}

// Core Component Lifecycle Hooks Handling Daemon Sequences
onMounted(async () => {
  await refreshOperations()
  void pollActivePanels()
  pollIntervalId = setInterval(pollActivePanels, 1000)
})

onUnmounted(() => {
  if (pollIntervalId !== null) {
    clearInterval(pollIntervalId)
  }
})

// Submission pipelines routing buffered updates cleanly
const submitRegister = async (_operations: Operation[]) => {
  await refreshOperations()
  modal.value = 'success'
}

// Dispatches panel configuration triggers payload matrix over interface endpoints
const startOperations = async (selectedOperations: Operation[]) => {
  const panelIds = selectedOperations.map((op) => op.panelId)
  const panels = selectedOperations.map((op) => ({
    id: op.panelId,
    status: 'ON',
    description: op.unitId,
  }))

  await setActivePanels(panels)
  lastActivePanelsSerialized.value = JSON.stringify(panels)
  sequencePanelIds.value = panelIds
  activePanels.value = panels
  sequenceId.value += 1
  isOperationActive.value = true
  await refreshOperations()
}

// Terminates active hardware signaling sequences clearing global processes
const finishOperations = async (selectedOperations: Operation[]) => {
  await completeOperations(selectedOperations.map((op) => op.id))
  await clearActivePanels()
  lastActivePanelsSerialized.value = '[]'
  sequencePanelIds.value = []
  activePanels.value = []
  await refreshOperations()
}

// Clears cached tracking segments cleanly upon visual loop sequence completion
const handleSequenceDone = () => {
  sequencePanelIds.value = []
  activePanels.value = []
  lastActivePanelsSerialized.value = '[]'
  void clearActivePanels()
}

// Computed Reactive Projection Filters
const activeOperations = computed(() => {
  return operations.value.filter((op) => isProgress(op.status))
})

const alertCount = computed(() => {
  const alertOperationsCount = operations.value.filter(
    (op) => op.opType === 'KEY ALERT' && isProgress(op.status)
  ).length
  return activePanels.value.length + alertOperationsCount
})

const viewerPanelIds = computed(() => sequencePanelIds.value)

// FIX: Ikonka obyektlari Vue Proxy kuzatuviga tushib resolveComponent xatosini bermasligi uchun ularga markRaw() to'liq va to'g'ri o'rnatildi
const communicationStats = computed(() => [
  { icon: markRaw(Radio), label: 'GENi 연동', value: 'ON', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: markRaw(ShieldCheck), label: '키보관함 연동', value: 'ON', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: markRaw(Bell), label: '알람', value: alertCount.value > 0 ? `${alertCount.value}건` : '없음', color: alertCount.value > 0 ? 'text-red-600' : 'text-emerald-600', bg: alertCount.value > 0 ? 'bg-red-50' : 'bg-emerald-50' },
  { icon: markRaw(Server), label: '패널', value: '47', color: 'text-blue-600', bg: 'bg-blue-50' },
])
</script>