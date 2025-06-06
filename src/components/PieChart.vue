<template>
  <div>
    <apexchart 
      type="pie" 
      :options="chartOptions" 
      :series="chartData"
      height="370"
    />
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import store from "../store.js";

export default {
  name: "PieChart",
  components: {
    apexchart: VueApexCharts
  },
  data() {
    return {
      chartData: [],
      chartOptions: {
        labels: ['Hairline','Struktural','Spalling'],
        legend: {
          position: 'bottom'
        },
        colors: ['#007bff', '#ffc107', '#ff0000'],
        title: {
          align: 'center'
        }
      }
    };
  },
  computed: {
    damagePercentages() {
      return store.damageStats.damagePercentages;
    }
  },
  watch: {
    damagePercentages: {
      handler(newVal) {
        const labels = Object.keys(newVal);
        const values = Object.values(newVal).map(v => parseFloat(v));
        this.chartData = values;
        this.chartOptions.labels = labels;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
/* Optional styling */
</style>