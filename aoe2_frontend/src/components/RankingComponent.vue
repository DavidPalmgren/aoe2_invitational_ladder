<script setup lang="ts">
import { ref, onMounted } from 'vue'

const players = ref<any[]>([])

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

async function getRating() {
  const res = await fetch('data/player_data.json')
  const data = await res.json()

  players.value = data
}

onMounted(getRating)
</script>

<template>
  <h2>AOE2 Players</h2>

  <div v-if="players.length > 0">
    <div v-for="player in players" :key="player.name" class="card">

      <h1>
        <a :href="player.url" target="_blank">
          {{ player.name }}
        </a>
      </h1>

      <p><strong>Rating:</strong> {{ player.rating }}</p>

      <p>
        <strong>Updated:</strong>
        {{ formatDate(player.last_updated) }}
      </p>

    </div>
  </div>

  <p v-else>Loading...</p>
</template>

<style scoped>
.card {
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  background: #1e293b;
  color: white;
}

a {
  color: #60a5fa;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>