<template>
  <div class="min-h-screen bg-slate-50">
    <main class="min-h-screen p-4 transition-all duration-300">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
