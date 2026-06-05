<template>
  <Header section="SETTINGS" />
  
  <section class="grid h-[calc(100vh-104px)] min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-4 overflow-hidden">
    
    <div class="overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-6 text-lg font-black">System settings</h2>
      
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="item in settingsList" 
          :key="item.title" 
          class="rounded-lg border border-slate-200 p-5"
        >
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <div>
              <div class="font-black">{{ item.title }}</div>
              <div class="text-xs text-slate-500">{{ item.desc }}</div>
            </div>
          </div>
          
          <label class="flex items-center justify-between text-sm font-bold">
            Enabled
            <input type="checkbox" v-model="item.enabled" />
          </label>
        </div>
      </div>
    </div>

    <aside class="overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 font-black">MVP readiness</h2>
      
      <div 
        v-for="item in readinessItems" 
        :key="item" 
        class="mb-3 flex items-center justify-between text-sm"
      >
        <span>{{ item }}</span>
        <span class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">OK</span>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Bell, Database, Shield, Wifi } from 'lucide-vue-next'

// Vite import analysis fix applied directly by pointing explicitly to the .vue component file
import Header from '../components/layout/Header.vue'

// Local state array matching exact structural fields from your original React mock array
const settingsList = ref([
  { icon: shallowRef(Wifi), title: 'GEN 연동', desc: 'Generator link status and reconnect policy', enabled: true },
  { icon: shallowRef(Bell), title: '키보관함연동', desc: 'Default transfer signal monitoring', enabled: true },
  { icon: shallowRef(Shield), title: 'Alarm escalation', desc: 'Notify operator when KEY-ALERT is active', enabled: true },
  { icon: shallowRef(Database), title: 'Demo data sync', desc: 'Use local MVP data until HW API is connected', enabled: true },
])

// Local readiness checklist array mapped precisely to the original structure
const readinessItems = [
  'Dashboard connected', 
  'Unit overview connected', 
  'Alarm & Event connected', 
  'History demo ready', 
  'Settings demo ready'
]
</script>
