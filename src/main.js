import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import BarChart from './components/BarChart.vue';
import PieChart from "./components/PieChart.vue";
import HistoryTable from "./components/HistoryTable.vue";

// =======================================================
// <<<<< INI DIA KUNCINYA, TAMBAHKAN SATU BARIS INI >>>>>
// Baris ini akan "membangunkan" dan menjalankan file socket.js Anda
import './socket.js';
// =======================================================


// Bungkus semuanya di dalam fungsi async
(async () => {
  // Nama fungsi ini sepertinya `loadDetections` di store Anda, bukan `fetch...`
  // Sesuaikan jika perlu
  await store.loadDetections(); 
  const app = createApp(App);

  app.component('BarChart', BarChart);
  app.component('PieChart', PieChart);
  app.component('HistoryTable', HistoryTable);

  // app.use(store) biasanya tidak diperlukan untuk store simpel berbasis reactive
  // tapi tidak apa-apa jika dibiarkan.
  app.use(store); 
  app.mount('#app');
})();