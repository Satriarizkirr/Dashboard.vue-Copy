<template>
  <div class="history-table-container">
    <h3 class="history-title">
      <i class="fas fa-list-ul"></i> Detection History
    </h3>
    <div class="table-wrapper">
      <table class="history-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Damage Class</th>
            <th>Confidence Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in formattedDetections" :key="index">
            <td>{{ formatDate(item.timestamp) }}</td>
            <td>
              <span :class="['badge', item.className.toLowerCase()]">
                {{ item.className }}
              </span>
            </td>
            <td>{{ item.confidence }}</td>
            <td>
              <button class="btn-view" @click="showImagePopup(item.imageUrl)">
                <i class="fas fa-eye"></i> View
              </button>
              <a
                class="btn-download"
                :href="`http://localhost:5000/download/${item.filename}`"
                :download="item.filename"
              >
                <i class="fas fa-download"></i> Download
              </a>
            </td>
          </tr>
          <tr v-if="formattedDetections?.length === 0">
            <td colspan="4" class="empty-state">No detection data available.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isPopupVisible" class="image-popup-overlay" @click="closePopup">
      <div class="image-popup-content" @click.stop>
        <button class="close-button" @click="closePopup">&times;</button>
        <img :src="popupImageUrl" alt="Image Preview" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  detections: Array,
});

// State untuk mengontrol popup
const isPopupVisible = ref(false)
const popupImageUrl = ref('')

// untuk menampilkan dan menyembunyikan popup
function showImagePopup(imageUrl) {
  popupImageUrl.value = imageUrl
  isPopupVisible.value = true
}

function closePopup() {
  isPopupVisible.value = false
}

// Disiapkan supaya di template gak ada
const formattedDetections = computed(() => {
  return props.detections?.map((item) => {
    const imageUrl = item.imageUrl || item.image_url || ''
    return {
      timestamp: item.detected_at || item.timestamp || Date.now(),
      className: item.className || item.damageClass || 'Unknown',
      confidence: item.confidence || item.confidenceScore || 0,
      imageUrl,
      filename: imageUrl.split('/').pop() || 'image.jpg',
    }
  })
})

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
/* --- Style yang sudah ada --- */
.history-table-container {
  padding: 1rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 500px; /* Optional: batas maksimal tinggi container */
}

.history-title {
  font-size: 1.25rem;
  color: #007bff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.table-wrapper {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.history-table th,
.history-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.history-table thead th {
  position: sticky;
  top: 0;
  background-color: #f1f1f1;
  z-index: 10; /* dinaikkan agar diatas konten */
}

.badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  font-size: 0.85rem;
  color: white;
  text-transform: capitalize;
}

.badge.hairline {
  background-color: #007bff;
}

.badge.struktural {
  background-color: #ffc107;
  color: #333;
}

.badge.spalling {
  background-color: #ff0707;
  color: #fff;
}

.btn-view,
.btn-download {
  background-color: #17a2b8;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-right: 0.3rem;
  border: none; /* Tambahkan ini untuk button */
  cursor: pointer; /* Tambahkan ini untuk button */
}

.btn-download {
  background-color: #28a745;
}

.btn-view:hover {
  background-color: #138496;
}

.btn-download:hover {
  background-color: #218838;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 1rem;
}

/* --- BARU: Style untuk Popup/Modal --- */
.image-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Harus lebih tinggi dari z-index lainnya */
}

.image-popup-content {
  position: relative;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 28vw;
  max-height: 70vh;
}

.image-popup-content img {
  max-width: 100%;
  max-height:70vh;/* beri sedikit ruang untuk padding & tombol close */
  display: block;
}

.close-button {
  position: absolute;
  top: -15px;
  right: -15px;
  background: white;
  color: #333;
  border: 2px solid #333;
  border-radius: 50%;
  width: 35px;
  height: 35;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
}

.close-button:hover {
  background: #f0f0f0;
}
</style>