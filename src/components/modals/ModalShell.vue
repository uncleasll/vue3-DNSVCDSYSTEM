<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-6 backdrop-blur-sm">
    <div :class="[
      'relative flex max-h-[calc(100vh-48px)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
      className
    ]">
      <button 
        v-if="showClose" 
        type="button" 
        @click="onClose" 
        class="absolute right-5 top-5 z-10 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-100" 
        aria-label="Close"
      >
        <XIcon class="h-5 w-5" />
      </button>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { X as XIcon } from 'lucide-vue-next'

// ===== PROPS DEFINITION =====
interface Props {
  onClose: () => void
  className?: string
  showClose?: boolean
}

// Applying identical default parameters as the original structural layout
withDefaults(defineProps<Props>(), {
  className: 'max-w-lg',
  showClose: true
})
</script>
