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

  // 1. Biarkan header dibuat seperti biasa
  const headersSet = new Set(data.flatMap(det => Object.keys(det)));
  let headers = Array.from(headersSet);

  // 2. TAMBAHKAN BARIS INI: Filter header untuk membuang 'image_url'
  const filteredHeaders = headers.filter(header => header !== 'imageurl');

  // 3. Gunakan 'filteredHeaders' yang sudah bersih untuk membuat baris data
  const rows = data.map(det => {
    const row = {};
    filteredHeaders.forEach(header => { // <-- UBAH 'headers' menjadi 'filteredHeaders'
      row[header] = det[header] || '';
    });
    return row;
  });

  exportToCSV('detection_history', filteredHeaders, rows); 
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
    </div>

    <section class="device-control-container">
      <h3 class="section-title">Monitoring Alat</h3>
      <div class="device-control-inner">
        <MasterControl />
        <LogMonitor />
      </div>
      
      <!-- TOMBOL DIPINDAH KE SINI - DI BAWAH MONITORING ALAT -->
      <div class="header-actions-container">
        <div class="header-actions">
          <button class="export-btn" @click="handleExport">
            <i class="fas fa-file-export"></i>
            Export Data
          </button>
          <button class="delete-all-btn" @click="handleClearAll">
            <i class="fas fa-trash"></i>
            Hapus Data
          </button>
        </div>
      </div>
    </section>

    <div class="charts">
      <section class="chart-card">
        <h3 class="chart-title">Monitoring</h3>
        <BarChart />
      </section>
      <section class="chart-card">
        <h3 class="chart-title">Persentase Kelas</h3>
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
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1e293b;
  max-width: 1180px;
  width: 100%;
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 123, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 40px 45px;
  overflow: auto;
  margin-left: auto;
  margin-right: auto;
  position: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.content-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 180, 216, 0.3) 50%, 
    transparent 100%);
}

.dashboard-header {
  margin-bottom: 35px;
  position: relative;
}

.title {
  font-size: 2 rem;
  background: linear-gradient(135deg, #0f172a, #334155, #0ea5e9);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  margin: 0 0 25px 0;
  text-align: center;
  letter-spacing: -0.5px;
  animation: titleGradient 4s ease infinite;
}

@keyframes titleGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Container untuk tombol export & hapus */
.header-actions-container {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(248, 250, 252, 0.8) 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 20px 25px;
  border-radius: 16px;
  box-shadow: 
    0 8px 25px rgba(15, 23, 42, 0.08),
    0 3px 12px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  margin-top: 20px; /* UBAH dari margin-bottom ke margin-top */
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.header-actions-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #0ea5e9 20%, 
    #06b6d4 50%, 
    #0ea5e9 80%, 
    transparent 100%);
  opacity: 0.6;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.export-btn,
.delete-all-btn {
  padding: 14px 28px;
  font-size: 0.95rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 160px;
  justify-content: center;
  box-shadow: 
    0 4px 15px rgba(16, 185, 129, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.export-btn::before,
.delete-all-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent);
  transition: left 0.5s;
}

.export-btn:hover::before,
.delete-all-btn:hover::before {
  left: 100%;
}

.delete-all-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 
    0 4px 15px rgba(239, 68, 68, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.export-btn:hover,
.delete-all-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 8px 25px rgba(16, 185, 129, 0.4),
    0 4px 15px rgba(0, 0, 0, 0.15);
}

.delete-all-btn:hover {
  box-shadow: 
    0 8px 25px rgba(239, 68, 68, 0.4),
    0 4px 15px rgba(0, 0, 0, 0.15);
}

.export-btn:active,
.delete-all-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.section-title {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 18px;
  font-weight: 700;
  font-size: 1.4rem;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  border-radius: 2px;
}

/* Container untuk device control dan log monitor */
.device-control-container {
  margin-bottom: 35px;
}

.device-control-inner {
  display: flex;
  gap: 25px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 
    0 10px 30px rgba(15, 23, 42, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.device-control-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(14, 165, 233, 0.3) 50%, 
    transparent 100%);
}

.device-control-inner > * {
  flex: 1;
}

/* PERBAIKAN UTAMA: Charts berdampingan horizontal */
.charts {
  display: flex;
  flex-direction: row; /* TAMBAHKAN INI - pastikan horizontal */
  gap: 25px;
  margin-bottom: 35px;
  align-items: stretch; /* Chart dengan tinggi yang sama */
}

.chart-card {
  flex: 1; /* Ubah dari flex: 1 1 45% ke flex: 1 untuk sama besar */
  min-width: 0; /* Prevent flex item overflow */
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 
    0 10px 30px rgba(15, 23, 42, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #0ea5e9, #06b6d4, #8b5cf6);
  opacity: 0.7;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 20px 40px rgba(15, 23, 42, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.image-detail-card {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 
    0 10px 30px rgba(15, 23, 42, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.image-detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f59e0b, #d97706, #92400e);
  opacity: 0.7;
}

.chart-title {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 18px;
  font-weight: 700;
  font-size: 1.35rem;
  position: relative;
  padding-left: 15px;
}

.chart-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  border-radius: 2px;
}

/* Responsive Mobile - HANYA DI MOBILE CHART JADI VERTIKAL */
@media (max-width: 768px) {
  .content-box {
    padding: 25px 20px;
    border-radius: 16px;
  }

  .title {
    font-size: 2rem;
    margin-bottom: 20px;
  }

  .header-actions-container {
    padding: 18px 20px;
  }

  .header-actions {
    flex-direction: column;
    gap: 15px;
  }

  .export-btn,
  .delete-all-btn {
    width: 100%;
    min-width: unset;
    padding: 16px 24px;
    font-size: 1rem;
  }

  .device-control-inner {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
  
  .device-control-inner > :nth-child(2) {
    max-height: 250px;
    overflow-y: auto;
  }

  /* DI MOBILE BARU CHARTS JADI VERTIKAL */
  .charts {
    flex-direction: column;
    gap: 25px;
  }

  .chart-card,
  .image-detail-card {
    flex-basis: 100%;
    width: 100%;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .chart-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .content-box {
    padding: 20px 15px;
    border-radius: 12px;
  }

  .title {
    font-size: 1.8rem;
  }

  .header-actions-container {
    padding: 15px 18px;
  }

  .export-btn,
  .delete-all-btn {
    padding: 18px 22px;
    font-size: 0.95rem;
  }

  .device-control-inner,
  .chart-card,
  .image-detail-card {
    padding: 20px;
  }
}

/* Dark mode compatibility */
@media (prefers-color-scheme: dark) {
  .content-box {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #f1f5f9;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .header-actions-container,
  .device-control-inner,
  .chart-card,
  .image-detail-card {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.8) 0%, 
      rgba(51, 65, 85, 0.6) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>