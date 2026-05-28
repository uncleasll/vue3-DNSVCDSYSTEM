<template>
  <div class="flex min-h-24 items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-full', colorClasses[color].bg, colorClasses[color].text]">
      <component :is="icon" class="h-6 w-6" />
    </div>
    
    <div>
      <div :class="['text-xs font-bold', colorClasses[color].text]">
        {{ label }}
      </div>
      <div class="mt-1 text-2xl font-bold text-slate-950">
        {{ value }}
        <span v-if="sub" class="text-sm font-semibold text-slate-500 ml-0.5">
          {{ sub }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

// TypeScript interface defining the strict component props schema
interface Props {
  icon: Component | string
  label: string
  value: string | number
  color: 'blue' | 'red' | 'green' | 'orange' | 'slate'
  sub?: string
}

// Declaring component props using Vue 3 compiler macro
defineProps<Props>()

// Structuring color mappings cleanly to eliminate dangerous string-splitting logic
const colorClasses: Record<Props['color'], { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-500' },
}
</script>