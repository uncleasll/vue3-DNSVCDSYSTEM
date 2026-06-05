<template>
  <ModalShell :onClose="onClose" :class-name="isManual ? 'max-w-2xl' : 'max-w-5xl'">
    <div class="shrink-0 border-b border-slate-200 bg-slate-50 p-6">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-100 text-blue-600 shadow-sm">
          <PlayIcon v-if="isStart" class="h-6 w-6" />
          <HandIcon v-else-if="isManual" class="h-7 w-7" />
          <CheckIcon v-else class="h-7 w-7" />
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-950">{{ modalTitle }}</h2>
          <div class="text-sm font-bold text-slate-500">{{ modalSubtitle }}</div>
        </div>
      </div>
    </div>

    <div v-if="isManual" class="min-h-0 flex-1 overflow-hidden bg-slate-50 p-6">
      <section class="mx-auto flex h-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-5 border-b-2 border-blue-600 pb-3">
          <h3 class="text-xl font-black text-slate-950">수동조작</h3>
          <p class="mt-1 text-sm font-bold text-red-600">GENi 연결 장애 시에만 사용</p>
        </div>

        <label class="mb-4 block">
          <span class="mb-2 block text-sm font-black text-slate-800">작업 부서 <b class="text-red-500">*</b></span>
          <select v-model="team" class="h-12 w-full rounded-lg border-2 border-blue-200 bg-blue-50 px-4 text-sm font-black text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100" @change="setTeam(team)">
            <option v-for="option in MOCK_TEAMS" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="mb-4 block">
          <span class="mb-2 block text-sm font-black text-slate-800">작업요청사유 <b class="text-red-500">*</b></span>
          <select v-model="manualReason" class="h-12 w-full rounded-lg border-2 border-blue-200 bg-blue-50 px-4 text-sm font-black text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100">
            <option value="" disabled>작업요청사유 선택</option>
            <option v-for="reason in manualReasons" :key="reason" :value="reason">{{ reason }}</option>
          </select>
        </label>

        <div class="mb-3">
          <span class="mb-2 block text-sm font-black text-slate-800">차단기 선택 <b class="text-red-500">*</b></span>
          <button
            type="button"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-600 text-base font-black text-white shadow-sm transition hover:bg-blue-700"
            @click="loadManualPanels"
          >
            <SearchIcon class="h-5 w-5" />
            검색
          </button>
        </div>

        <input
          v-model="manualSearch"
          type="text"
          placeholder="Unit ID or equipment name..."
          class="mb-3 h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />

        <div class="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200">
          <div class="grid grid-cols-[36px_1.2fr_1fr_1fr_44px] bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">
            <span></span>
            <span>기기번호</span>
            <span>기상태</span>
            <span>작업상태</span>
            <span>상세</span>
          </div>
          <div class="h-full max-h-[220px] overflow-y-auto bg-white">
            <div v-if="!manualPanelsLoaded" class="flex h-32 items-center justify-center text-sm font-bold text-slate-500">
              검색 버튼을 눌러 패널 목록을 불러오세요.
            </div>
            <label
              v-else
              v-for="item in filteredManualPanels"
              :key="item.id"
              class="grid cursor-pointer grid-cols-[36px_1.2fr_1fr_1fr_44px] items-center border-b border-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50"
            >
              <input
                type="checkbox"
                :checked="selectedIds.includes(item.id)"
                class="h-5 w-5 rounded border-slate-300 accent-blue-600"
                @change="toggleSelected(item.id)"
              />
              <span class="truncate font-black text-slate-950">{{ item.unitId }}</span>
              <span class="truncate">{{ item.opType }}</span>
              <span class="truncate">{{ isProgress(item.status) ? '진행중' : '대기' }}</span>
              <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-100" @click.stop="detailPanel = item">
                <InfoIcon class="h-4 w-4" />
              </button>
            </label>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="item in selectedItems"
            :key="item.id"
            type="button"
            class="flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-black text-white"
            @click="toggleSelected(item.id)"
          >
            {{ item.unitId }}
            <XIcon class="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </div>

    <div v-else class="grid min-h-0 flex-1 grid-cols-[1.1fr_1fr_1fr] gap-6 overflow-hidden bg-slate-50 p-6">
      <section class="min-h-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-black text-slate-950">{{ listTitle }}</h3>
          <span class="text-sm font-black text-blue-600">{{ selectedItems.length }}/{{ list.length }} 선택</span>
        </div>

        <div class="h-[320px] space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div
            v-if="list.length === 0"
            class="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 text-center text-sm font-bold text-slate-500"
          >
            QR 스캔 후 대상 목록이 표시됩니다.
          </div>
          <button
            v-else
            v-for="item in list"
            :key="item.id"
            type="button"
            :class="[
              'flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left shadow-sm transition',
              selectedIds.includes(item.id)
                ? selectedClass
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40',
            ]"
            @click="toggleSelected(item.id)"
          >
            <input
              type="checkbox"
              :checked="selectedIds.includes(item.id)"
              class="h-5 w-5 rounded border-slate-300 accent-blue-600"
              @click.stop
              @change="toggleSelected(item.id)"
            />
            <div class="min-w-0 flex-1">
              <div :class="['truncate text-lg font-black', selectedIds.includes(item.id) && !isStart ? 'text-red-600' : 'text-slate-950']">{{ item.unitId }}</div>
              <div class="truncate text-xs font-bold text-slate-500">{{ item.equipName }}</div>
            </div>
            <StatusBadge :status="item.opType.replace(' ', '_')" :blink="item.opType === 'KEY ALERT'" />
          </button>
        </div>

        <div v-if="usesBarcode" class="mt-4">
          <label class="mb-2 block text-sm font-black text-slate-800">차단기 선택 <b class="text-red-500">*</b></label>
          <button
            type="button"
            class="flex h-14 w-full items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-blue-600 text-lg font-black text-white shadow-sm transition hover:bg-blue-700"
            @click="openQrScanner"
          >
            <QrCodeIcon class="h-6 w-6" />
            QR 스캔
          </button>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="mb-5 font-black text-slate-950">정보 입력</h3>

        <label class="mb-5 block rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span class="mb-2 block text-sm font-black text-slate-800">팀 선택 <b class="text-red-500">*</b></span>
          <select v-model="team" class="h-12 w-full rounded-lg border-2 border-blue-200 bg-blue-50 px-4 text-sm font-black text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100" @change="setTeam(team)">
            <option v-for="option in MOCK_TEAMS" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="mb-5 block rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span class="mb-2 block text-sm font-black text-slate-800">책임자 <b class="text-red-500">*</b></span>
          <select v-model="supervisor" class="h-12 w-full rounded-lg border-2 border-blue-200 bg-blue-50 px-4 text-sm font-black text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100">
            <option v-for="option in teamInfo.supervisors" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="block rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span class="mb-2 block text-sm font-black text-slate-800">작업자 <b class="text-red-500">*</b></span>
          <select v-model="worker" class="h-12 w-full rounded-lg border-2 border-blue-200 bg-blue-50 px-4 text-sm font-black text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100">
            <option v-for="option in teamInfo.workers" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="mb-5 font-black text-slate-950">확인 정보</h3>
        <div class="rounded-xl border-2 border-blue-200 bg-blue-50/60 p-4 shadow-sm">
          <InfoRow :icon="UsersIcon" label="팀" :value="team" />
          <InfoRow :icon="UserIcon" label="책임자" :value="supervisor" />
          <InfoRow :icon="WrenchIcon" label="작업자" :value="worker" />
          <InfoRow
            :icon="CheckIcon"
            :label="targetLabel"
            :value="selectedItems.length > 1 ? `${selectedItems.length}개 선택` : active?.unitId ?? '-'"
            :sub="selectedItems.map((item) => item.unitId).join(', ') || active?.equipName"
            last
          />
        </div>
      </section>
    </div>

    <div class="flex shrink-0 justify-end border-t border-slate-200 bg-white p-5">
      <button
        type="button"
        :disabled="!canConfirm"
        :class="[
          'flex h-14 items-center justify-center gap-3 rounded-lg border-2 border-blue-700 bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none',
          isManual ? 'w-full' : 'w-64',
        ]"
        @click="confirm"
      >
        <PlayIcon v-if="isStart" class="h-6 w-6" />
        <HandIcon v-else-if="isManual" class="h-6 w-6" />
        <CheckIcon v-else class="h-6 w-6" />
        {{ confirmLabel }}
      </button>
    </div>

    <div v-if="qrScannerOpen" class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/55 p-8">
      <div class="w-[min(560px,90vw)] rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 class="text-xl font-black text-slate-950">QR 스캔</h3>
            <p class="text-sm font-bold text-slate-500">Red Tag를 카메라 영역에 맞춰주세요.</p>
          </div>
          <button type="button" class="rounded-lg px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-100" @click="qrScannerOpen = false">닫기</button>
        </div>
        <div class="p-5">
          <div class="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-slate-950 text-sm font-bold text-white">
            Camera View
          </div>
          <button
            type="button"
            class="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-base font-black text-white hover:bg-blue-700"
            @click="completeQrScan"
          >
            스캔 성공
          </button>
        </div>
      </div>
    </div>

    <div v-if="detailPanel" class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/55 p-8">
      <div class="w-[min(420px,90vw)] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-xl font-black text-slate-950">{{ detailPanel.unitId }}</h3>
          <button type="button" class="rounded-lg px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-100" @click="detailPanel = null">닫기</button>
        </div>
        <div class="space-y-3 text-sm font-bold text-slate-700">
          <div class="flex justify-between gap-4"><span class="text-slate-500">설비명</span><span class="text-right text-slate-950">{{ detailPanel.equipName }}</span></div>
          <div class="flex justify-between gap-4"><span class="text-slate-500">기상태</span><span class="text-right text-slate-950">{{ detailPanel.opType }}</span></div>
          <div class="flex justify-between gap-4"><span class="text-slate-500">작업상태</span><span class="text-right text-slate-950">{{ isProgress(detailPanel.status) ? '진행중' : '대기' }}</span></div>
          <div class="flex justify-between gap-4"><span class="text-slate-500">작업자</span><span class="text-right text-slate-950">{{ detailPanel.operator }}</span></div>
        </div>
      </div>
    </div>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, type Component } from 'vue'
