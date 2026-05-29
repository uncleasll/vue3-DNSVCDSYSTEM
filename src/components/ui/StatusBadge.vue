<template>
  <span 
    :class="[
      'inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-[9px] font-bold',
      badgeClass,
      { 'alert-blink': blink }
    ]"
  >
    {{ computedLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EquipmentStatus, KeyStatus, WorkStatus } from '../../types'

// Setup core type properties mapping input signatures
const props = withDefaults(
  defineProps<{
    status: KeyStatus | WorkStatus | EquipmentStatus | string
    blink?: boolean
  }>(),
  {
    blink: false
  }
)

// Unicode Korean Translations Resource Mapping Dictionary
const ko = {
  complete: '\uC644\uB8CC',
  progress: '\uC9C4\uD589\uC911',
  failed: '\uC2E4\uD328',
  normal: '\uC815\uC0C1',
  warning: '\uACBD\uACE0',
  alarm: '\uC54C\uB78C',
  stop: '\uC815\uC9C0',
  inspect: '\uC810\uAC80',
}

// Global visual theme styles mapping definition
const styles: Record<string, string> = {
  KEY_ALERT: 'bg-red-100 text-red-600',
  'KEY ALERT': 'bg-red-100 text-red-600',
  KEY_OPEN: 'bg-emerald-100 text-emerald-600',
  'KEY OPEN': 'bg-emerald-100 text-emerald-600',
  KEY_CLOSED: 'bg-blue-100 text-blue-600',
  'KEY CLOSED': 'bg-blue-100 text-blue-600',
  WARNING: 'bg-amber-100 text-amber-600',
  NORMAL: 'bg-emerald-100 text-emerald-600',
  normal: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  alert: 'bg-red-100 text-red-600',
  [ko.complete]: 'bg-emerald-100 text-emerald-600',
  [ko.progress]: 'bg-blue-100 text-blue-600',
  [ko.failed]: 'bg-red-100 text-red-600',
  [ko.normal]: 'bg-emerald-100 text-emerald-600',
  [ko.warning]: 'bg-orange-100 text-orange-600',
  [ko.alarm]: 'bg-red-100 text-red-600',
  [ko.stop]: 'bg-slate-100 text-slate-500',
  [ko.inspect]: 'bg-blue-100 text-blue-600',
}

// Logical text labels resolver matrix
const labels: Record<string, string> = {
  normal: ko.normal,
  warning: ko.warning,
  alert: ko.alarm,
  [ko.complete]: ko.complete,
  [ko.progress]: ko.progress,
  [ko.failed]: ko.failed,
  [ko.normal]: ko.normal,
  [ko.warning]: ko.warning,
  [ko.alarm]: ko.alarm,
  [ko.stop]: ko.stop,
  [ko.inspect]: ko.inspect,
}

// Computed property to calculate exact title text content
const computedLabel = computed(() => {
  return labels[props.status] ?? props.status.replaceAll('_', ' ')
})

// Computed utility to safely retrieve matching utility CSS color classes
const badgeClass = computed(() => {
  return styles[props.status] ?? styles[computedLabel.value] ?? 'bg-slate-100 text-slate-600'
})
</script>