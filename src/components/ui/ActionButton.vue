<template>
  <button
    type="button"
    :class="[
      'flex h-full min-h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]',
      variantClasses[variant],
    ]"
    :style="variantStyles[variant]"
    @click="emit('click')"
  >
    <component :is="icon" class="h-5 w-5" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component | string
  label: string
  variant: 'dark' | 'green' | 'orange' | 'blue'
}

defineProps<Props>()

const variantClasses: Record<Props['variant'], string> = {
  blue: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',
  dark: 'border-slate-950 bg-slate-950 text-white hover:bg-slate-900',
  green: 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  orange: 'border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100',
}

const variantStyles: Record<Props['variant'], Record<string, string>> = {
  blue: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    color: '#ffffff',
  },
  dark: {
    backgroundColor: '#020617',
    borderColor: '#020617',
    color: '#ffffff',
  },
  green: {
    backgroundColor: '#ecfdf5',
    borderColor: '#d1fae5',
    color: '#059669',
  },
  orange: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    color: '#d97706',
  },
}

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>
