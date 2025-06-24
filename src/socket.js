import { io } from "socket.io-client";
import store from "./store"; // Asumsi store.js ada di path yang sama

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server via socket");
  // Kirim log ke dashboard saat berhasil konek
  const welcomeLog = {
    time: new Date().toLocaleTimeString(),
    message: 'Terhubung ke server monitoring.',
    type: 'SUCCESS'
  };
  store.addLog(welcomeLog);
});

socket.on("new_detection", (data) => {
  console.log("Received detection:", data);
  const mappedDetection = {
    id: data.id, // Pastikan ID juga di-map
    detectedAt: data.detected_at,
    className: data.class_,
    confidence: data.confidence,
    imageUrl: data.image_url,
  };
  store.addDetection(mappedDetection);
});

// =======================================================
// === TAMBAHAN UTAMA ADA DI SINI ========================
// =======================================================
/**
 * Listener untuk pesan log real-time dari backend.
 */
socket.on("log_message", (data) => {
  // Langsung panggil fungsi di store untuk menambahkan log
  store.addLog(data);
});

/**
 * Listener saat database dibersihkan.
 * Kita buat log custom di frontend untuk ini.
 */
socket.on("database_cleared", () => {
    const clearLog = {
        time: new Date().toLocaleTimeString(),
        message: '--- Riwayat deteksi telah dibersihkan ---',
        type: 'WARNING'
    };
    store.addLog(clearLog);
});
// =======================================================

export default socket;