<template>
  <div class="page-content">
    <div class="mb-6">
      <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">全国气候变化舆情概览</h2>
      <p class="text-dark-100 mt-1">实时监控全国范围内气候变化相关舆情动态与趋势</p>
    </div>

    <!-- 关键指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="实时舆情总量"
        :value="overviewStats.totalSentiment"
        :growth="overviewStats.dailyGrowth"
        icon="fa fa-comments"
        iconColor="primary"
      />
      
      <SentimentCard :sentiment="overviewStats.sentimentDistribution" />
      
      <HotTopicsCard :topics="hotTopics.slice(0, 3)" />
      
      <RegionsCard :regions="overviewStats.topRegions" />
    </div>

    <!-- 数据筛选栏 -->
    <div class="bg-dark-400 rounded-xl p-4 border border-dark-300 shadow-lg mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-dark-100 text-xs">地区:</span>
            <select 
              v-model="filters.region"
              class="bg-dark-300 border border-dark-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="全国">全国</option>
              <option value="华北">华北地区</option>
              <option value="华东">华东地区</option>
              <option value="华南">华南地区</option>
              <option value="华中">华中地区</option>
              <option value="西北">西北地区</option>
              <option value="西南">西南地区</option>
              <option value="东北">东北地区</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-dark-100">时间:</span>
            <select 
              v-model="filters.timeRange"
              class="bg-dark-300 border border-dark-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
              <option value="90d">近90天</option>
              <option value="1y">近1年</option>
              <option value="all">全部</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="bg-dark-300 hover:bg-dark-300/80 text-dark-100 py-1.5 px-3 rounded-lg transition-colors">
            <i class="fa fa-filter mr-1"></i> 高级筛选
          </button>
          <button 
            class="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded-lg transition-colors flex items-center"
            @click="refreshData"
          >
            <i class="fa fa-refresh mr-1"></i> 刷新数据
          </button>
        </div>
      </div>
    </div>

    <!-- 中国地图 -->
    <div class="mb-6">
      <ChinaMapComponent @fullscreen-toggle="showMapFullscreen" />
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <TrendChartComponent />
      <SentimentDistributionComponent />
    </div>

    <!-- 热点文本 -->
    <HotNewsComponent />
  </div>
</template>

<script>
import { overviewStats, hotTopics } from '../data/chinaData.js'
import ChinaMapComponent from './ChinaMapComponent.vue'
import StatsCard from './StatsCard.vue'
import SentimentCard from './SentimentCard.vue'
import HotTopicsCard from './HotTopicsCard.vue'
import RegionsCard from './RegionsCard.vue'
import TrendChartComponent from './TrendChartComponent.vue'
import SentimentDistributionComponent from './SentimentDistributionComponent.vue'
import HotNewsComponent from './HotNewsComponent.vue'

export default {
  name: 'DashboardOverview',
  components: {
    ChinaMapComponent,
    StatsCard,
    SentimentCard, 
    HotTopicsCard,
    RegionsCard,
    TrendChartComponent,
    SentimentDistributionComponent,
    HotNewsComponent
  },
  data() {
    return {
      overviewStats,
      hotTopics,
      filters: {
        region: '全国',
        timeRange: '7d'
      }
    }
  },
  methods: {
    refreshData() {
      // 刷新数据逻辑
      console.log('刷新数据', this.filters)
    },
    showMapFullscreen() {
      // 显示地图全屏
      console.log('显示地图全屏')
    }
  }
}
</script>