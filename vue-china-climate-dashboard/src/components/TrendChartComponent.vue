<template>
  <div class="bg-dark-400 rounded-xl p-5 border border-dark-300 hover:shadow-lg transition-all duration-300">
    <h3 class="text-sm font-medium mb-4">舆情趋势变化</h3>
    <div class="h-64">
      <div ref="trendChart" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { timeTrendData } from '../data/chinaData.js'

export default {
  name: 'TrendChartComponent',
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.trendChart, 'dark')
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(29, 33, 41, 0.9)',
          borderColor: '#4E5969',
          borderWidth: 1,
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          data: timeTrendData.datasets.map(d => d.label),
          textStyle: {
            color: '#86909C'
          },
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: timeTrendData.labels,
          axisLine: {
            lineStyle: {
              color: '#4E5969'
            }
          },
          axisLabel: {
            color: '#86909C'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#4E5969'
            }
          },
          axisLabel: {
            color: '#86909C'
          },
          splitLine: {
            lineStyle: {
              color: '#272E3B'
            }
          }
        },
        series: timeTrendData.datasets.map(dataset => ({
          name: dataset.label,
          type: 'line',
          smooth: true,
          data: dataset.data,
          lineStyle: {
            color: dataset.borderColor,
            width: 2
          },
          itemStyle: {
            color: dataset.borderColor
          },
          areaStyle: {
            color: dataset.backgroundColor
          }
        }))
      }
      
      this.chart.setOption(option)
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize()
        }
      })
    }
  }
}
</script>