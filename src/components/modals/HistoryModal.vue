<template>
  <ModalShell :onClose="onClose" class="max-w-4xl">
    <div class="shrink-0 border-b border-slate-200 p-6">
      <h2 class="text-2xl font-black">이력 조회</h2>
      <div class="text-sm font-bold text-slate-500">이력조회</div>
    </div>
    
    <div class="min-h-0 flex-1 p-6">
      <div class="mb-5 flex items-center gap-4">
        <select class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold">
          <option>전체 상태</option>
        </select>
        <input type="date" class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold" />
        <div class="ml-auto text-sm font-bold text-slate-500">{{ rows.length }}건</div>
      </div>
      
      <div class="max-h-[calc(100vh-280px)] overflow-y-auto rounded-xl border border-slate-200">
        <table class="w-full text-left text-sm">
          <slot name="header">
            <thead class="sticky top-0 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th v-for="head in headers" :key="head" class="px-5 py-3">
                  {{ head }}
                </th>
              </tr>
            </thead>
          </slot>
          <tbody>
            <tr v-for="row in rows" :key="`${row.unitId}-${row.timestamp}`" class="border-t border-slate-100">
              <td class="px-5 py-3 font-bold text-blue-600">{{ row.unitId }}</td>
              <td class="px-5 py-3 font-semibold">{{ row.equipName }}</td>
              <td :class="[
                'px-5 py-3 font-black',
                row.status === 'KEY_ALERT' ? 'text-red-600' : row.status === 'KEY_OPEN' ? 'text-emerald-600' : 'text-blue-600'
              ]">
                {{ row.status.replace('_', ' ') }}
              </td>
              <td class="px-5 py-3 font-semibold">{{ row.operator }}</td>
              <td class="px-5 py-3 text-slate-500">{{ row.timestamp.slice(0, 16) }}</td>
              <td class="px-5 py-3">
                <StatusBadge :status="row.workStatus" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="flex shrink-0 justify-end border-t border-slate-200 p-5">
      <button type="button" @click="onClose" class="h-12 w-32 rounded-lg bg-blue-600 font-bold text-white">
        확인
      </button>
    </div>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ModalShell from './ModalShell.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import { MOCK_HISTORY } from '../../data/mockData'
import type { Operation } from '../../types'

// ===== PROPS DEFINITION =====
interface Props {
  operations?: Operation[]
  onClose: () => void
}

const props = withDefaults(defineProps<Props>(), {
  operations: () => [],
})

// ===== STATIC DATA =====
const headers = ['대상기기', '대상기기명', '기상태', '조작자', '일시', '작업상태']

// ===== COMPUTED ROWS =====
// Maintains identical fall-through evaluation to match initial React node criteria safely
const rows = computed(() => {
  if (props.operations && props.operations.length > 0) {
    return props.operations.map((operation) => ({
      unitId: operation.unitId,
      equipName: operation.equipName || operation.panelName || '',
      status: operation.opType.replace(' ', '_'),
      operator: operation.operator,
      timestamp: operation.operatedAt,
      workStatus: operation.status,
    }))
  }
  return MOCK_HISTORY
})
</script>