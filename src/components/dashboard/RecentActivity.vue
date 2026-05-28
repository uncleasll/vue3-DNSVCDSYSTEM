<template>
  <section class="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    
    <div class="mb-2 flex items-center justify-between">
      <h2 class="text-sm font-semibold">RECENT ACTIVITY</h2>
      <button 
        type="button" 
        @click="$emit('view-all')" 
        class="text-xs font-semibold text-blue-600 hover:underline transition"
      >
        view all -&gt;
      </button>
    </div>
    
    <div class="max-h-[188px] space-y-1.5 overflow-y-auto pr-1">
      <div 
        v-for="item in computedItems" 
        :key="`${item.unitId}-${item.timestamp}`" 
        class="grid grid-cols-[68px_minmax(76px,1fr)_104px] items-center gap-2 text-[12px]"
      >
        <span class="text-slate-500">
          {{ item.timestamp.includes('T') ? item.timestamp.slice(11, 19) : item.timestamp.slice(11) }}
        </span>
        
        <span class="font-semibold">{{ item.unitId }}</span>
        
        <StatusBadge :status="item.status" :blink="item.status === 'KEY_ALERT'" />
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MOCK_KEY_STATUS } from '../../data/mockData'
import type { Operation } from '../../types'
import StatusBadge from '../ui/StatusBadge.vue'

// Props definitions definitions
const props = withDefaults(
  defineProps<{
    operations?: Operation[]
  }>(),
  {
    operations: () => []
  }
)

// Emits mapping layout definition (Replaces optional callback props interface rules)
defineEmits<{
  (e: 'view-all'): void
}>()

// Computed pre-processing node block engine to evaluate items mapping structure arrays
const computedItems = computed(() => {
  if (props.operations.length > 0) {
    return [...props.operations]
      .sort((a, b) => b.operatedAt.localeCompare(a.operatedAt))
      .slice(0, 4)
      .map((operation) => ({
        unitId: operation.unitId,
        timestamp: operation.operatedAt,
        status: operation.opType.replace(' ', '_') as 'KEY_ALERT',
      }))
  }
  
  return MOCK_KEY_STATUS.slice(0, 4)
})
</script>