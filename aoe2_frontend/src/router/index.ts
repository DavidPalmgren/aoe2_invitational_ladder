import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Ranking from '../views/Ranking.vue'
import Schedule from '../views/Schedule.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/ranking', component: Ranking },
    { path: '/schedule', component: Schedule },
  ],
})

export default router