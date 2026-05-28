<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { Info, QrCode, Search, X } from 'lucide-vue-next'
import { MOCK_TEAMS, MOCK_UNITS } from '../../data/mockData'
import { registerOperation } from '../../api/operations'
import { MOCK_REASONS } from '../../data/operations'
import type { Operation } from '../../types'
import ModalShell from './ModalShell.vue'

// Props & Emits (React callback'lari muqobili)
const props = defineProps<{
  // onClose o'rniga emit('close') ishlatiladi
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', operations: Operation[]): void
}>()

// Statik ma'lumotlar
const demoQrCells = [
  [1, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 1, 1, 0, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 0, 1, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 1, 0, 1, 0],
  [1, 1, 1, 1, 0, 1, 1, 0, 1],
]

// Reaktiv holatlar (State)
const query = ref('')
const department = ref(MOCK_TEAMS[0])
const reason = ref(MOCK_REASONS[0])
const selectedUnitIds = ref<string[]>(['UNIT-12B'])
const scanOpen = ref(false)
const searchOpen = ref(false)
const cameraReady = ref(false)
const detailUnitId = ref<string | null>(null)
const submitting = ref(false)

// DOM Elementlar uchun Ref'lar
const searchRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
let mediaStream: MediaStream | null = null

// React useMemo muqobili (Filtr qilingan qurilmalar ro'yxati)
const matches = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return MOCK_UNITS.slice(0, 10)
  return MOCK_UNITS.filter((unit) => 
    `${unit.unitId} ${unit.name}`.toLowerCase().includes(term)
  ).slice(0, 12)
})

// Qurilmani tanlash/olib tashlash
const toggleUnit = (unitId: string) => {
  if (selectedUnitIds.value.includes(unitId)) {
    selectedUnitIds.value = selectedUnitIds.value.filter((id) => id !== unitId)
  } else {
    selectedUnitIds.value.push(unitId)
  }
}

// QR skanlashni simulyatsiya qilish (Demo)
const completeQrScan = () => {
  if (!selectedUnitIds.value.includes('UNIT-12B')) {
    selectedUnitIds.value = ['UNIT-12B', ...selectedUnitIds.value]
  }
  scanOpen.value = false
  searchOpen.value = true
}

// Qidiruv maydonini ochish va fokus berish
const openSearch = async () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    await nextTick() // DOM chizilib bo'lishini kutamiz
    window.setTimeout(() => searchRef.value?.focus(), 80)
  }
}

// Kamerani to'xtatish funksiyasi
const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
  }
  cameraReady.value = false
}

// Kamera oqimini kuzatish (React useEffect muqobili)
watch(scanOpen, (isOpen) => {
  if (!isOpen) {
    stopCamera()
    return
  }

  cameraReady.value = false
  navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
    .then((stream) => {
      mediaStream = stream
      cameraReady.value = true
      // Vue'da DOM ref qiymati tayyor bo'lishini kutish uchun navbatdagi tick'dan foydalanamiz
      nextTick(() => {
        if (videoRef.value) {
          videoRef.value.srcObject = stream
          void videoRef.value.play()
        }
      })
    })
    .catch(() => {
      cameraReady.value = false
    })
})

// Komponent yopilganda kamerani tozalash
onUnmounted(() => {
  stopCamera()
})

