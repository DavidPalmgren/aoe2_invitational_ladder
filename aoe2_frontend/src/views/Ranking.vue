<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTwitch } from '@fortawesome/free-brands-svg-icons'
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


  <table v-if="players.length > 0" class="table">
    <thead>
      <tr>
        <th>Player</th>
        <th>Rating</th>
        <th>Win Rate</th>
        <th>Matches</th>
        <th>Twitch</th>
        <th>Updated</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="player in players" :key="player.name">
        <td>
          <a :href="player.url" target="_blank" rel="noopener noreferrer">
            {{ player.name }}
          </a>
        </td>

        <td>{{ player.rating }}</td>
        <td>--%</td>
        <td>--</td>

        <!-- Twitch column -->
        <td>
          <a
            v-if="player.twitch"
            :href="player.twitch"
            target="_blank"
            rel="noopener noreferrer"
            class="twitch-link"
          >
            <!-- Twitch icon -->
  <FontAwesomeIcon :icon="faTwitch" />


            Twitch
          </a>

          <span v-else class="no-twitch">—</span>
        </td>

        <td>{{ formatDate(player.last_updated) }}</td>
      </tr>
    </tbody>
  </table>

  <p v-else>Loading...</p>
</template>

<style scoped>

.ico {
  width: 10px;
  height: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #1e293b;
  border-radius: 10px;
  overflow: hidden;
  color: white;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #334155;
}

th {
  background: #0f172a;
  font-weight: bold;
}

tr:hover {
  background: #243045;
}

a {
  color: #60a5fa;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.twitch-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #a970ff;
  text-decoration: none;
  font-weight: 500;
}

.twitch-link:hover {
  color: #c084fc;
  text-decoration: underline;
}

.twitch-icon {
  width: 16px;
  height: 16px;
}

.no-twitch {
  opacity: 0.4;
}

</style>