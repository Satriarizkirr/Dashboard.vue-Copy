<script setup>
// Bagian script ini tidak ada yang diubah sama sekali.
import PieChart from '@/components/PieChart.vue';
import BarChart from '@/components/BarChart.vue';
import HistoryTable from '@/components/HistoryTable.vue';
import store from '@/store.js';
import { onMounted } from 'vue';
import { exportToCSV } from '@/utils/exportToCSV.js';
import LogMonitor from '@/components/LogMonitor.vue';
import MasterControl from '@/components/DeviceControl.vue';

// Semua fungsi di bawah ini tidak diubah
function handleExport() {
  const data = store.detections;
  if (!data || data.length === 0) {
    alert('⚠️ Tidak ada data deteksi untuk diekspor.');
    return;
  }
  const headersSet = new Set(data.flatMap(det => Object.keys(det)));
  const headers = Array.from(headersSet);
  const rows = data.map(det => {
    const row = {};
    headers.forEach(header => {
      row[header] = det[header] || '';
    });
    return row;
  });
  exportToCSV('detection_history', headers, rows);
}
async function handleClearAll() {
  const confirmation = confirm('⚠️ Yakin ingin menghapus semua data deteksi? Aksi ini tidak dapat dibatalkan.');
  if (!confirmation) return;
  try {
    await store.clearAllDetections();
    alert('✅ Semua data berhasil dihapus!');
  } catch (err) {
    console.error('❌ Gagal menghapus data:', err);
    alert('❌ Gagal menghapus data!');
  }
}
onMounted(async() => {
  await store.fetchDetectionsFromServer();
});
</script>

<template>
  <main class="content-box">
    <div class="dashboard-header">
      <h1 class="title">Realtime Monitoring Dashboard</h1>

      <div class="master-control-panel">
        <MasterControl />
      </div>

      <section class="log-monitor-card">
        <LogMonitor />
      </section>

      <div class="header-actions">
        <button class="export-btn" @click="handleExport">
          <i class="fas fa-file-export"></i>
          Export Data
        </button>
        <button class="delete-all-btn" @click="handleClearAll">
          <i class="fas fa-trash"></i>
          Hapus Semua
        </button>
      </div>

    </div>

    <div class="charts">
      <section class="chart-card">
        <h3 class="chart-title">Monitoring</h3>
        <BarChart />
      </section>
      <section class="chart-card">
        <h3 class="chart-title">Damage Class Percentage</h3>
        <PieChart />
      </section>
    </div>

    <section class="image-detail-card">
      <HistoryTable v-if="store.detections.length > 0" :detections="store.detections"/>
    </section>
  </main>
</template>

<style scoped>
.content-box {
  background-color: #ffffff;
  color: #222222;
  max-width: 1180px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 30px 40px;
  overflow: auto;
  margin-left: auto;
  margin-right: auto;
}

.dashboard-header {
  margin-bottom: 20px;
}

.title {
  font-size: 2.2rem;
  color: #2c5364;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

/* Master Control Button */
.master-control-panel {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  margin-bottom: 20px;
}

.log-monitor-card {
  border: 1px solid #e0e0e0;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Tombol export & hapus */
.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.export-btn,
.delete-all-btn {
  padding: 8px 16px;
  font-size: 0.85rem;
  border-radius: 18px;
  background: linear-gradient(45deg, #00b894, #00cec9);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.delete-all-btn {
  background: linear-gradient(45deg, #ff4d4d, #ff1a1a);
}

.export-btn:hover,
.delete-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Charts & history table */
.charts {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.chart-card {
  flex: 1 1 45%;
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.image-detail-card {
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-title {
  color: #007bff;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 1.25rem;
}

/* Responsive Mobile */
@media (max-width: 768px) {
  .content-box {
    padding: 20px 15px;
  }

  .title {
    font-size: 1.6rem;
  }

  .master-control-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 10px;
  }

  .export-btn,
  .delete-all-btn {
    width: 100%;
    justify-content: center;
  }

  .charts {
    flex-direction: column;
    gap: 30px;
  }

  .chart-card,
  .image-detail-card {
    flex-basis: 100%;
    width: 100%;
  }

  .log-monitor-card {
    padding: 15px;
  }
}
</style>
