<script setup>
import PieChart from '../components/PieChart.vue';
import BarChart from '../components/BarChart.vue';
import HistoryTable from '../components/HistoryTable.vue';
import store from '../store.js';
import { onMounted } from 'vue';

// =======================================================
// 1. TAMBAHAN: Impor dan Fungsi untuk Tombol Aksi
// =======================================================
import { exportToCSV } from '../utils/exportToCSV.js'; // Pastikan file ini ada

/**
 * Fungsi untuk mengekspor data deteksi ke file CSV.
 */
function handleExport() {
  const data = store.detections;
  if (!data || data.length === 0) {
    alert('⚠️ Tidak ada data deteksi untuk diekspor.');
    return;
  }
  
  // Logika untuk membuat header dan baris CSV
  const headersSet = new Set(data.flatMap(det => Object.keys(det)));
  const headers = Array.from(headersSet);
  const rows = data.map(det => {
    const row = {};
    headers.forEach(header => {
      // Sediakan string kosong jika properti tidak ada
      row[header] = det[header] || ''; 
    });
    return row;
  });

  exportToCSV('detection_history', headers, rows);
}

/**
 * Fungsi untuk menghapus semua data deteksi dari database.
 */
async function handleClearAll() {
  const confirmation = confirm('⚠️ Yakin ingin menghapus semua data deteksi? Aksi ini tidak dapat dibatalkan.');
  if (!confirmation) return;

  try {
    // Pastikan ada fungsi `clearAllDetections` di store/API lo
    await store.clearAllDetections();
    alert('✅ Semua data berhasil dihapus!');
  } catch (err) {
    console.error('❌ Gagal menghapus data:', err);
    alert('❌ Gagal menghapus data!');
  }
}

// Fungsi onMounted tetap sama
onMounted(async() => {
  await store.fetchDetectionsFromServer();
});
</script>

<template>
  <main class="content-box">
    <div class="dashboard-header">
      <h1 class="title">Realtime Monitoring Dashboard</h1>
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
/* Style .content-box dan .charts yang sudah ada */
.content-box {
  background-color: #ffffff;
  color: #222222;
  max-width: 1200px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 30px 40px;
  overflow: auto;
}

/* ======================================================= */
/* PERUBAHAN UTAMA ADA DI SINI                             */
/* ======================================================= */
.dashboard-header {
  /* Hapus semua positioning, jadi div biasa aja */
  margin-bottom: 20px;
}

.title {
  font-size: 2.2rem;
  color: #2c5364;
  font-weight: 700;
  margin: 0;
  /* Judul tetap di tengah */
  text-align: center;
}

.header-actions {
  /* Hapus 'position: absolute' */
  /* Jadikan dia flex container untuk meratakan tombol ke kanan */
  display: flex;
  justify-content: flex-end; /* <-- INI KUNCINYA: Dorong semua isinya ke kanan */
  gap: 10px;

  /* Kasih jarak dari judul di atasnya */
  margin-top: 15px; 
}
/* ======================================================= */


/* Style tombol tidak berubah */
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
}

.export-btn:hover, .delete-all-btn:hover {
  transform: translateY(-1px);
}


/* Sisa style untuk chart dan tabel tidak berubah */
.charts {
  display: flex;
  gap: 20px;
  margin-top: 30px; 
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.chart-card {
  flex: 1 1 45%;
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.chart-title {
    color: #007bff;
    margin-bottom: 10px;
    font-weight: 600;
    font-size: 1.25rem;
}

.image-detail-card {
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>