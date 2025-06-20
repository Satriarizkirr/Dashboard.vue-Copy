<script setup>
import { ref, onMounted } from 'vue';

const isRunning = ref(false);
const isLoading = ref(false);

// Fungsi untuk mengecek status awal dari server
async function checkStatus() {
  isLoading.value = true; // Langsung set loading saat pengecekan
  try {
    const response = await fetch('http://localhost:5000/api/process-status');
    const data = await response.json();
    isRunning.value = data.is_running;
  } catch (error) {
    console.error("Gagal mengecek status awal:", error);
    isRunning.value = false;
  } finally {
    isLoading.value = false;
  }
}

async function startProcess() {
  isLoading.value = true;
  try {
    const response = await fetch('http://localhost:5000/api/start-process', { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      isRunning.value = true; // Jika sukses, state jadi ON (tombol jadi merah)
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function stopProcess() {
  isLoading.value = true;
  try {
    const response = await fetch('http://localhost:5000/api/stop-process', { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      isRunning.value = false; // Jika sukses, state jadi OFF (tombol jadi abu-abu)
    }
    alert(data.message);
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

onMounted(checkStatus);
</script>

<template>
  <div class="control-panel">
    <button 
      @click="isRunning ? stopProcess() : startProcess()"
      :disabled="isLoading" 
      :class="['control-btn', isRunning ? 'running-state' : 'off-state']"
    >
      <i :class="['fas', isLoading ? 'fa-spinner fa-spin' : (isRunning ? 'fa-stop' : 'fa-play')]"></i>
      <span>{{ isLoading ? 'Memproses...' : (isRunning ? 'Hentikan Mode Otomatis' : 'Mulai Mode Otomatis') }}</span>
    </button>
  </div>
</template>

<style scoped>
.control-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn {
  border: none;
  color: white;
  padding: 10px 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 240px; /* Beri lebar minimum agar tombol tidak 'loncat' saat teks berubah */
  justify-content: center;
}

.control-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.control-btn i {
  font-size: 1em;
}

/* ======================================================= */
/* STYLE DINAMIS BERDASARKAN KONDISI                       */
/* ======================================================= */

/* Style untuk kondisi MATI (Tombol berwarna Abu-abu) */
.off-state {
  background: linear-gradient(45deg, #485461, #2f3640);
  border: 1px solid #808e9b;
}
.off-state:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(128, 142, 155, 0.4);
  transform: translateY(-2px);
}

/* Style untuk kondisi JALAN (Tombol berwarna Merah) */
.running-state {
  background: linear-gradient(45deg, #c0392b, #e74c3c);
  border: 1px solid #ff7979;
}
.running-state:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
  transform: translateY(-2px);
}
</style>