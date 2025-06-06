// apiservice.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // Root URL backend
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const apiService = {
  async getDamageStats() {
    // Asumsi endpoint ini ada di backend dan mengembalikan statistik
    // Jika ini sama dengan getDetectionsHistory dan diolah di frontend, bisa disesuaikan
    const response = await apiClient.get('/api/damage-stats'); // Ganti jika perlu
    return response.data;
  },

  // FUNGSI BARU UNTUK MENGAMBIL SEMUA HISTORI DETEKSI
  async getDetectionsHistory() {
    const response = await apiClient.get('/api/detections-history');
    return response.data;
  },

  async getHistoryLogs() { // Jika ini beda dengan getDetectionsHistory, biarkan
    // Mungkin ini untuk log teks, bukan data deteksi utama?
    // Jika sama dengan getDetectionsHistory, bisa dihapus atau disesuaikan
    const response = await apiClient.get('/api/detect'); // Cek endpoint ini, karena /api/detect di backend adalah POST
    return response.data;
  },

  async getImageDetail(id) {
    const response = await apiClient.get(`/api/detect-logs/${id}/image`);
    return response.data;
  },

  async addDamageRecord(record) {
    const response = await apiClient.post('/api/detect-logs', record);
    return response.data;
  },

  async detectDamage(formData) {
    const response = await apiClient.post('/api/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteAllDetections() {
    const response = await apiClient.delete('/api/delete/all');
    return response.data;
  },
};

export default apiService;