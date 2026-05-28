<template>
  <button
    type="button"
    @click="emit('click')"
    :class="[
      'flex h-full min-h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]',
      
      // REGISTER BUTTON (Ko'k) — Qat'iy tekshiruv
      variant === 'blue' ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : '',
      
      // START BUTTON (Qora / To'q) — Qat'iy tekshiruv
      variant === 'dark' ? 'bg-slate-950 text-white border-slate-950 hover:bg-slate-900' : '',
      
      // COMPLETE BUTTON (Mayin yashil) — Qat'iy tekshiruv
      variant === 'green' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/70' : '',
      
      // HISTORY BUTTON (Mayin sarg'ish) — Qat'iy tekshiruv
      variant === 'orange' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/70' : ''
    ]"
  >
    <component :is="icon" class="h-5 w-5" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

// TypeScript interface defining the strict component props schema
interface Props {
  icon: Component | string
  label: string
  variant: 'dark' | 'green' | 'orange' | 'blue'
}

// Declaring component props using Vue 3 compiler macro
defineProps<Props>()

// Defining component event emitters to bubble click interactions up to parent
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>