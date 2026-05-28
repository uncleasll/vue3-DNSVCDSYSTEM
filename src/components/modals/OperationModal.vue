<template>
  <ModalShell :onClose="onClose" class-name="max-w-5xl">
    <div class="shrink-0 border-b border-slate-200 bg-slate-50 p-6">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-100 text-blue-600 shadow-sm">
          <PlayIcon v-if="isStart" class="h-6 w-6" />
          <CheckIcon v-else class="h-7 w-7" />
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-950">{{ isStart ? '조작 시작' : '조작 완료' }}</h2>
          <div class="text-sm font-bold text-slate-500">{{ isStart ? '조작시작' : '조작완료' }}</div>
        </div>
      </div>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-[1.1fr_1fr_1fr] gap-6 overflow-hidden bg-slate-50 p-6">
      <section class="min-h-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-black text-slate-950">{{ isStart ? '조작 내역' : '진행중 목록' }}</h3>
          <span class="text-sm font-black text-blue-600">{{ selectedItems.length }}/{{ list.length }} 선택</span>
        </div>

        <div class="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          <button
            v-for="item in list"
            :key="item.id"
            type="button"
            :class="[
              'flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left shadow-sm transition',
              selectedIds.includes(item.id)
                ? 'border-blue-600 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.18)]'
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
              <div class="truncate text-lg font-black text-slate-950">{{ item.unitId }}</div>
              <div class="truncate text-xs font-bold text-slate-500">{{ item.equipName }}</div>
            </div>
            <StatusBadge :status="item.opType.replace(' ', '_')" :blink="item.opType === 'KEY ALERT'" />
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
            :label="isStart ? '조작대상' : '대상'"
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
        :disabled="selectedItems.length === 0"
        class="flex h-14 w-64 items-center justify-center gap-3 rounded-lg border-2 border-blue-700 bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
        @click="confirm"
      >
        <PlayIcon v-if="isStart" class="h-6 w-6" />
        <CheckIcon v-else class="h-6 w-6" />
        {{ isStart ? '작업 시작' : '완료 처리' }}
      </button>
    </div>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, type Component } from 'vue'
import { Check as CheckIcon, Play as PlayIcon, User as UserIcon, Users as UsersIcon, Wrench as WrenchIcon } from 'lucide-vue-next'
import { MOCK_KEY_STATUS, MOCK_TEAMS, TEAM_DATA } from '../../data/mockData'
import type { Operation } from '../../types'
import StatusBadge from '../ui/StatusBadge.vue'
import ModalShell from './ModalShell.vue'

interface Props {
  mode: 'start' | 'complete'
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

const selectedIds = ref<number[]>(
  isStart.value
    ? list.value.slice(0, 2).map((item) => item.id)
    : [list.value[0]?.id ?? 0].filter(Boolean),
)

const team = ref(MOCK_TEAMS[0])
const teamInfo = computed(() => TEAM_DATA[team.value])
const supervisor = ref(teamInfo.value.supervisors[0])
const worker = ref(teamInfo.value.workers[0])

const active = computed(() => list.value.find((item) => selectedIds.value.includes(item.id)) ?? list.value[0])
const selectedItems = computed(() => list.value.filter((item) => selectedIds.value.includes(item.id)))

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

const confirm = async () => {
  await props.onConfirm?.(selectedItems.value, worker.value, team.value)
  props.onClose()
}
</script>
