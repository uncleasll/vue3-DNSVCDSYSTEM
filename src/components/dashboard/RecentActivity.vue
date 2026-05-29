<script setup lang="ts">
import { computed } from 'vue'
// Import mock data, types, and the StatusBadge component
import { MOCK_KEY_STATUS } from '../../data/mockData'
import type { Operation } from '../../types'
import StatusBadge from '../ui/StatusBadge.vue'

// Define TypeScript props with default values
const props = withDefaults(
  defineProps<{
    operations?: Operation[]
  }>(),
  {
    operations: () => []
  }
)

// Define custom event for the "view all" action
defineEmits<{
  (e: 'viewAll'): void
}>()

// Computed property to format, sort, and slice the activity items dynamically
const items = computed(() => {
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

<template>
  <!-- Main section container with original border, background, and shadow -->
  <section class="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <!-- Header section with title and action button -->
    <div class="mb-2 flex items-center justify-between">
      <h2 class="text-[10px] font-semibold">RECENT ACTIVITY</h2>
      <button 
        type="button" 
        @click="$emit('viewAll')" 
       class="text-[10px] font-semibold text-blue-600 hover:underline"
      >
        view all -&gt;
      </button>
    </div>

    <!-- Scrollable list container preserving precise max-height and spacing -->
    <div class="max-h-[188px] space-y-1.5 overflow-y-auto pr-1">
      <div 
        v-for="item in items" 
        :key="`${item.unitId}-${item.timestamp}`" 
        class="grid grid-cols-[52px_minmax(0,1fr)_80px] items-center gap-1 text-[10px]"
      >
        <!-- Format timestamp based on the presence of 'T' character -->
        <span class="text-slate-500">
          {{ item.timestamp.includes('T') ? item.timestamp.slice(11, 19) : item.timestamp.slice(11) }}
        </span>
        
        <!-- Unit ID Display -->
        <span class="font-semibold">{{ item.unitId }}</span>
        
        <!-- Reusable Status Badge Component -->
        <StatusBadge :status="item.status" :blink="item.status === 'KEY_ALERT'" />
      </div>
    </div>
  </section>
</template>