<template>
  <ModalShell :onClose="onClose" class-name="max-w-5xl">
    <!-- Header Section -->
    <div class="shrink-0 border-b border-slate-200 p-6">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <PlayIcon v-if="isStart" class="h-6 w-6" />
          <CheckIcon v-else class="h-7 w-7" />
        </div>
        <div>
          <h2 class="text-2xl font-black">{{ isStart ? '조작 시작' : '조작 완료' }}</h2>
          <div class="text-sm font-bold text-slate-500">{{ isStart ? '조작시작' : '조작완료' }}</div>
        </div>
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="grid min-h-0 flex-1 grid-cols-[1.1fr_1fr_1fr] gap-6 overflow-hidden p-6">
      <!-- Left Section: Operation List -->
      <section class="min-h-0">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-bold">{{ isStart ? '조작 내역' : '진행중 목록' }}</h3>
          <span class="text-sm font-bold text-blue-600">{{ selectedItems.length }}/{{ list.length }} 선택</span>
        </div>
        
        <div class="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          <button 
            v-for="item in list" 
            :key="item.id" 
            type="button" 
            @click="toggleSelected(item.id)" 
            :class="[
              'flex w-full items-center gap-3 rounded-lg border p-3 text-left shadow-sm',
              selectedIds.includes(item.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
            ]"
          >
            <input 
              type="checkbox" 
              :checked="selectedIds.includes(item.id)" 
              @change="toggleSelected(item.id)" 
              @click.stop
              class="h-5 w-5 rounded border-slate-300 text-blue-600" 
            />
            <div class="min-w-0 flex-1">
              <div class="font-black">{{ item.unitId }}</div>
              <div class="text-xs font-semibold text-slate-500">{{ item.equipName }}</div>
            </div>
            <StatusBadge :status="item.opType.replace(' ', '_')" :blink="item.opType === 'KEY ALERT'" />
          </button>
        </div>
      </section>

      <!-- Center Section: Information Selection inputs -->
      <section class="border-x border-slate-200 px-6">
        <h3 class="mb-5 font-bold">정보 입력</h3>
        <SelectComponent label="팀 선택" :value="team" @change="setTeam" :options="MOCK_TEAMS" />
        <SelectComponent label="책임자" :value="supervisor" @change="setSupervisor" :options="teamInfo.supervisors" />
        <SelectComponent label="작업자" :value="worker" @change="setWorker" :options="teamInfo.workers" />
      </section>

      <!-- Right Section: Summary Information panel -->
      <section>
        <h3 class="mb-5 font-bold">확인 정보</h3>
        <div class="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
          <InfoComponent :icon="UsersIcon" label="팀" :value="team" />
          <InfoComponent :icon="UserIcon" label="책임자" :value="supervisor" />
          <InfoComponent :icon="WrenchIcon" label="작업자" :value="worker" />
          <InfoComponent 
            :icon="CheckIcon" 
            :label="isStart ? '조작대상' : '대상'" 
            :value="selectedItems.length > 1 ? `${selectedItems.length}개 선택` : active?.unitId ?? '-'" 
            :sub="selectedItems.map((item) => item.unitId).join(', ') || active?.equipName" 
          />
        </div>
      </section>
    </div>

    <!-- Footer Action Buttons -->
    <div class="flex shrink-0 justify-end border-t border-slate-200 p-5">
      <button 
        type="button" 
        :disabled="selectedItems.length === 0" 
        @click="confirm" 
        class="flex h-14 w-64 items-center justify-center gap-3 rounded-lg bg-blue-600 text-lg font-bold text-white shadow-lg hover:bg-blue-700 disabled:bg-slate-300"
      >
        <PlayIcon v-if="isStart" class="h-6 w-6" />
        <CheckIcon v-else class="h-6 w-6" />
        {{ isStart ? '작업 시작' : '완료 처리' }}
      </button>
    </div>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check as CheckIcon, Play as PlayIcon, User as UserIcon, Users as UsersIcon, Wrench as WrenchIcon } from 'lucide-vue-next'
