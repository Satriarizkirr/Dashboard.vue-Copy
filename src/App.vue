// File: App.vue (VERSI FINAL YANG BENAR)

<script setup>
import TheHeader from './components/TheHeader.vue';
import Dashboard from './views/Dashboard.vue';
</script>

<template>
  <div class="app-wrapper">
    <TheHeader />

    <Dashboard />

    <footer>© 2025 YOLO Damage Identification System</footer>
  </div>
</template>

<style>
/* STYLE GLOBAL (TANPA SCOPED) 
  Ini adalah style dari <body> dan elemen luar lainnya dari index.html asli
*/
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* Background utama kita taruh di sini */
  background: radial-gradient(circle at top left, #0f2027, #203a43, #2c5364);
  color: #f1f1f1;
}

/* Class ini untuk meniru layout flexbox dari body lama
*/
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  animation: fadeIn 1.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

footer {
  margin-top: 40px;
  color: #ccc;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  opacity: 0.85;
}
</style>