<template>
  <button
    type="button"
    @click="emit('click')"
    :class="[
      'flex h-full min-h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold shadow-sm transition hover:shadow-md active:scale-[0.98]',
      variantClasses[variant]
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

// Dynamic Tailwind CSS utility class mappings managed by variant state
const variantClasses: Record<Props['variant'], string> = {
  dark: 'bg-slate-950 text-white border-slate-950 hover:bg-slate-900',
  blue: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
  green: 'bg-white text-emerald-600 border-slate-200 hover:bg-slate-50',
  orange: 'bg-white text-amber-500 border-slate-200 hover:bg-slate-50',
}
</script>