import { Check as CheckIcon, Hand as HandIcon, Info as InfoIcon, Play as PlayIcon, QrCode as QrCodeIcon, Search as SearchIcon, User as UserIcon, Users as UsersIcon, Wrench as WrenchIcon, X as XIcon } from 'lucide-vue-next'
import { MOCK_KEY_STATUS, MOCK_TEAMS, TEAM_DATA } from '../../data/mockData'
import type { Operation } from '../../types'
import StatusBadge from '../ui/StatusBadge.vue'
import ModalShell from './ModalShell.vue'

interface Props {
  mode: 'start' | 'complete' | 'manual'
  operations?: Operation[]
  onClose: () => void
  onConfirm?: (operations: Operation[], worker: string, team: string) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  operations: () => [],
})

const InfoRow = defineComponent({
  props: {
    icon: { type: Object as () => Component, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    sub: { type: String, default: '' },
    last: { type: Boolean, default: false },
  },
  setup(rowProps) {
    return () => h('div', {
      class: [
        'flex items-center gap-4 py-4',
        rowProps.last ? '' : 'border-b border-blue-100',
      ],
    }, [
      h('div', { class: 'flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm' }, [
        h(rowProps.icon, { class: 'h-5 w-5' }),
      ]),
      h('div', { class: 'text-sm font-bold text-slate-500' }, rowProps.label),
      h('div', { class: 'ml-auto min-w-0 text-right text-base font-black text-slate-950' }, [
        h('div', { class: 'truncate' }, rowProps.value),
        rowProps.sub ? h('div', { class: 'max-w-40 truncate text-sm font-semibold text-slate-500' }, rowProps.sub) : null,
      ]),
    ])
  },
})

const isProgress = (status: string) => status === '진행중' || status === 'м§„н–‰м¤‘' || status === 'РјВ§вЂћРЅвЂ“вЂ°РјВ¤вЂ'
const isStart = computed(() => props.mode === 'start')
const isComplete = computed(() => props.mode === 'complete')
const isManual = computed(() => props.mode === 'manual')
const usesBarcode = computed(() => isStart.value || isComplete.value)
const qrScannerOpen = ref(false)
const scannedItems = ref<Operation[]>([])
const manualReason = ref('')
const manualSearch = ref('')
const manualPanelsLoaded = ref(false)
const detailPanel = ref<Operation | null>(null)
const manualReasons = ['정기 점검 후 복전', '모터 교체 작업', '배관 보수', '절연 시험', 'GENi 연결 장애']

const modalTitle = computed(() => {
  if (isStart.value) return '조작 시작'
  if (isManual.value) return '수동 조작'
  return '조작 완료'
})

const modalSubtitle = computed(() => {
  if (isStart.value) return 'QR/Red Tag -> GENi -> DB 저장 -> Hardware ON'
  if (isManual.value) return 'EMERGENCY ONLY: GENi 연결 장애 시 사용'
  return 'QR/Red Tag -> DB 검증 -> Hardware OFF'
})

const listTitle = computed(() => {
  if (isStart.value) return '조작 내역'
  if (isManual.value) return '전체 패널 수동 선택'
  return 'DB 검증된 진행중 목록'
})

const targetLabel = computed(() => {
  if (isStart.value) return '조작대상'
  if (isManual.value) return '수동대상'
  return '완료대상'
})

const confirmLabel = computed(() => {
  if (isStart.value) return 'Hardware ON'
  if (isManual.value) return '수동 열림'
  return 'Hardware OFF'
})

const selectedClass = computed(() => {
  if (isStart.value) return 'border-blue-600 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.18)]'
  return 'border-red-500 bg-red-50 shadow-[0_0_0_3px_rgba(239,68,68,0.18)]'
})

const list = computed<Operation[]>(() => {
  if (usesBarcode.value) return scannedItems.value
  if (isManual.value) return manualPanelsLoaded.value ? filteredManualPanels.value : []
  const progress = props.operations.filter((operation) => isProgress(operation.status))
  if (progress.length > 0) return progress

  return fallbackOperations(isStart.value ? 7 : 5)
})

const manualPanels = computed(() => fallbackOperations(MOCK_KEY_STATUS.length))

const filteredManualPanels = computed(() => {
  const query = manualSearch.value.trim().toLowerCase()
  if (!query) return manualPanels.value
  return manualPanels.value.filter((item) => {
    return item.unitId.toLowerCase().includes(query) || item.equipName.toLowerCase().includes(query)
  })
})

const fallbackOperations = (count: number) => MOCK_KEY_STATUS.slice(0, count).map((item, index) => ({
    id: index + 1,
    panelId: index + 1,
    unitId: item.unitId,
    equipName: item.equipName,
    opType: item.status === 'KEY_ALERT' ? 'KEY ALERT' : item.status === 'KEY_OPEN' ? 'KEY OPEN' : 'KEY CLOSED',
    operator: item.operator,
    department: MOCK_TEAMS[index % MOCK_TEAMS.length],
    purpose: 'Inspection',
    status: '진행중',
    notes: '',
    operatedAt: item.timestamp,
  } as Operation))

const selectedIds = ref<number[]>(
  usesBarcode.value ? [] : [list.value[0]?.id ?? 0].filter(Boolean),
)

const team = ref(MOCK_TEAMS[0])
const teamInfo = computed(() => TEAM_DATA[team.value])
const supervisor = ref(teamInfo.value.supervisors[0])
const worker = ref(teamInfo.value.workers[0])

const active = computed(() => list.value.find((item) => selectedIds.value.includes(item.id)) ?? list.value[0])
const selectedItems = computed(() => list.value.filter((item) => selectedIds.value.includes(item.id)))
const canConfirm = computed(() => {
  if (isManual.value) return selectedItems.value.length > 0 && Boolean(team.value && manualReason.value)
  return selectedItems.value.length > 0 && Boolean(team.value && supervisor.value && worker.value)
})

const toggleSelected = (id: number) => {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id]
}

const setTeam = (nextTeam: string) => {
  team.value = nextTeam
  supervisor.value = TEAM_DATA[nextTeam].supervisors[0]
  worker.value = TEAM_DATA[nextTeam].workers[0]
}

const openQrScanner = () => {
  qrScannerOpen.value = true
}

const loadManualPanels = () => {
  manualPanelsLoaded.value = true
}

const completeQrScan = () => {
  const source = isComplete.value && props.operations.some((operation) => isProgress(operation.status))
    ? props.operations.filter((operation) => isProgress(operation.status))
    : fallbackOperations(MOCK_KEY_STATUS.length)
  const next = source.find((item) => !scannedItems.value.some((scanned) => scanned.unitId === item.unitId))
  if (!next) {
    qrScannerOpen.value = false
    return
  }

  scannedItems.value = [...scannedItems.value, next]
  selectedIds.value = [...new Set([...selectedIds.value, next.id])]
  qrScannerOpen.value = false
}

const confirm = async () => {
  const submitItems = isManual.value
    ? selectedItems.value.map((item) => ({ ...item, purpose: manualReason.value }))
    : selectedItems.value
  await props.onConfirm?.(submitItems, worker.value, team.value)
  props.onClose()
}
</script>