// Formani yuborish (Submit)
const submit = async () => {
  if (selectedUnitIds.value.length === 0 || submitting.value) return
  
  submitting.value = true
  try {
    const created = await Promise.all(
      selectedUnitIds.value.map((unitId) => {
        const unit = MOCK_UNITS.find((item) => item.unitId === unitId) ?? MOCK_UNITS[0]

        return registerOperation({
          panelId: unit.id,
          unitId: unit.unitId,
          equipName: unit.name,
          panelName: unit.name,
          opType: 'KEY CLOSED',
          operator: department.value,
          department: department.value,
          purpose: reason.value,
          notes: '',
        })
      })
    )
    
    const formattedCreated = created.map((operation) => ({
      ...operation,
      equipName: operation.panelName || operation.equipName
    }))

    emit('submit', formattedCreated)
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

// Tanlangan qurilmaning batafsil ma'lumoti
const detailUnit = computed(() => {
  return detailUnitId.value ? MOCK_UNITS.find((unit) => unit.unitId === detailUnitId.value) : null
})
</script>

<template>
  <ModalShell @close="emit('close')" class="max-w-lg">
    <form class="overflow-y-auto p-8" @submit.prevent="submit">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold">조작 등록</h2>
        <div class="mt-1 text-sm font-semibold text-slate-500">조작등록</div>
        <div class="mx-auto mt-3 h-px w-72 bg-slate-200" />
      </div>

      <!-- 작업 부서 -->
      <label class="mb-4 block">
        <span class="mb-2 block text-sm font-semibold">작업 부서 <b class="text-red-500">*</b></span>
        <select v-model="department" class="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-600 outline-none focus:border-blue-500">
          <option v-for="team in MOCK_TEAMS" :key="team" :value="team">{{ team }}</option>
        </select>
      </label>

      <!-- 작업요청사유 -->
      <label class="mb-4 block">
        <span class="mb-2 block text-sm font-semibold">작업요청사유 <b class="text-red-500">*</b></span>
        <select v-model="reason" class="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-600 outline-none focus:border-blue-500">
          <option v-for="item in MOCK_REASONS" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <!-- 차단기 선택 Buttons -->
      <div>
        <div class="mb-3 text-sm font-semibold">차단기 선택 <b class="text-red-500">*</b></div>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" @click="scanOpen = true" class="flex h-12 items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-50 font-semibold text-blue-600 transition hover:bg-blue-100">
            <QrCode class="h-5 w-5" />QR 스캔
          </button>
          <button 
            type="button" 
            @click="openSearch" 
            :class="['flex h-12 items-center justify-center gap-2 rounded-lg border font-semibold transition', searchOpen ? 'border-blue-500 bg-blue-600 text-white shadow-md' : 'border-slate-300 text-slate-700 hover:border-blue-300 hover:bg-blue-50']"
          >
            <Search class="h-5 w-5" />검색
          </button>
        </div>

        <!-- Search Input & Table Accordion -->
        <div :class="['grid transition-all duration-300 ease-out', searchOpen ? 'mt-3 grid-rows-[48px_1fr] opacity-100' : 'grid-rows-[0px_0fr] opacity-0']">
          <div class="relative min-h-0 overflow-hidden">
            <Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input 
              ref="searchRef" 
              v-model="query" 
              placeholder="Unit ID or equipment name..." 
              class="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
            />
          </div>
          
          <div class="mt-3 max-h-52 min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-xs">
              <slot></slot>
              <thead class="sticky top-0 bg-slate-50 text-slate-700">
                <tr>
                  <th v-for="head in ['기기번호', '키상태', '작업상태', '상세']" :key="head" class="px-3 py-2">{{ head }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="unit in matches" :key="unit.id" class="border-t border-slate-100 transition hover:bg-blue-50/50">
                  <td class="px-3 py-2 font-black">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" :checked="selectedUnitIds.includes(unit.unitId)" @change="toggleUnit(unit.unitId)" />
                      {{ unit.unitId }}
                    </label>
                  </td>
                  <td class="px-3 py-2">KEY CLOSED</td>
                  <td class="px-3 py-2">대기</td>
                  <td class="px-3 py-2">
                    <button type="button" @click="detailUnitId = unit.unitId" class="inline-flex h-7 items-center gap-1 rounded-md border border-slate-300 px-2 font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600">
                      <Info class="h-3.5 w-3.5" />상세
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Selected Tags -->
        <div class="mt-3 flex flex-wrap gap-2">
          <span v-for="unitId in selectedUnitIds" :key="unitId" class="rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
            {{ unitId }}
          </span>
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="selectedUnitIds.length === 0 || submitting" 
        class="mt-6 h-12 w-full rounded-lg bg-blue-600 text-lg font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-300"
      >
        {{ submitting ? '등록 중...' : '조작 등록' }}
      </button>
    </form>

    <!-- QR Scanner Modal Overlay -->
    <div v-if="scanOpen" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 p-6">
      <div class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <b>QR 스캔</b>
          <button type="button" @click="scanOpen = false" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="relative aspect-video bg-slate-950">
          <video ref="videoRef" :class="['h-full w-full object-cover', cameraReady ? 'block' : 'hidden']" muted playsinline />
          
          <!-- Mock QR Placeholder if camera not ready -->
          <div v-if="!cameraReady" class="flex h-full items-center justify-center">
            <div class="grid grid-cols-9 gap-1 rounded-xl bg-white p-4">
              <template v-for="(row, rowIndex) in demoQrCells" :key="rowIndex">
                <span 
                  v-for="(cell, colIndex) in row" 
                  :key="`${rowIndex}-${colIndex}`" 
                  :class="['h-3 w-3', cell ? 'bg-slate-950' : 'bg-white']" 
                />
              </template>
            </div>
          </div>
          <div class="absolute inset-8 rounded-lg border-2 border-blue-400" />
        </div>
        <div class="space-y-3 p-4">
          <p class="text-sm font-semibold text-slate-600">QR 코드를 스캔하세요. 데모 스캔은 UNIT-12B를 선택합니다.</p>
          <button type="button" @click="completeQrScan" class="h-11 w-full rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700">
            데모 스캔 완료
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Info Overlay -->
    <div v-if="detailUnit" class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 p-6">
      <div class="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-black">상세 정보</h3>
          <button type="button" @click="detailUnitId = null">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-slate-500">기기번호</span><b>{{ detailUnit.unitId }}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">설비명</span><b class="text-right">{{ detailUnit.name }}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">키상태</span><b>KEY CLOSED</b></div>
          <div class="flex justify-between"><span class="text-slate-500">작업상태</span><b>대기</b></div>
        </div>
      </div>
    </div>
  </ModalShell>
</template>