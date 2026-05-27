<template>
  <div class="app">

    <header class="header">
      <h1>Hera Invitational Overview</h1>
      <p>Live player ratings</p>

      <nav class="nav">
        <router-link to="/">Home</router-link>
        <router-link to="/ranking">Ranking</router-link>
        <router-link to="/schedule">Schedule</router-link>
        <router-link to="/about">About</router-link>
      </nav>
    </header>

    <main class="content">
      <router-view />
    </main>

  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding: 20px;
  background: #111827;
  border-bottom: 1px solid #1f2937;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.header p {
  margin: 5px 0 10px;
  opacity: 0.7;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.nav a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-active {
  color: #fbbf24;
}

.content {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}
</style>