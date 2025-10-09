import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TodoItems from '@/views/TodoItems.vue'
import MessagesView from '@/views/MessagesView.vue'
import ComputerDetailView from '@/views/ComputerDetailView.vue'
import ProbeDataView from '@/views/ProbeDataView.vue'
import TemperatureStatisticsView from '@/views/TemperatureStatisticsView.vue'
import GarageEventsView from '@/views/GarageEventsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/todoItems',
      name: 'todoItems',
      component: TodoItems,
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView,
    },
    {
      path: '/computer/:computerId',
      name: 'computer',
      component: ComputerDetailView,
    },
    {
      path: '/probeData',
      name: 'probeData',
      component: ProbeDataView,
    },
    {
      path: '/temperatureStatistics',
      name: 'temperatureStatistics',
      component: TemperatureStatisticsView,
    },
    {
      path: '/garageEvents',
      name: 'garageEvents',
      component: GarageEventsView,
    },
  ],
})

export default router