import { MOCK_KEY_STATUS, MOCK_TEAMS, TEAM_DATA } from '../../data/mockData'
import type { Operation } from '../../types'
import StatusBadge from '../ui/StatusBadge.vue'
import ModalShell from './ModalShell.vue'

// ===== PROPS DEFINITION =====
interface Props {
  mode: 'start' | 'complete'
  operations?: Operation[]
  onClose: () => void
  onConfirm?: (operations: Operation[], worker: string, team: string) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  operations: () => [],
})

// ===== UTILITY FUNCTIONS =====
const isProgress = (status: string) => status === '진행중' || status === 'м§„н–‰м¤‘'

// ===== COMPUTED PROPERTIES (useMemo Alternative) =====
const isStart = computed(() => props.mode === 'start')

const list = computed<Operation[]>(() => {
  const progress = props.operations.filter((operation) => isProgress(operation.status))
  if (progress.length > 0) return progress

  return MOCK_KEY_STATUS.slice(0, isStart.value ? 7 : 5).map((item, index) => ({
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
})

// ===== STATE MANAGEMENT =====
const selectedIds = ref<number[]>(
  isStart.value 
    ? list.value.slice(0, 2).map((item) => item.id) 
    : [list.value[0]?.id ?? 0].filter(Boolean)
)

const team = ref(MOCK_TEAMS[0])
const teamInfo = computed(() => TEAM_DATA[team.value])

const supervisor = ref(teamInfo.value.supervisors[0])
const worker = ref(teamInfo.value.workers[0])

const active = computed(() => list.value.find((item) => selectedIds.value.includes(item.id)) ?? list.value[0])
const selectedItems = computed(() => list.value.filter((item) => selectedIds.value.includes(item.id)))

// ===== METHODS / MUTATIONS =====
const toggleSelected = (id: number) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

const setTeam = (nextTeam: string) => {
  team.value = nextTeam
  supervisor.value = TEAM_DATA[nextTeam].supervisors[0]
  worker.value = TEAM_DATA[nextTeam].workers[0]
}

const setSupervisor = (val: string) => {
  supervisor.value = val
}

const setWorker = (val: string) => {
  worker.value = val
}

const confirm = async () => {
  await props.onConfirm?.(selectedItems.value, worker.value, team.value)
  props.onClose()
}
</script>

<!-- ===== SUB-COMPONENTS DECLARED LOCALLY ===== -->
<script lang="ts">
import { defineComponent, type Component } from 'vue'

// Local Select Component mapping identical styles and actions
const SelectComponent = defineComponent({
  name: 'SelectComponent',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    options: { type: Array as () => string[], required: true }
  },
  emits: ['change'],
  template: `
    <label class="mb-5 block">
      <span class="mb-2 block text-sm font-bold">{{ label }} <b class="text-red-500">*</b></span>
      <select :value="value" @change="$emit('change', ($event.target as HTMLSelectElement).value)" class="h-12 w-full rounded-lg border border-slate-300 px-4 text-base font-semibold outline-none focus:border-blue-500">
        <option v-for="option in options" :key="option">{{ option }}</option>
      </select>
    </label>
  `
})

// Local Info Display Row Component replicating layout layout constraints
const InfoComponent = defineComponent({
  name: 'InfoComponent',
  props: {
    icon: { type: Object as () => Component, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    sub: { type: String, default: '' }
  },
  template: `
    <div class="flex items-center gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <component :is="icon" class="h-5 w-5" />
      </div>
      <div class="text-sm font-bold text-slate-500">{{ label }}</div>
      <div class="ml-auto text-right text-base font-black">
        {{ value }}
        <div v-if="sub" class="text-sm font-semibold text-slate-500">{{ sub }}</div>
      </div>
    </div>
  `
})

export default {
  components: {
    SelectComponent,
    InfoComponent
  }
}
</script>
