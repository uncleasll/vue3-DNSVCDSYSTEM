<template>
  <aside 
    class="fixed left-0 top-0 z-10 flex h-screen w-56 flex-col border-r border-slate-200 bg-white px-4 py-6 text-slate-500 shadow-sm"
  >
    <!-- KOEN Brand Header Section Area -->
    <div class="mb-8 flex h-14 items-center px-2">
      <img
        :src="koenLogoUrl"
        alt="KOEN 한국남동발전 KOREA ENERGY"
        class="h-12 w-full object-contain object-left transition-transform duration-300 hover:scale-102"
      />
    </div>

    <!-- Main Navigation Architecture Framework -->
    <nav class="flex-1 space-y-1.5">
      <RouterLink 
        v-for="item in menuItems" 
        :key="item.to" 
        :to="item.to" 
        custom
        v-slot="{ isExactActive, navigate }"
      >
        <a 
          @click="navigate"
          href="#"
          :class="[
            'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer select-none border border-transparent',
            isExactActive 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-100 font-extrabold' 
              : 'text-slate-500 hover:bg-blue-50/60 hover:text-blue-600 hover:border-blue-100/30'
          ]"
        >
          <!-- Menu Item Icon Layer Matrix -->
          <component 
            :is="item.icon" 
            :class="[
              'h-5 w-5 transition-transform duration-200',
              isExactActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-blue-500'
            ]" 
          />
          
          <!-- Semantic Navigation Typography String -->
          <span>{{ item.label }}</span>
        </a>
      </RouterLink>
    </nav>

    <!-- Footer Indicator Matrix -->
  
  </aside>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  AlarmClock, 
  Boxes, 
  History, 
  Home, 
  Settings 
} from 'lucide-vue-next'

const koenLogoUrl = '/koen_logo.png'

// Menu Navigation Array definition layer
const menuItems = [
  { to: '/', label: 'DASHBOARD', icon: markRaw(Home) },
  { to: '/unit-overview', label: 'UNIT OVERVIEW', icon: markRaw(Boxes) },
  { to: '/alarm-event', label: 'ALARM & EVENT', icon: markRaw(AlarmClock) },
  { to: '/history', label: 'HISTORY', icon: markRaw(History) },
  { to: '/settings', label: 'SETTINGS', icon: markRaw(Settings) },
]
</script>
