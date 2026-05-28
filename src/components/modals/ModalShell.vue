<template>
  <!-- Modal Backdrop Orqa foni -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-6">
    
    <!-- Modal Konteyneri -->
    <div 
      :class="[
        'relative flex max-h-[calc(100vh-48px)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl',
        className
      ]"
    >
      <!-- Yopish (X) tugmasi -->
      <button 
        v-if="showClose" 
        type="button" 
        @click="$emit('close')" 
        class="absolute right-5 top-5 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors" 
        aria-label="Close"
      >
        <XIcon class="h-5 w-5" />
      </button>

      <!-- React'dagi {children} o'rniga Vue Slot'i -->
      <slot />
    </div>

  </div>
</template>

<script setup lang="ts">
import { X as XIcon } from 'lucide-vue-next'

// Props ta'riflari va ularning standart (default) qiymatlari
withDefaults(
  defineProps<{
    className?: string
    showClose?: boolean
  }>(),
  {
    className: 'max-w-lg',
    showClose: true
  }
)

// Komponentdan tashqariga chiqadigan hodisalar (Events)
defineEmits<{
  (e: 'close'): void
}>()
</script>