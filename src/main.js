// src/main.js

// Hanya daftarkan Service Worker saat di mode produksi (setelah 'npm run build')
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW PWA registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW PWA registration failed: ', registrationError);
      });
  });
}
import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import BarChart from './components/BarChart.vue';
import PieChart from "./components/PieChart.vue";
import HistoryTable from "./components/HistoryTable.vue";
import './socket.js';



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