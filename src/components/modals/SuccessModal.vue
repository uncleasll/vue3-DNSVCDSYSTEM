<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-6">
    
    <div class="relative h-[560px] w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl">
      
      <button 
        type="button" 
        @click="$emit('close')" 
        class="absolute right-5 top-5 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <XIcon class="h-5 w-5" />
      </button>

      <span 
        v-for="(_, index) in 16" 
        :key="index" 
        class="confetti-particle absolute h-2 w-2 rounded-sm" 
        :style="{
          left: `${15 + (index * 5) % 70}%`, 
          top: `${20 + (index * 11) % 45}%`, 
          background: ['#10B981', '#3B82F6', '#60A5FA', '#14B8A6'][index % 4], 
          animationDelay: `${index * 0.12}s`
        }" 
      />

      <div class="flex h-full flex-col items-center justify-center bg-gradient-to-b from-white via-white to-blue-50">
        <div class="mb-14 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-[0_0_40px_rgba(16,185,129,.45)]">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckIcon class="h-12 w-12" />
          </div>
        </div>
        
        <div class="text-3xl font-black text-emerald-600">
          조작 등록 완료
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Check as CheckIcon, X as XIcon } from 'lucide-vue-next'

// Emits mapping context definition (Replaces direct onClose closure callback)
const emit = defineEmits<{
  (e: 'close'): void
}>()

// Timer configuration management variables
let autoCloseTimer: number | null = null

// Lifecycle Hooks handling exact mirror logic of React's useEffect setup
onMounted(() => {
  autoCloseTimer = window.setTimeout(() => {
    emit('close')
  }, 2500)
})

onUnmounted(() => {
  if (autoCloseTimer) {
    window.clearTimeout(autoCloseTimer)
  }
})
</script>