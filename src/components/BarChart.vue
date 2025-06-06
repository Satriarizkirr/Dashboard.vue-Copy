<template>
  <div class="p-4">
    <apexchart 
      type="bar" 
      :options="chartOptions" 
      :series="chartSeries"
      height="390"
    />
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import store from "../store.js";

export default {
  name: "BarChart",
  components: {
    apexchart: VueApexCharts
  },
  data() {
    return {
      chartOptions: {
        chart: {
          id: 'damage-bar',
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            distributed: true,
            borderRadius: 6,
            columnWidth: '70%',
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val;
          },
          offsetY: -20,
          style: {
            fontSize: '14px',
            colors: ["#304758"]
          }
        },
        xaxis: {
          categories: ['Hairline', 'Struktural', 'Spalling'],
          labels: {
            style: {
              fontSize: '14px'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Jumlah Deteksi'
          }
        },
        colors: ['#007bff', '#ffc107', '#ff0000'],
        title: {
          text: 'Jumlah Deteksi per Kategori',
          align: 'center',
          style: {
            fontSize: '18px',
            fontWeight: 'bold'
          }
        }
      }
    };
  },
  computed: {
    chartSeries() {
      return [{
        name: 'Jumlah Deteksi',
        data: [
          store.damageStats.damageCounts.hairline || 0,
          store.damageStats.damageCounts.struktural || 0,
          store.damageStats.damageCounts.spalling || 0
        ]
      }];
    }
  }
};
</script>
