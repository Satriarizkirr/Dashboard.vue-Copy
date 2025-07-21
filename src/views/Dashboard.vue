<script setup>
// 'computed' ditambahkan untuk logika baru
import { ref, onMounted, computed } from 'vue';
import PieChart from '@/components/PieChart.vue';
import BarChart from '@/components/BarChart.vue';
import HistoryTable from '@/components/HistoryTable.vue';
import store from '@/store.js';
import { exportToCSV } from '@/utils/exportToCSV.js';
import LogMonitor from '@/components/LogMonitor.vue';
import MasterControl from '@/components/DeviceControl.vue';

// State untuk inputan sesi yang sedang berjalan
const currentLocation = ref({
  gedung: '',
  ruangan: ''
});

// State untuk menyimpan SEMUA SESI inspeksi yang sudah selesai
const inspectionSessions = ref([]);

// Kontrol inspeksi terkunci jika lokasi BELUM DIISI
const isInspectionLocked = computed(() => {
  return !currentLocation.value.gedung || !currentLocation.value.ruangan;
});

// Fungsi untuk menyelesaikan inspeksi saat ini dan menyimpannya sebagai sesi
async function finishAndSaveInspection() {
  if (isInspectionLocked.value) {
    alert('⚠️ Harap isi Gedung dan Ruangan untuk sesi ini.');
    return;
  }
  if (store.detections.length === 0) {
    alert('⚠️ Tidak ada data deteksi pada Log Live untuk disimpan.');
    return;
  }

  // Simpan sesi saat ini ke dalam array (sesi baru muncul di paling atas)
  inspectionSessions.value.unshift({ 
    location: { ...currentLocation.value },
    results: [ ...store.detections ], // Copy data dari store
    timestamp: new Date()
  });

  // OTOMATIS kosongkan data live di store
  await store.clearAllDetections();

  // Kosongkan form input untuk persiapan sesi berikutnya
  currentLocation.value.gedung = '';
  currentLocation.value.ruangan = '';

  alert('✅ Sesi inspeksi berhasil disimpan!');
}

// Fungsi untuk mengekspor data dari SESI TERTENTU
function exportSessionData(session) {
  const { location, results } = session;

  const headersSet = new Set(results.flatMap(det => Object.keys(det)));
  const filteredHeaders = Array.from(headersSet).filter(header => header !== 'imageurl');
  const finalHeaders = ['gedung', 'ruangan', ...filteredHeaders];

  const rows = results.map(det => {
    const row = {
      gedung: location.gedung,
      ruangan: location.ruangan
    };
    filteredHeaders.forEach(header => {
      row[header] = det[header] || '';
    });
    return row;
  });

  const filename = `inspeksi_${location.gedung}_${location.ruangan}`.replace(/\s+/g, '_');
  exportToCSV(filename, finalHeaders, rows);
}

// Fungsi untuk menghapus semua riwayat sesi yang tersimpan
async function handleClearAllSessions() {
  if (inspectionSessions.value.length === 0) {
    alert('✅ Riwayat sesi sudah kosong.');
    return;
  }
  const confirmation = confirm('⚠️ Yakin ingin menghapus semua riwayat sesi? Aksi ini tidak dapat dibatalkan.');
  if (!confirmation) return;
  
  inspectionSessions.value = [];
  alert('✅ Semua riwayat sesi berhasil dihapus!');
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
        <MasterControl :disabled="isInspectionLocked" />
        <LogMonitor />
      </div>
      
      <div class="location-input-container">
        <h3 class="section-title">Lokasi Inspeksi</h3>
        <div class="location-inputs">
            <input type="text" v-model="currentLocation.gedung" placeholder="Ketik Nama Gedung...">
            <input type="text" v-model="currentLocation.ruangan" placeholder="Ketik Nama Ruangan...">
        </div>
      </div>

      <div class="header-actions-container">
        <div class="header-actions">
          <button class="save-session-btn" @click="finishAndSaveInspection" :disabled="isInspectionLocked">
            <i class="fas fa-save"></i>
            <span>Selesaikan & Simpan Sesi</span>
          </button>
        </div>
      </div>
    </section>

    <section class="saved-sessions-card">
      <div class="saved-sessions-header">
        <h3 class="section-title">Riwayat Sesi Inspeksi</h3>
        <button class="delete-all-btn" @click="handleClearAllSessions" v-if="inspectionSessions.length > 0">
            <i class="fas fa-trash"></i>
            <span class="btn-text">Hapus Riwayat</span>
        </button>
      </div>
      <div v-if="inspectionSessions.length === 0" class="no-sessions">
        Belum ada sesi yang disimpan.
      </div>
      <div v-else class="sessions-list">
        <div v-for="(session) in inspectionSessions" :key="session.timestamp" class="session-item">
          <div class="session-info">
            <span class="session-title">
              {{ session.location.gedung }} - {{ session.location.ruangan }}
            </span>
            <span class="session-meta">
              {{ session.results.length }} deteksi | {{ session.timestamp.toLocaleString('id-ID') }}
            </span>
          </div>
          <button class="export-session-btn" @click="exportSessionData(session)">
            <i class="fas fa-file-export"></i> 
            <span class="btn-text">Export</span>
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
      <h3 class="section-title">Log Deteksi Live</h3>
      <HistoryTable v-if="store.detections.length > 0" :detections="store.detections"/>
      <div v-else class="no-sessions">
        Log live kosong. Isi lokasi dan mulai inspeksi baru.
      </div>
    </section>
  </main>
</template>

<style scoped>
/* BASE STYLES */
.save-session-btn {
  padding: 14px 28px;
  font-size: 0.95rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  width: auto;
  min-width: 240px;
}
.save-session-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}
.save-session-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
  transform: none;
}
.saved-sessions-card {
  margin-bottom: 35px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0.9));
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.08);
}
.saved-sessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.no-sessions {
  color: #64748b;
  text-align: center;
  padding: 20px 0;
  font-style: italic;
}
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}
.session-item:hover {
  transform: scale(1.015);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}
