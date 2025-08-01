<template>
  <div class="bg-dark-400 rounded-xl border border-dark-300 overflow-hidden shadow-lg">
    <div class="p-4 border-b border-dark-300 flex justify-between items-center">
      <h3 class="font-semibold text-lg">全国舆情热度分布</h3>
      <div class="flex items-center gap-2">
        <button 
          class="text-dark-100 hover:text-white transition-colors"
          @click="toggleFullscreen"
        >
          <i class="fa fa-expand"></i>
        </button>
        <button class="text-dark-100 hover:text-white transition-colors">
          <i class="fa fa-download"></i>
        </button>
      </div>
    </div>
    <div class="relative" style="height: 400px;">
      <div 
        ref="chinaMap" 
        class="w-full h-full"
      ></div>
      
      <!-- 热点标记 -->
      <div class="absolute top-[30%] left-[45%] group">
        <div class="w-4 h-4 bg-danger rounded-full animate-pulse relative">
          <div class="absolute -inset-2 bg-danger rounded-full animate-ping opacity-30"></div>
        </div>
        <div class="hidden group-hover:block absolute -top-20 -left-32 bg-dark-400 p-3 rounded-lg border border-dark-300 shadow-lg w-64 z-10 transition-opacity duration-300">
          <h4 class="font-medium text-sm">河南极端降雨事件</h4>
          <p class="text-xs text-dark-100 mt-1">舆情热度: 92</p>
          <div class="flex items-center mt-2 flex-wrap gap-1">
            <span class="bg-danger/20 text-danger text-xs px-2 py-1 rounded">消极 78%</span>
            <span class="bg-warning/20 text-warning text-xs px-2 py-1 rounded">中立 15%</span>
            <span class="bg-success/20 text-success text-xs px-2 py-1 rounded">积极 7%</span>
          </div>
        </div>
      </div>

      <div class="absolute top-[25%] left-[75%] group">
        <div class="w-4 h-4 bg-warning rounded-full animate-pulse relative">
          <div class="absolute -inset-2 bg-warning rounded-full animate-ping opacity-30"></div>
        </div>
        <div class="hidden group-hover:block absolute -top-20 -left-32 bg-dark-400 p-3 rounded-lg border border-dark-300 shadow-lg w-64 z-10 transition-opacity duration-300">
          <h4 class="font-medium text-sm">长三角碳中和政策</h4>
          <p class="text-xs text-dark-100 mt-1">舆情热度: 78</p>
          <div class="flex items-center mt-2 flex-wrap gap-1">
            <span class="bg-danger/20 text-danger text-xs px-2 py-1 rounded">消极 35%</span>
            <span class="bg-warning/20 text-warning text-xs px-2 py-1 rounded">中立 45%</span>
            <span class="bg-success/20 text-success text-xs px-2 py-1 rounded">积极 20%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { chinaProvinceData } from '../data/chinaData.js'

export default {
  name: 'ChinaMapComponent',
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
      this.chart = echarts.init(this.$refs.chinaMap, 'dark')
      
      // 设置中国地图选项
      const option = {
        backgroundColor: 'transparent',
        title: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            if (params.data) {
              return `${params.name}<br/>舆情热度: ${params.data.value}<br/>增长率: +${params.data.trend}%`
            }
            return `${params.name}<br/>暂无数据`
          },
          textStyle: {
            fontSize: 12
          },
          backgroundColor: 'rgba(29, 33, 41, 0.9)',
          borderColor: '#4E5969',
          borderWidth: 1
        },
        visualMap: {
          show: true,
          type: 'piecewise',
          min: 0,
          max: 200,
          left: 'left',
          bottom: 'bottom',
          textStyle: {
            color: '#86909C'
          },
          pieces: [
            { min: 0, max: 50, label: '低热度', color: '#165DFF' },
            { min: 50, max: 100, label: '中低热度', color: '#36CFC9' },
            { min: 100, max: 150, label: '中高热度', color: '#FF7D00' },
            { min: 150, max: 200, label: '高热度', color: '#F53F3F' }
          ]
        },
        series: [
          {
            name: '中国舆情热度',
            type: 'map',
            map: 'china',
            roam: true,
            label: {
              show: true,
              color: '#fff',
              fontSize: 10
            },
            emphasis: {
              label: {
                show: true,
                color: '#fff'
              },
              itemStyle: {
                areaColor: '#722ED1'
              }
            },
            data: this.getMapData()
          }
        ]
      }

      // 注册中国地图（简化版本，实际项目中建议使用官方地图数据）
      this.registerChinaMap()
      
      this.chart.setOption(option)
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize()
        }
      })
    },
    
    getMapData() {
      return chinaProvinceData.map(item => ({
        name: item.name,
        value: item.value,
        trend: item.trend
      }))
    },
    
    registerChinaMap() {
      // 简化的中国地图GeoJSON数据
      const chinaGeoJson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "北京" },
            geometry: {
              type: "Polygon",
              coordinates: [[[116.0, 39.5], [116.5, 39.5], [116.5, 40.0], [116.0, 40.0], [116.0, 39.5]]]
            }
          },
          {
            type: "Feature", 
            properties: { name: "上海" },
            geometry: {
              type: "Polygon",
              coordinates: [[[121.0, 31.0], [121.5, 31.0], [121.5, 31.5], [121.0, 31.5], [121.0, 31.0]]]
            }
          },
          {
            type: "Feature",
            properties: { name: "广东" },
            geometry: {
              type: "Polygon", 
              coordinates: [[[113.0, 23.0], [116.0, 23.0], [116.0, 25.0], [113.0, 25.0], [113.0, 23.0]]]
            }
          },
          {
            type: "Feature",
            properties: { name: "江苏" },
            geometry: {
              type: "Polygon",
              coordinates: [[[118.0, 32.0], [121.0, 32.0], [121.0, 35.0], [118.0, 35.0], [118.0, 32.0]]]
            }
          },
          {
            type: "Feature",
            properties: { name: "浙江" },
            geometry: {
              type: "Polygon", 
              coordinates: [[[119.0, 28.0], [122.0, 28.0], [122.0, 31.0], [119.0, 31.0], [119.0, 28.0]]]
            }
          }
          // 这里只列出几个主要省份作为示例，实际项目中应使用完整的中国地图数据
        ]
      }
      
      echarts.registerMap('china', chinaGeoJson)
    },
    
    toggleFullscreen() {
      this.$emit('fullscreen-toggle')
    }
  }
}
</script>