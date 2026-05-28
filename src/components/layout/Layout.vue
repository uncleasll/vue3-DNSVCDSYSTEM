<template>
  <div class="min-h-screen bg-slate-50">
    
    <Sidebar />

    <main class="min-h-screen p-4 ml-56 transition-all duration-300">
      <RouterView />
    </main>

  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './Sidebar.vue'

// All internal collapsed refs and toggle functions removed to enforce permanent open state alignment
</script>