.session-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.session-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 1.05rem;
}
.session-meta {
  font-size: 0.85rem;
  color: #475569;
}
.export-session-btn {
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.export-session-btn:hover {
  background: #059669;
  transform: translateY(-2px);
}
.saved-sessions-header .delete-all-btn {
  padding: 10px 20px;
  font-size: 0.85rem;
  min-width: auto;
}

.location-input-container {
  margin-top: 35px;
}
.location-inputs {
  display: flex;
  gap: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.location-inputs input {
  flex: 1;
  padding: 14px 18px;
  font-size: 0.95rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background-color: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease-in-out;
}
.location-inputs input:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}
.content-box {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1e293b;
  max-width: 1180px;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 123, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8);
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
  background: linear-gradient(90deg, transparent 0%, rgba(0, 180, 216, 0.3) 50%, transparent 100%);
}
.dashboard-header {
  margin-bottom: 35px;
  position: relative;
}
.title {
  font-size: 2rem;
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
.header-actions-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 20px 25px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.08), 0 3px 12px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  margin-top: 20px;
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
  background: linear-gradient(90deg, transparent 0%, #0ea5e9 20%, #06b6d4 50%, #0ea5e9 80%, transparent 100%);
  opacity: 0.6;
}
.header-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}
.delete-all-btn {
  padding: 14px 28px;
  font-size: 0.95rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
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
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
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
.device-control-container {
  margin-bottom: 35px;
}
.device-control-inner {
  display: flex;
  gap: 25px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}
.device-control-inner > * {
  flex: 1;
}
.charts {
  display: flex;
  flex-direction: row;
  gap: 25px;
  margin-bottom: 35px;
  align-items: stretch;
}
.chart-card {
  flex: 1;
  min-width: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.image-detail-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
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

/* RESPONSIVE STYLES */
/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .content-box {
    padding: 30px 25px;
    border-radius: 16px;
  }
  
  .charts {
    flex-direction: column;
    gap: 20px;
  }
  
  .device-control-inner {
    flex-direction: column;
    gap: 20px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .chart-title {
    font-size: 1.2rem;
  }
}

/* Mobile Large (480px - 768px) */
@media (max-width: 768px) {
  .content-box {
    padding: 20px 15px;
    border-radius: 12px;
    margin: 10px;
  }
  
  .title {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
  
  .chart-title {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  .location-inputs {
    flex-direction: column;
    gap: 15px;
    padding: 20px;
  }
  
  .location-inputs input {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
  
  .save-session-btn {
    min-width: 100%;
    padding: 12px 24px;
    font-size: 0.9rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .saved-sessions-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .delete-all-btn {
    min-width: 100%;
    padding: 12px 24px;
    font-size: 0.9rem;
  }
  
  .session-item {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    padding: 15px;
  }
  
  .session-info {
    gap: 8px;
  }
  
  .session-title {
    font-size: 1rem;
  }
  
  .session-meta {
    font-size: 0.8rem;
  }
  
  .export-session-btn {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }
  
  .device-control-inner,
  .chart-card,
  .image-detail-card,
  .saved-sessions-card,
  .header-actions-container {
    padding: 20px;
  }
  
  .dashboard-header {
    margin-bottom: 25px;
  }
  
  .device-control-container {
    margin-bottom: 25px;
  }
  
  .saved-sessions-card {
    margin-bottom: 25px;
  }
  
  .charts {
    margin-bottom: 25px;
  }
  
  .location-input-container {
    margin-top: 25px;
  }
  
  .header-actions-container {
    margin-top: 15px;
  }
}

/* Mobile Small (320px - 480px) */
@media (max-width: 480px) {
  .content-box {
    padding: 15px 10px;
    margin: 5px;
  }
  
  .title {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .section-title {
    font-size: 1rem;
    margin-bottom: 10px;
    padding-left: 12px;
  }
  
  .section-title::before {
    width: 3px;
    height: 20px;
  }
  
  .chart-title {
    font-size: 1rem;
    margin-bottom: 12px;
    padding-left: 12px;
  }
  
  .location-inputs {
    padding: 15px;
    gap: 12px;
  }
  
  .location-inputs input {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
  
  .save-session-btn {
    padding: 10px 20px;
    font-size: 0.85rem;
    gap: 8px;
  }
  
  .save-session-btn span {
    display: none;
  }
  
  .save-session-btn::after {
    content: 'Simpan';
    font-size: 0.85rem;
  }
  
  .delete-all-btn {
    padding: 10px 20px;
    font-size: 0.85rem;
    gap: 8px;
  }
  
  .delete-all-btn .btn-text {
    display: none;
  }
  
  .delete-all-btn::after {
    content: 'Hapus';
    font-size: 0.85rem;
  }
  
  .export-session-btn {
    padding: 10px 16px;
    font-size: 0.85rem;
    gap: 6px;
  }
  
  .export-session-btn .btn-text {
    display: none;
  }
  
  .session-title {
    font-size: 0.9rem;
    line-height: 1.3;
  }
  
  .session-meta {
    font-size: 0.75rem;
  }
  
  .device-control-inner,
  .chart-card,
  .image-detail-card,
  .saved-sessions-card,
  .header-actions-container {
    padding: 15px;
  }
  
  .no-sessions {
    padding: 15px 0;
    font-size: 0.9rem;
  }
  
  .dashboard-header {
    margin-bottom: 20px;
  }
  
  .device-control-container {
    margin-bottom: 20px;
  }
  
  .saved-sessions-card {
    margin-bottom: 20px;
  }
  
  .charts {
    margin-bottom: 20px;
    gap: 15px;
  }
  
  .location-input-container {
    margin-top: 20px;
  }
}

/* Very Small Mobile (< 320px) */
@media (max-width: 320px) {
  .content-box {
    padding: 12px 8px;
    margin: 3px;
  }
  
  .title {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 0.9rem;
    margin-bottom: 8px;
    padding-left: 10px;
  }
  
  .chart-title {
    font-size: 0.9rem;
    margin-bottom: 10px;
    padding-left: 10px;
  }
  
  .location-inputs {
    padding: 12px;
    gap: 10px;
  }
  
  .location-inputs input {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  
  .save-session-btn,
  .delete-all-btn,
  .export-session-btn {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
  
  .device-control-inner,
  .chart-card,
  .image-detail-card,
  .saved-sessions-card,
  .header-actions-container {
    padding: 12px;
  }
  
  .session-item {
    padding: 12px;
  }
  
  .session-title {
    font-size: 0.85rem;
  }
  
  .session-meta {
    font-size: 0.7rem;
  }
}

/* DARK MODE RESPONSIVE */
@media (prefers-color-scheme: dark) {
  .session-item {
    background: #1e293b;
    border-color: #334155;
  }
  .session-title {
    color: #f1f5f9;
  }
  .session-meta {
    color: #94a3b8;
  }
  .location-inputs {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .location-inputs input {
    background-color: #1e293b;
    border-color: #475569;
    color: #f1f5f9;
  }
  .content-box {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #f1f5f9;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .device-control-inner, .chart-card, .image-detail-card, .saved-sessions-card, .header-actions-container {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* LANDSCAPE ORIENTATION */
@media (orientation: landscape) and (max-height: 600px) {
  .content-box {
    padding: 15px 20px;
  }
  
  .title {
    font-size: 1.4rem;
    margin-bottom: 15px;
  }
  
  .dashboard-header {
    margin-bottom: 20px;
  }
  
  .device-control-container {
    margin-bottom: 20px;
  }
  
  .saved-sessions-card {
    margin-bottom: 20px;
  }
  
  .charts {
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 1rem;
    margin-bottom: 10px;
  }
  
  .chart-title {
    font-size: 1rem;
    margin-bottom: 12px;
  }
}

/* TOUCH IMPROVEMENTS */
@media (hover: none) and (pointer: coarse) {
  .save-session-btn,
  .delete-all-btn,
  .export-session-btn {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  .location-inputs input {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  .session-item {
    min-height: 60px;
  }
  
  .session-item:hover {
    transform: none;
  }
  
  .save-session-btn:hover,
  .export-session-btn:hover {
    transform: none;
  }
}
</style>