// store.js
import { reactive } from 'vue';
import api from './apiservice.js'; // Pastikan path ini benar

const fixedCategories = ['hairline', 'struktural', 'spalling']; 

const store = reactive({
  detections: [],
  // =======================================================
  // 1. PENAMBAHAN STATE BARU UNTUK MENAMPUNG LOG
  // =======================================================
  logs: [],

  damageStats: {
    damagePercentages: {},
    damageCounts: fixedCategories.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {}),
  },
  isLoading: false,

  // Method loadDetections tidak perlu diubah
  async loadDetections() {
    this.isLoading = true;
    try {
      this._recalculateStats();
      this.isLoading = false;
      return; 
    } catch (e) {
      console.warn("Gagal parse localStorage, akan mengambil dari server...", e);
    }
    await this.fetchDetectionsFromServer();
  },

  // Method fetchDetectionsFromServer tidak perlu diubah
  async fetchDetectionsFromServer() {
    this.isLoading = true;
    try {
      console.log("Fetching detections from server...");
      const dataFromServer = await api.getDetectionsHistory(); 
      this.detections = dataFromServer;
      this._recalculateStats();
      console.log('Detections loaded from server.');
    } catch (err) {
      console.error("Gagal mengambil data deteksi dari server:", err);
    } finally {
        this.isLoading = false;
    }
  },

  // Method addDetection tidak perlu diubah
  addDetection(detection) {
    if (!detection.className && detection.class_) {
        detection.className = detection.class_.toLowerCase();
    } else if (detection.className) {
        detection.className = detection.className.toLowerCase();
    } else {
        console.warn('Detection received without a class name:', detection);
    }

    this.detections.unshift(detection); 
    if (this.detections.length > 100) { 
      this.detections.pop();
    }

    this._recalculateStats();
  },

  // Method clearAllDetections tidak perlu diubah
  async clearAllDetections() {
    this.isLoading = true;
    try {
      await api.deleteAllDetections(); 
      this.detections = []; 
      localStorage.removeItem('detections'); 
      this._recalculateStats();
      console.log('All detections cleared from server and state');
    } catch (err) {
      console.error("Gagal hapus semua data dari server:", err);
    } finally {
      this.isLoading = false;
    }
  },

  // =======================================================
  // 2. PENAMBAHAN FUNGSI BARU UNTUK MENGELOLA LOG
  // =======================================================
  /**
   * Menambahkan pesan log baru ke state.
   * Fungsi ini akan dipanggil oleh socket.js
   */
  addLog(logData) {
    // Tambahkan log baru ke awal array agar tampil di atas
    this.logs.push(logData);

    // Untuk menjaga performa, batasi jumlah log yang disimpan.
    // Jika lebih dari 200, hapus log yang paling lama.
    if (this.logs.length > 200) {
      this.logs.shift(); // .shift() menghapus elemen pertama dari array
    }
  },

  // Method _recalculateStats tidak perlu diubah
  _recalculateStats() {
    const counts = fixedCategories.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    this.detections.forEach(det => {
      const className = (det.className || '').toLowerCase();
      if (fixedCategories.includes(className)) { 
        counts[className]++;
      }
    });

    const totalDetectionsInFixedCategories = fixedCategories.reduce((sum, cat) => sum + (counts[cat] || 0), 0);
    const percentages = {};
    fixedCategories.forEach(cat => {
      percentages[cat] = totalDetectionsInFixedCategories 
                        ? ((counts[cat] / totalDetectionsInFixedCategories) * 100).toFixed(2) 
                        : '0.00';
    });
    
    fixedCategories.forEach(cat => {
        this.damageStats.damageCounts[cat] = counts[cat] || 0;
    });

    this.damageStats.damagePercentages = percentages;
  }
});

export default store;