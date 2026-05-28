import { createRouter, createWebHistory } from 'vue-router'
import Layout from './components/layout/Layout.vue'
import Dashboard from './pages/Dashboard.vue'
import UnitOverview from './pages/UnitOverview.vue'
import AlarmEvent from './pages/AlarmEvent.vue'
import History from './pages/History.vue'
import Settings from './pages/Settings.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', component: Dashboard },
        { path: 'unit-overview', component: UnitOverview },
        { path: 'alarm-event', component: AlarmEvent },
        { path: 'history', component: History },
        { path: 'settings', component: Settings },
      ],
    },
  ],
})