// store.js
import { reactive } from 'vue';
import api from './apiservice.js'; // Pastikan path ini benar

// 👇 'unknown' DIHAPUS DARI SINI
const fixedCategories = ['hairline', 'struktural', 'spalling']; 

const store = reactive({
  detections: [],
  damageStats: {
    damagePercentages: {},
    // Inisialisasi damageCounts hanya untuk fixedCategories
    damageCounts: fixedCategories.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {}),
  },
  isLoading: false,

  async loadDetections() {
    this.isLoading = true;
    //const savedDetections = localStorage.getItem('detections');
    //if (savedDetections) {
      try {
       // this.detections = JSON.parse(savedDetections);
        this._recalculateStats(); // Akan menghitung ulang hanya untuk 3 kelas
       // console.log('Detections loaded from localStorage.');
        // Pertimbangkan untuk tetap fetch dari server untuk sinkronisasi data terbaru
        // await this.fetchDetectionsFromServer(false); 
        this.isLoading = false;
        return; 
      } catch (e) {
        console.warn("Gagal parse localStorage, akan mengambil dari server...", e);
       // localStorage.removeItem('detections'); 
      }
    //}
    await this.fetchDetectionsFromServer();
  },

  async fetchDetectionsFromServer() {
    this.isLoading = true;
    try {
      console.log("Fetching detections from server...");
      const dataFromServer = await api.getDetectionsHistory(); 
      this.detections = dataFromServer;
      this._recalculateStats(); // Akan menghitung ulang hanya untuk 3 kelas
      //localStorage.setItem('detections', JSON.stringify(this.detections));
      console.log('Detections loaded from server and saved to localStorage.');
    } catch (err) {
      console.error("Gagal mengambil data deteksi dari server:", err);
    } finally {
       this.isLoading = false;
    }
  },

  addDetection(detection) {
    // Normalisasi className
    if (!detection.className && detection.class_) {
        detection.className = detection.class_.toLowerCase();
    } else if (detection.className) {
        detection.className = detection.className.toLowerCase();
    } else {
        // Jika tidak ada className atau class_ sama sekali, kita tidak bisa memprosesnya untuk statistik
        // Mungkin log error atau abaikan untuk statistik, tapi tetap bisa masuk ke this.detections jika perlu
        console.warn('Detection received without a class name:', detection);
        // Beri nilai default agar tidak error di _recalculateStats jika masih ingin dimasukkan ke list
        // detection.className = "unclassified"; // atau biarkan kosong jika akan diabaikan _recalculateStats
    }

    this.detections.unshift(detection); 
    if (this.detections.length > 100) { 
      this.detections.pop();
    }

    this._recalculateStats();
  },

  async clearAllDetections() {
    this.isLoading = true;
    try {
      await api.deleteAllDetections(); 
      this.detections = []; 
      localStorage.removeItem('detections'); 
      this._recalculateStats(); // Stats akan jadi nol semua untuk 3 kelas
      console.log('All detections cleared from server and state');
    } catch (err) {
      console.error("Gagal hapus semua data dari server:", err);
    } finally {
      this.isLoading = false;
    }
  },

  _recalculateStats() {
    // Inisialisasi counts HANYA untuk fixedCategories (sekarang 3 kelas)
    const counts = fixedCategories.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    this.detections.forEach(det => {
      const className = (det.className || '').toLowerCase(); // Jika className undefined/null, jadi string kosong

      // Hanya proses dan hitung jika className ada di dalam fixedCategories
      if (fixedCategories.includes(className)) { 
        // `counts.hasOwnProperty(className)` jadi tidak terlalu krusial di sini
        // karena kita sudah inisialisasi `counts` dengan semua `fixedCategories`
        // dan kita hanya memproses `className` yang ada di `fixedCategories`.
        counts[className]++;
      }
      // Kelas lain yang tidak ada di fixedCategories akan diabaikan
    });

    // Hitung total hanya dari kategori yang kita pedulikan (3 kelas)
    const totalDetectionsInFixedCategories = fixedCategories.reduce((sum, cat) => sum + (counts[cat] || 0), 0);

    const percentages = {};
    fixedCategories.forEach(cat => {
      percentages[cat] = totalDetectionsInFixedCategories 
                         ? ((counts[cat] / totalDetectionsInFixedCategories) * 100).toFixed(2) 
                         : '0.00';
    });
    
    // Update damageCounts (hanya untuk fixedCategories)
    fixedCategories.forEach(cat => {
        this.damageStats.damageCounts[cat] = counts[cat] || 0;
    });

    this.damageStats.damagePercentages = percentages;
    // console.log('Stats recalculated (only fixed categories):', this.damageStats);
  }
});

export default store;