<script setup>
// TIDAK ADA LAGI IMPORT MASTER CONTROL DI SINI
</script>

<template>
  <nav class="navbar">
    <div class="nav-brand">
      YOLOV8 IDENTIFICATION SYSTEM
    </div>
    
    </nav>
</template>

<style scoped>

.navbar {
  width: 100%;
  max-width: 1200px;
  background: rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 30px;
  display: flex;
  justify-content: center; 
  align-items: center;
  padding: 15px 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  animation: scaleIn 1.1s ease-in-out;
  gap: 20px;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.nav-brand {
  font-weight: 700;
  font-size: 3rem;
  background: linear-gradient(45deg, #00b4d8, #90e0ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  flex-shrink: 0;
}

@media (max-width: 992px) {
  .navbar {
    flex-direction: column;
    justify-content: center;
    gap: 25px;
  }

  .nav-brand {
    text-align: center;
    font-size: 1.3rem; 
  }
}
</style>