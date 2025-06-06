<script setup>
import PieChart from './components/PieChart.vue';
import BarChart from './components/BarChart.vue';
import HistoryTable from './components/HistoryTable.vue';
import store from './store.js';
import { exportToCSV } from './utils/exportToCSV.js'; // pastikan lo punya file ini
import { onMounted } from 'vue';

async function handleClearAll() {
  const confirmation = confirm('⚠️ Yakin ingin menghapus semua data deteksi?');
  if (!confirmation) return;

  try {
    await store.clearAllDetections();
    alert('✅ Semua data berhasil dihapus!');
  } catch (err) {
    console.error('❌ Gagal menghapus data:', err);
    alert('❌ Gagal menghapus data!');
  }
}

function handleExport() {
  const data = store.detections;

  if (!data || data.length === 0) {
    alert('⚠️ Tidak ada data deteksi untuk diekspor.');
    return;
  }

  // 🔧 Ambil semua key unik dari objek-objek deteksi
  const headersSet = new Set();
  data.forEach(det => {
    Object.keys(det).forEach(key => headersSet.add(key));
  });
  const headers = Array.from(headersSet);

  // 🔄 Format data baris berdasarkan headers
  const rows = data.map(det => {
    const row = {};
    headers.forEach(header => {
      row[header] = det[header];
    });
    return row;
  });

  exportToCSV('detection_history', headers, rows);
}

onMounted(async() => {
  await store.fetchDetectionsFromServer();
})

</script>

<template>
  <div>
    <h1 class="dashboard-title">
      Realtime Monitoring Dashboard
    </h1>

    <!-- Tombol -->
    <div class="delete-container">
      <button class="export-btn" @click="handleExport">
        <i class="fas fa-file-export"></i>
        Export Data
      </button>
      <button class="delete-all-btn" @click="handleClearAll">
        <i class="fas fa-trash"></i>
        Hapus Semua Deteksi
      </button>
    </div>

    <div class="charts">
      <section class="chart-card" id="bar-chart"> <!-- ✅ ID untuk BarChart -->
        <h3 class="chart-title">Monitoring</h3>
        <BarChart />
      </section>

      <section class="chart-card" id="pie-chart"> <!-- ✅ ID untuk PieChart -->
        <h3 class="chart-title">Damage Class Percentage</h3>
        <PieChart />
      </section>
    </div>

    <section class="image-detail-card" id="detection-history"> <!-- ✅ ID untuk HistoryTable -->
      <HistoryTable v-if="store.detections.length > 0" :detections="store.detections"/>
    </section>
  </div>
</template>

<style scoped>
/* Gaya tetap sama seperti sebelumnya */
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  box-sizing: border-box;
}

.dashboard-title {
  text-align: center;
  color: #000102;
  margin-bottom: 30px;
  font-weight: 700;
  font-size: 2rem;
}

.delete-container {
  text-align: right;
  margin-bottom: 20px;
}

.export-btn {
  background: linear-gradient(45deg, #00b894, #00cec9);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 190, 148, 0.3);
  font-size: 0.9rem;
  margin-right: 10px;
}

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 190, 148, 0.4);
}

.delete-all-btn {
  background: linear-gradient(45deg, #ff4d4d, #ff1a1a);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
  font-size: 0.9rem;
}

.delete-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 77, 77, 0.4);
}

.delete-all-btn i {
  font-size: 1.1em;
}

.charts {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.chart-card {
  flex: 1 1 45%;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.chart-title {
  color: #007bff;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 1.25rem;
}

.image-detail-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
