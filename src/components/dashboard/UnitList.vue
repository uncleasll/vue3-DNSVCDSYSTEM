<template>
  <section class="flex h-[calc(100vh-104px)] min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
    <!-- Search Input Wrapper -->
    <div class="relative mb-3">
      <!-- Search Icon from lucide-vue-next -->
      <SearchIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input 
        v-model="query" 
        placeholder="UNIT / equipment search" 
        class="h-9 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-xs outline-none focus:border-blue-500" 
      />
    </div>

    <!-- Units Grid Layout Container -->
    <div class="grid flex-1 grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1">
      <button 
        v-for="unit in units" 
        :key="unit.id" 
        type="button" 
        @click="$emit('toggleUnit', unit.unitId)" 
        :title="`${unit.unitId} · ${unit.name}`" 
        :class="[
          'min-h-[52px] rounded-md border px-2 py-1.5 text-left shadow-sm hover:border-blue-300 hover:bg-blue-50/40 transition-colors duration-150',
          selectedUnitIds.includes(unit.unitId)
            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' 
            : 'border-slate-200 bg-white'
        ]"
      >
        <div class="grid grid-cols-[20px_minmax(0,1fr)] gap-1.5">
          <span class="pt-0.5 text-center text-sm font-black leading-none text-blue-700">
            {{ unit.id }}
          </span>
          <div class="min-w-0 overflow-hidden leading-tight">
            <div class="break-words text-[10px] font-black leading-[1.1] text-slate-950">
              {{ unit.unitId }}
            </div>
            <div class="mt-0.5 break-words text-[8px] font-bold uppercase leading-[1.15] text-slate-500">
              {{ unit.name }}
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- Toggle View Button (Show All / Show Less) -->
    <button 
      type="button" 
      @click="showAll = !showAll" 
      class="mt-3 h-9 rounded-lg border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
    >
      {{ showAll ? 'show less' : 'view all units' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search as SearchIcon } from 'lucide-vue-next'
import { MOCK_UNITS } from '../../data/mockData' // Adjust path accordingly

// Props Definition
withDefaults(
  defineProps<{
    selectedUnitIds?: string[]
  }>(),
  {
    selectedUnitIds: () => []
  }
)

// Emits Definition (Replaces onToggleUnit callback)
defineEmits<{
  (e: 'toggleUnit', unitId: string): void
}>()

// Component States
const query = ref('')
const showAll = ref(false)

// Computed Property (Replaces React's useMemo)
const units = computed(() => {
  const term = query.value.trim().toLowerCase()
  
  // Filter core array logic
  const filtered = term
    ? MOCK_UNITS.filter((unit) => 
        `${unit.id} ${unit.unitId} ${unit.name}`.toLowerCase().includes(term)
      )
    : MOCK_UNITS

  // Pagination / slice limiting handler
  return showAll.value || term ? filtered : filtered.slice(0, 24)
})
</script>