<script setup lang="ts">
import { onMounted, ref } from "vue";

type Player = {
  name: string;
  game: string;
  rating: number | null;
  twitch: string;
};

const data = ref<Player[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await fetch("/api/scrape");

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const players = await response.json();

    data.value = players;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load player data";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <p v-if="loading">Loading...</p>

    <p v-else-if="error">
      {{ error }}
    </p>

    <div v-else>
      <div
        v-for="player in data"
        :key="player.name"
        style="
          border: 1px solid #ccc;
          padding: 12px;
          margin-bottom: 8px;
        "
      >
        <h3>{{ player.name }}</h3>

        <p>Game: {{ player.game }}</p>

        <p>Rating: {{ player.rating }}</p>

        <a
          :href="player.twitch"
          target="_blank"
        >
          Twitch
        </a>
      </div>
    </div>
  </div>
</template>