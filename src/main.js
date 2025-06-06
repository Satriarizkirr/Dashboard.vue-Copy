import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import BarChart from './components/BarChart.vue';
import PieChart from "./components/PieChart.vue";
import HistoryTable from "./components/HistoryTable.vue";

// Bungkus semuanya di dalam fungsi async
(async () => {
  await store.loadDetections();
  const app = createApp(App);

  app.component('BarChart', BarChart);
  app.component('PieChart', PieChart);
  app.component('HistoryTable', HistoryTable);

  app.use(store);
  app.mount('#app');
})();
