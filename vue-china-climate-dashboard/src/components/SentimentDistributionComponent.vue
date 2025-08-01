<template>
  <div class="bg-dark-400 rounded-xl p-5 border border-dark-300 hover:shadow-lg transition-all duration-300">
    <h3 class="text-sm font-medium mb-4">情感倾向分布</h3>
    <div class="h-64">
      <div ref="distributionChart" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SentimentDistributionComponent',
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
      this.chart = echarts.init(this.$refs.distributionChart, 'dark')
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(29, 33, 41, 0.9)',
          borderColor: '#4E5969',
          borderWidth: 1,
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          textStyle: {
            color: '#86909C'
          }
        },
        series: [
          {
            name: '情感分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold',
                color: '#fff'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { 
                value: 45, 
                name: '消极',
                itemStyle: { color: '#F53F3F' }
              },
              { 
                value: 30, 
                name: '中立',
                itemStyle: { color: '#FF7D00' }
              },
              { 
                value: 25, 
                name: '积极',
                itemStyle: { color: '#00B42A' }
              }
            ]
          }
        ]
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