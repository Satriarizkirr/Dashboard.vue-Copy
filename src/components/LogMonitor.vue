<script setup>
// Script tidak diubah
import { ref, watch, nextTick } from 'vue';
import store from '../store.js';
const logContainer = ref(null);
watch(() => store.logs.length, async () => { await nextTick(); if (logContainer.value) { logContainer.value.scrollTop = logContainer.value.scrollHeight; } });
</script>

<template>
  <div ref="logContainer" class="log-container">
    <p v-if="store.logs.length === 0" class="placeholder">Menunggu aktivitas dari server...</p>
    <p v-for="(log, index) in store.logs" :key="index" :class="['log-entry', `log-${log.type || 'INFO'}`]">
      <span class="log-time">[{{ log.time }}]</span>
      <span class="log-message">{{ log.message }}</span>
    </p>
  </div>
</template>

<style scoped>

.log-container {
  background-color: #2e2e2e;
  color: #f0f0f0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  padding: 0px;
  height: 120px;            /* <-- TINGGI PENDEK */
  max-width: 100%;           /* <-- LEBAR DIKECILKAN */
  margin-left: left;        /* <-- Agar ke tengah */
  margin-right: left;       /* <-- Agar ke tengah */
  overflow-y: scroll;
  border-radius: 3px;
  border: 1px solid #444;
}

/* Sisa style di bawah ini sudah benar */
.placeholder { color: #888; }
.log-entry { margin: 0 0 5px 0; padding: 0; line-height: 1.4; display: flex; }
.log-time { margin-right: 10px; color: #999; }
.log-INFO .log-message { color: #f0f0f0; }
.log-DEBUG .log-message { color: #aaa; }
.log-SUCCESS .log-message { color: #86efac; }
.log-WARNING .log-message { color: #facc15; }
.log-ERROR .log-message { color: #f87171; }
.log-CMD .log-message { color: #93c5fd; }
</style>