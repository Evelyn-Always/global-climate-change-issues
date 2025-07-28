<!-- 
  本文件为原优化后前端界面的 Vue 3 单文件组件版本，由 Copilot 批量迁移生成。
  将原HTML页面的结构、样式（Tailwind CSS）和交互逻辑转换为Vue 3组件化架构。
  实现了侧边栏、顶部导航、主内容区的组件化拆分，以及各功能页面的按需懒加载。
  所有交互逻辑均使用Vue的响应式数据和事件机制实现。

  使用说明：
  1. 本文件为单文件组件（SFC），包含template、script和style三个部分
  2. 外部依赖：Vue 3、Chart.js、Tailwind CSS、Font Awesome
  3. 可通过CDN或npm包的方式引入依赖
  4. 主要功能页面：数据概览、时间趋势、主题分析、预警中心、时间线、新闻政策、用户讨论、数据分享、AI预测
  5. 支持响应式布局、模态框交互、图表缩放等功能
  
  组件结构：
  - App (根组件)
    - Sidebar (侧边栏导航)
    - Header (顶部导航栏)  
    - MainContent (主内容区)
      - DashboardPage (数据概览页)
      - TrendsPage (时间趋势页)
      - ThemesPage (主题分析页)
      - AlertsPage (预警中心页)
      - TimelinePage (时间线页)
      - NewsPolicyPage (新闻政策页)
      - DiscussionPage (用户讨论页)
      - DownloadSharePage (数据分享页)
      - FutureTopicPage (AI预测页)
    - FullscreenModal (全屏模态框)
    - ChartModal (图表模态框)
-->

<template>
  <div class="bg-dark-500 text-white font-inter antialiased min-h-screen flex flex-col overflow-hidden">
    <div class="flex h-screen">
      <!-- 左侧导航栏组件 -->
      <Sidebar 
        :current-page="currentPage" 
        @navigate="handleNavigation"
        :is-mobile-open="isMobileSidebarOpen"
        @close-mobile="isMobileSidebarOpen = false"
      />

      <!-- 主内容区域 -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- 顶部导航栏组件 -->
        <Header @toggle-mobile-menu="isMobileSidebarOpen = !isMobileSidebarOpen" />

        <!-- 页面内容区域 -->
        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <!-- 动态组件渲染当前页面 -->
          <component :is="currentPageComponent" />
        </div>
      </main>
    </div>

    <!-- 全屏模态框 -->
    <FullscreenModal 
      :is-open="modal.isOpen"
      :title="modal.title"
      :content="modal.content"
      @close="closeModal"
    />

    <!-- 图表放大查看模态框 -->
    <ChartModal
      :is-open="chartModal.isOpen"
      :title="chartModal.title"
      :chart-src="chartModal.chartSrc"
      @close="closeChartModal"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'

// Chart.js will be loaded globally via CDN
// const Chart = window.Chart

// 懒加载页面组件
const DashboardPage = defineAsyncComponent(() => Promise.resolve({
  components: {
    KeyMetricCard,
    HotTopicsCard,
    GlobalHotRegionsCard,
    DataFilterBar,
    GlobalMap,
    TrendChart,
    DistributionChart,
    HotTopicsList
  },
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">全球气候变化舆情概览</h2>
        <p class="text-dark-100 mt-1">实时监控全球范围内气候变化相关舆情动态与趋势</p>
      </div>

      <!-- 关键指标卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KeyMetricCard
          title="实时舆情总量"
          value="128,543"
          icon="fa-comments"
          trend="+12.5%"
          trend-type="success"
          icon-color="primary"
        />
        
        <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-dark-100 text-sm">情感倾向分布</p>
              <div class="flex items-center mt-2">
                <div class="relative w-16 h-16">
                  <canvas ref="sentimentDonutRef"></canvas>
                </div>
                <div class="ml-3">
                  <div class="flex items-center">
                    <span class="w-2 h-2 rounded-full bg-danger mr-1"></span>
                    <span class="text-xs text-dark-100">消极 45%</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-2 h-2 rounded-full bg-warning mr-1"></span>
                    <span class="text-xs text-dark-100">中立 30%</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-2 h-2 rounded-full bg-success mr-1"></span>
                    <span class="text-xs text-dark-100">积极 25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HotTopicsCard />
        <GlobalHotRegionsCard />
      </div>

      <!-- 数据筛选栏 -->
      <DataFilterBar :filters="filters" @update-filters="updateFilters" />

      <!-- 全局地图 -->
      <GlobalMap @expand="openMapModal" />

      <!-- 可放大的网格区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 cursor-zoom-in" @click="openGridModal">
        <TrendChart ref="trendChartRef" />
        <DistributionChart ref="distributionChartRef" />
      </div>

      <!-- 热点文本 -->
      <HotTopicsList />
    </div>
  `,
  setup() {
    const sentimentDonutRef = ref(null)
    const trendChartRef = ref(null)
    const distributionChartRef = ref(null)
    
    const filters = reactive({
      region: '全球',
      timeRange: '近7天'
    })

    const updateFilters = (newFilters) => {
      Object.assign(filters, newFilters)
    }

    const openMapModal = () => {
      // 触发父组件的模态框打开
    }

    const openGridModal = () => {
      // 触发父组件的网格模态框打开
    }

    onMounted(() => {
      // 初始化情感倾向环形图
      if (sentimentDonutRef.value && window.Chart) {
        new Chart(sentimentDonutRef.value, {
          type: 'doughnut',
          data: {
            labels: ['消极', '中立', '积极'],
            datasets: [{
              data: [45, 30, 25],
              backgroundColor: ['#F53F3F', '#FF7D00', '#00B42A'],
              borderWidth: 0,
              cutout: '70%'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.raw}%`;
                  }
                }
              }
            }
          }
        });
      }
    })

    return {
      sentimentDonutRef,
      trendChartRef,
      distributionChartRef,
      filters,
      updateFilters,
      openMapModal,
      openGridModal
    }
  }
}))

// 子组件定义
const KeyMetricCard = {
  props: ['title', 'value', 'icon', 'trend', 'trendType', 'iconColor'],
  template: `
    <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-dark-100 text-sm">{{ title }}</p>
          <h3 class="text-3xl font-bold mt-1">{{ value }}</h3>
        </div>
        <div :class="['bg-' + iconColor + '/10', 'p-2 rounded-lg']">
          <i :class="['fa', icon, 'text-' + iconColor]"></i>
        </div>
      </div>
      <div class="flex items-center text-sm">
        <span :class="['text-' + trendType, 'flex items-center']">
          <i :class="['fa', trend.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down', 'mr-1']"></i> {{ trend }}
        </span>
        <span class="text-dark-100 ml-2">较昨日</span>
      </div>
    </div>
  `
}

const HotTopicsCard = {
  template: `
    <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-dark-100 text-sm">当日热点话题</p>
          <div class="space-y-2 mt-2">
            <div v-for="topic in hotTopics" :key="topic.tag" class="flex items-center">
              <span :class="['bg-' + topic.color + '/10', 'text-' + topic.color, 'text-xs px-2 py-1 rounded mr-2']">#{{ topic.tag }}</span>
              <span class="text-dark-100 text-xs">{{ topic.discussions }} 讨论</span>
            </div>
          </div>
        </div>
        <div class="bg-secondary/10 p-2 rounded-lg">
          <i class="fa fa-fire text-secondary"></i>
        </div>
      </div>
    </div>
  `,
  setup() {
    const hotTopics = [
      { tag: '碳中和', color: 'primary', discussions: '32.4k' },
      { tag: '极端高温', color: 'secondary', discussions: '28.7k' },
      { tag: '碳关税', color: 'accent', discussions: '21.3k' }
    ]
    return { hotTopics }
  }
}

const GlobalHotRegionsCard = {
  template: `
    <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-dark-100 text-sm">全球热点地区</p>
          <div class="mt-2">
            <div v-for="region in regions" :key="region.name" class="flex items-center justify-between" :class="{ 'mt-2': region.name !== '巴西' }">
              <div class="flex items-center">
                <span class="text-sm">{{ region.name }}</span>
              </div>
              <div class="w-24 bg-dark-300 rounded-full h-2">
                <div :class="['bg-' + region.color, 'h-2 rounded-full']" :style="{ width: region.percentage }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-accent/10 p-2 rounded-lg">
          <i class="fa fa-globe text-accent"></i>
        </div>
      </div>
    </div>
  `,
  setup() {
    const regions = [
      { name: '巴西', percentage: '85%', color: 'danger' },
      { name: '美国', percentage: '72%', color: 'warning' },
      { name: '中国', percentage: '65%', color: 'primary' }
    ]
    return { regions }
  }
}

const DataFilterBar = {
  props: ['filters'],
  emits: ['updateFilters'],
  template: `
    <div class="bg-dark-400 rounded-xl p-4 border border-dark-300 shadow-lg mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-dark-100 text-xs">地区:</span>
            <select 
              v-model="localFilters.region"
              @change="updateFilters"
              class="bg-dark-300 border border-dark-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option>全球</option>
              <option>亚洲</option>
              <option>欧洲</option>
              <option>北美洲</option>
              <option>南美洲</option>
              <option>非洲</option>
              <option>大洋洲</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-dark-100">时间:</span>
            <select 
              v-model="localFilters.timeRange"
              @change="updateFilters"
              class="bg-dark-300 border border-dark-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option>近7天</option>
              <option>近30天</option>
              <option>近90天</option>
              <option>近1年</option>
              <option>全部</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="bg-dark-300 hover:bg-dark-300/80 text-dark-100 py-1.5 px-3 rounded-lg transition-colors">
            <i class="fa fa-filter mr-1"></i> 高级筛选
          </button>
          <button class="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded-lg transition-colors flex items-center">
            <i class="fa fa-refresh mr-1"></i> 刷新数据
          </button>
        </div>
      </div>
    </div>
  `,
  setup(props, { emit }) {
    const localFilters = reactive({ ...props.filters })

    const updateFilters = () => {
      emit('updateFilters', localFilters)
    }

    return {
      localFilters,
      updateFilters
    }
  }
}

const GlobalMap = {
  emits: ['expand'],
  template: `
    <div class="bg-dark-400 rounded-xl border border-dark-300 overflow-hidden shadow-lg mb-8 transition-all duration-300">
      <div class="p-4 border-b border-dark-300 flex justify-between items-center">
        <h3 class="font-semibold text-lg">全球舆情热度分布</h3>
        <div class="flex items-center gap-2">
          <button @click="$emit('expand')" class="text-dark-100 hover:text-white transition-colors">
            <i class="fa fa-expand"></i>
          </button>
          <button class="text-dark-100 hover:text-white transition-colors">
            <i class="fa fa-download"></i>
          </button>
        </div>
      </div>
      <div class="h-[calc(100%-60px)] relative" style="padding-top: 50%;">
        <iframe src="optimized_global_heatmap.html" class="absolute inset-0 w-full h-full border-0"></iframe>
        
        <!-- 热点标记 -->
        <div class="absolute top-[30%] left-[25%] group">
          <div class="w-4 h-4 bg-danger rounded-full animate-pulse relative">
            <div class="absolute -inset-2 bg-danger rounded-full animate-ping opacity-30"></div>
          </div>
          <div class="hidden group-hover:block absolute -top-20 -left-32 bg-dark-400 p-3 rounded-lg border border-dark-300 shadow-lg w-64 z-10 transition-opacity duration-300">
            <h4 class="font-medium text-sm">巴西亚马逊森林火灾</h4>
            <p class="text-xs text-dark-100 mt-1">舆情热度: 92</p>
            <div class="flex items-center mt-2 flex-wrap gap-1">
              <span class="bg-danger/20 text-danger text-xs px-2 py-1 rounded">消极 78%</span>
              <span class="bg-warning/20 text-warning text-xs px-2 py-1 rounded">中立 15%</span>
              <span class="bg-success/20 text-success text-xs px-2 py-1 rounded">积极 7%</span>
            </div>
          </div>
        </div>

        <div class="absolute top-[40%] left-[70%] group">
          <div class="w-4 h-4 bg-warning rounded-full animate-pulse relative">
            <div class="absolute -inset-2 bg-warning rounded-full animate-ping opacity-30"></div>
          </div>
          <div class="hidden group-hover:block absolute -top-20 -left-32 bg-dark-400 p-3 rounded-lg border border-dark-300 shadow-lg w-64 z-10 transition-opacity duration-300">
            <h4 class="font-medium text-sm">中国极端降雨事件</h4>
            <p class="text-xs text-dark-100 mt-1">舆情热度: 78</p>
            <div class="flex items-center mt-2 flex-wrap gap-1">
              <span class="bg-danger/20 text-danger text-xs px-2 py-1 rounded">消极 65%</span>
              <span class="bg-warning/20 text-warning text-xs px-2 py-1 rounded">中立 25%</span>
              <span class="bg-success/20 text-success text-xs px-2 py-1 rounded">积极 10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

const TrendChart = {
  template: `
    <div class="bg-dark-400 rounded-xl p-5 border border-dark-300 hover:shadow-lg transition-all duration-300">
      <h3 class="text-sm font-medium mb-4">舆情趋势变化</h3>
      <div class="h-64">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  `,
  setup() {
    const chartRef = ref(null)

    onMounted(() => {
      if (chartRef.value && window.Chart) {
        new Chart(chartRef.value, {
          type: 'line',
          data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
            datasets: [{
              label: '舆情数量',
              data: [1200, 1900, 1700, 2100, 2500, 2300, 2800],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
              x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
          }
        });
      }
    })

    return { chartRef }
  }
}

const DistributionChart = {
  template: `
    <div class="bg-dark-400 rounded-xl p-5 border border-dark-300 hover:shadow-lg transition-all duration-300">
      <h3 class="text-sm font-medium mb-4">情感倾向分布</h3>
      <div class="h-64">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  `,
  setup() {
    const chartRef = ref(null)

    onMounted(() => {
      if (chartRef.value && window.Chart) {
        new Chart(chartRef.value, {
          type: 'doughnut',
          data: {
            labels: ['消极', '中立', '积极'],
            datasets: [{
              data: [45, 30, 25],
              backgroundColor: ['#44dbef', 'rgba(135,95,202,0.9)', '#6cd6b3'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
    })

    return { chartRef }
  }
}

const HotTopicsList = {
  template: `
    <div class="bg-dark-400 rounded-xl border border-dark-300 overflow-hidden shadow-lg mb-6">
      <div class="p-4 border-b border-dark-300 flex justify-between items-center">
        <h3 class="font-semibold text-lg">最新热点文本</h3>
        <div class="flex items-center gap-2">
          <button class="text-dark-100 hover:text-white transition-colors">
            <i class="fa fa-refresh"></i>
          </button>
        </div>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="topic in hotTopics" :key="topic.id" class="bg-dark-300/50 rounded-lg p-3 hover:bg-dark-300/70 transition-colors cursor-pointer">
            <div class="flex items-center mb-2">
              <div :class="['bg-' + topic.iconColor + '/20', 'w-8 h-8 rounded-full flex items-center justify-center mr-2']">
                <i :class="['fa', topic.icon, 'text-' + topic.iconColor]"></i>
              </div>
              <div>
                <h4 class="font-medium text-sm">{{ topic.title }}</h4>
                <p class="text-xs text-dark-100">{{ topic.date }} · {{ topic.category }}</p>
              </div>
            </div>
            <p class="text-sm text-dark-100">{{ topic.description }}</p>
            <div class="flex justify-between items-center mt-2">
              <div class="flex items-center">
                <span v-for="tag in topic.tags" :key="tag.name" :class="['bg-' + tag.color + '/10', 'text-' + tag.color, 'text-xs px-2 py-1 rounded ml-1 first:ml-0']">{{ tag.name }}</span>
              </div>
              <div class="flex items-center gap-2 text-dark-100 text-xs">
                <span><i class="fa fa-eye mr-1"></i> {{ topic.views }}</span>
                <span><i class="fa fa-comment mr-1"></i> {{ topic.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const hotTopics = [
      {
        id: 1,
        title: '人民日报：中国发布《2025年应对气候变化国家报告》',
        date: '2025-07-15',
        category: '政策讨论',
        description: '报告显示，中国在过去五年中碳排放强度下降了18%，可再生能源占比提高至42%，森林碳汇能力显著增强...',
        icon: 'fa-newspaper-o',
        iconColor: 'primary',
        tags: [
          { name: '碳中和', color: 'primary' },
          { name: '可再生能源', color: 'secondary' }
        ],
        views: '2.4k',
        comments: '328'
      },
      {
        id: 2,
        title: '联合国秘书长：全球气候危机已达临界点，需立即行动',
        date: '2025-07-14',
        category: '国际合作',
        description: '在最新的联合国气候峰会上，秘书长强调全球气温上升速度超过预期，呼吁各国加强合作，加大减排力度...',
        icon: 'fa-twitter',
        iconColor: 'danger',
        tags: [
          { name: '气候峰会', color: 'danger' },
          { name: '减排目标', color: 'warning' }
        ],
        views: '5.7k',
        comments: '842'
      }
    ]

    return { hotTopics }
  }
}

// 图表组件
const ChartSection = {
  props: ['title', 'chartSrc', 'chartId', 'height', 'withSelect', 'selectOptions'],
  emits: ['expand'],
  template: `
    <div class="bg-dark-400 rounded-xl border border-dark-300 overflow-hidden shadow-lg mb-6">
      <div class="p-4 border-b border-dark-300 flex justify-between items-center">
        <h3 class="font-semibold text-lg">{{ title }}</h3>
        <div class="flex items-center gap-3">
          <div v-if="withSelect" class="relative">
            <select class="bg-dark-300 border border-dark-200 rounded-lg py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option v-for="option in selectOptions" :key="option">{{ option }}</option>
            </select>
          </div>
          <div class="flex items-center border border-dark-200 rounded-lg overflow-hidden">
            <button @click="resizeChart(0.9)" class="bg-dark-300 text-dark-100 hover:text-white px-2 py-1 transition-colors">
              <i class="fa fa-search-minus"></i>
            </button>
            <button @click="resetChart()" class="bg-dark-300 text-dark-100 hover:text-white px-2 py-1 transition-colors">
              <i class="fa fa-compress"></i>
            </button>
            <button @click="resizeChart(1.1)" class="bg-dark-300 text-dark-100 hover:text-white px-2 py-1 transition-colors">
              <i class="fa fa-search-plus"></i>
            </button>
          </div>
          <button @click="$emit('expand', { title, chartSrc })" class="text-dark-100 hover:text-white transition-colors hover:bg-dark-300/50 p-1.5 rounded-full">
            <i class="fa fa-expand"></i>
          </button>
          <button class="text-dark-100 hover:text-white transition-colors hover:bg-dark-300/50 p-1.5 rounded-full">
            <i class="fa fa-download"></i>
          </button>
        </div>
      </div>
      <div class="p-4 relative">
        <iframe :id="chartId" :src="chartSrc" :style="{ height: height + 'px' }" class="w-full border-0 transition-all duration-300"></iframe>
      </div>
    </div>
  `,
  methods: {
    resizeChart(scale) {
      const element = document.getElementById(this.chartId)
      if (element) {
        const currentHeight = parseInt(element.style.height) || this.height
        const newHeight = Math.max(200, Math.min(800, currentHeight * scale))
        element.style.height = newHeight + 'px'
      }
    },
    resetChart() {
      const element = document.getElementById(this.chartId)
      if (element) {
        element.style.height = this.height + 'px'
      }
    }
  }
}

const HotTopicsDetail = {
  template: `
    <div class="bg-dark-400 rounded-xl border border-dark-300 overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <div class="p-4 border-b border-dark-300 flex flex-wrap justify-between items-center gap-3">
        <h3 class="font-semibold text-lg flex items-center">
          <i class="fa fa-fire text-warning mr-2"></i>热门主题详情
        </h3>
        <div class="flex items-center gap-3">
          <select class="bg-dark-300 border border-dark-200 rounded-lg py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option>按热度排序</option>
            <option>按增长速度</option>
            <option>按讨论时长</option>
          </select>
          <button class="text-dark-100 hover:text-white transition-colors hover:bg-dark-300/50 p-1.5 rounded-full">
            <i class="fa fa-refresh"></i>
          </button>
        </div>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="topic in topicDetails" :key="topic.id" class="bg-dark-300/20 rounded-xl p-4 border border-dark-300 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 group">
            <div class="flex items-center mb-3">
              <span :class="['bg-' + topic.color + '/10', 'text-' + topic.color, 'text-xs px-2.5 py-1 rounded-full font-medium']">
                #{{ topic.tag }}
              </span>
              <span class="ml-auto bg-dark-300/50 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                <i :class="['fa fa-bolt text-' + topic.color, 'mr-1']"></i>热度: {{ topic.heat }}
              </span>
            </div>
            <p class="text-sm text-dark-100 mb-3 leading-relaxed">{{ topic.description }}</p>
            <div class="mb-3">
              <div class="flex justify-between text-xs text-dark-100 mb-1.5">
                <span>情感分布</span>
                <span class="font-medium">积极{{ topic.sentiment.positive }}% 中立{{ topic.sentiment.neutral }}% 消极{{ topic.sentiment.negative }}%</span>
              </div>
              <div class="w-full bg-dark-300/50 rounded-full h-2.5 overflow-hidden flex">
                <div class="bg-success h-full transition-all duration-1000" :style="{ width: topic.sentiment.positive + '%' }"></div>
                <div class="bg-warning h-full transition-all duration-1000" :style="{ width: topic.sentiment.neutral + '%' }"></div>
                <div class="bg-danger h-full transition-all duration-1000" :style="{ width: topic.sentiment.negative + '%' }"></div>
              </div>
            </div>
            <div class="flex justify-between items-center text-xs text-dark-100 pt-1 border-t border-dark-300/50">
              <span class="flex items-center hover:text-white transition-colors">
                <i class="fa fa-comment mr-1.5"></i> {{ topic.discussions }} 讨论
              </span>
              <span :class="['flex items-center font-medium', topic.trend > 0 ? 'text-success' : 'text-danger']">
                <i :class="['fa', topic.trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down', 'mr-1.5']"></i> {{ Math.abs(topic.trend) }}%
              </span>
            </div>
          </div>
        </div>
        <div class="mt-5 text-center">
          <button class="inline-flex items-center px-4 py-2 bg-dark-300/30 hover:bg-dark-300/50 text-white text-sm rounded-lg transition-all duration-200">
            查看更多热门主题
            <i class="fa fa-chevron-right ml-2 text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  setup() {
    const topicDetails = [
      {
        id: 1,
        tag: '碳中和',
        color: 'primary',
        heat: 92,
        description: '全球各国碳中和政策进展与实施效果讨论，包括减排目标、政策工具和实施路径等。',
        sentiment: { positive: 32, neutral: 38, negative: 30 },
        discussions: '32.4k',
        trend: 12.5
      },
      {
        id: 2,
        tag: '极端高温',
        color: 'warning',
        heat: 87,
        description: '全球范围内极端高温事件的报道与讨论，包括对生态系统、人类健康和社会经济的影响。',
        sentiment: { positive: 15, neutral: 25, negative: 60 },
        discussions: '28.7k',
        trend: 23.2
      },
      {
        id: 3,
        tag: '碳关税',
        color: 'accent',
        heat: 79,
        description: '关于碳边境调节机制(CBAM)等碳关税政策的讨论，包括国际贸易影响和公平性争议。',
        sentiment: { positive: 20, neutral: 25, negative: 55 },
        discussions: '21.3k',
        trend: 8.7
      }
    ]

    return { topicDetails }
  }
}
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">舆情时间趋势分析</h2>
        <p class="text-dark-100 mt-1">分析气候变化相关舆情随时间的发展趋势与规律</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧筛选面板 -->
        <FilterPanel :filters="filters" @update="updateFilters" />

        <!-- 右侧时间趋势图 -->
        <div class="lg:col-span-3 bg-dark-400 rounded-xl border border-dark-300 overflow-hidden shadow-lg">
          <div class="p-4 border-b border-dark-300 flex justify-between items-center">
            <h3 class="font-semibold text-lg">舆情热度时间趋势</h3>
            <ChartControls @expand="$emit('expand-chart')" @download="downloadChart" />
          </div>
          <div class="p-4 h-[650px]">
            <iframe src="舆情热度时间趋势图2.html" class="w-full h-full border-0"></iframe>
          </div>
        </div>
      </div>

      <!-- 热点词云 -->
      <WordCloudSection />
    </div>
  `,
  setup() {
    const filters = reactive({
      timeRange: '近1周',
      topics: ['政策讨论', '影响评估', '应对措施', '科学研究', '国际合作'],
      region: '全球',
      sentiment: ['消极', '中立', '积极']
    })

    const updateFilters = (newFilters) => {
      Object.assign(filters, newFilters)
    }

    const downloadChart = () => {
      // 下载图表逻辑
    }

    return {
      filters,
      updateFilters,
      downloadChart
    }
  }
}))

const ThemesPage = defineAsyncComponent(() => Promise.resolve({
  components: {
    ChartSection,
    HotTopicsDetail
  },
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">主题与情感分析</h2>
        <p class="text-dark-100 mt-1">深入分析气候变化相关舆情的主题分布与情感倾向</p>
      </div>

      <!-- 话题分类占比堆叠图 -->
      <ChartSection
        title="话题分类占比"
        chart-src="堆叠图4.html"
        chart-id="stacked-chart"
        :height="500"
        @expand="expandChart"
      />

      <!-- 情感倾向分布图和饼状图 -->
      <div class="space-y-8">
        <div class="flex flex-col gap-6">
          <ChartSection
            title="情感倾向分布"
            chart-src="情感5.html"
            chart-id="sentiment-chart"
            :height="440"
            :with-select="true"
            :select-options="['按地区', '按话题', '按时间']"
            @expand="expandChart"
          />

          <ChartSection
            title="气候变化主题分布"
            chart-src="饼图3.html"
            chart-id="pie-chart"
            :height="440"
            @expand="expandChart"
          />
        </div>

        <!-- 主题详情分析 -->
        <HotTopicsDetail />
      </div>
    </div>
  `,
  setup() {
    const expandChart = (chartInfo) => {
      // 触发图表放大模态框
    }

    return {
      expandChart
    }
  }
}))

const AlertsPage = defineAsyncComponent(() => Promise.resolve({
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">舆情预警中心</h2>
        <p class="text-dark-100 mt-1">实时监控异常舆情波动，提供预警信息</p>
      </div>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左侧预警列表 -->
        <AlertsList :alerts="alerts" />

        <!-- 右侧预警设置 -->
        <AlertSettings :settings="alertSettings" @update="updateAlertSettings" />
      </section>
    </div>
  `,
  setup() {
    const alerts = ref([
      {
        id: 1,
        type: 'heat-surge',
        title: '巴西亚马逊森林火灾舆情热度激增',
        description: '过去24小时内，巴西亚马逊森林火灾相关讨论量增长了320%，达到52.3k条',
        time: '2025-07-16 12:30',
        intensity: 92,
        sentiment: { negative: 78, neutral: 15, positive: 7 }
      }
    ])

    const alertSettings = reactive({
      heatThreshold: 200,
      sentimentThreshold: 40,
      discussionThreshold: 10,
      topics: ['森林火灾', '极端天气', '碳关税政策', '可再生能源'],
      notifications: ['系统内通知', '邮件提醒']
    })

    const updateAlertSettings = (newSettings) => {
      Object.assign(alertSettings, newSettings)
    }

    return {
      alerts,
      alertSettings,
      updateAlertSettings
    }
  }
}))

const TimelinePage = defineAsyncComponent(() => Promise.resolve({
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">全球气候事件时间线</h2>
        <p class="text-dark-100 mt-1">展示全球重大气候事件的时间发展脉络</p>
      </div>

      <TimelineEvents :events="events" :selected-year="selectedYear" @year-change="selectedYear = $event" />
    </div>
  `,
  setup() {
    const selectedYear = ref('2025')
    const events = ref([
      {
        id: 1,
        date: '2025-07-10',
        title: '巴西亚马逊森林大火爆发',
        description: '亚马逊雨林再次遭受大规模火灾，过火面积超过50万公顷，引发全球关注和环保抗议。',
        type: 'emergency',
        icon: 'fa-fire',
        tags: ['紧急事件', '环境灾害']
      }
    ])

    return {
      selectedYear,
      events
    }
  }
}))

const NewsPolicyPage = defineAsyncComponent(() => Promise.resolve({
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">新闻政策聚合</h2>
        <p class="text-dark-100 mt-1">聚合全球最新气候新闻和政策动态</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <NewsList :news="news" :active-filter="newsFilter" @filter-change="newsFilter = $event" />
        </div>

        <PolicyTracker :policies="policies" />
      </div>
    </div>
  `,
  setup() {
    const newsFilter = ref('全部')
    const news = ref([])
    const policies = ref([])

    return {
      newsFilter,
      news,
      policies
    }
  }
}))

const DiscussionPage = defineAsyncComponent(() => Promise.resolve({
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">用户讨论区</h2>
        <p class="text-dark-100 mt-1">参与气候变化话题讨论，分享观点和见解</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <DiscussionForm @submit="submitDiscussion" />
          <DiscussionList :discussions="discussions" :sort="discussionSort" @sort-change="discussionSort = $event" />
        </div>

        <div class="space-y-6">
          <ActiveUsers :users="activeUsers" />
          <HotTopics :topics="hotTopics" />
        </div>
      </div>
    </div>
  `,
  setup() {
    const discussionSort = ref('最新')
    const discussions = ref([])
    const activeUsers = ref([])
    const hotTopics = ref([])

    const submitDiscussion = (discussion) => {
      discussions.value.unshift(discussion)
    }

    return {
      discussionSort,
      discussions,
      activeUsers,
      hotTopics,
      submitDiscussion
    }
  }
}))

const DownloadSharePage = defineAsyncComponent(() => Promise.resolve({
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">数据下载与分享</h2>
        <p class="text-dark-100 mt-1">下载分析数据或分享至社交平台</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DownloadSection :downloads="downloads" @download="handleDownload" />
        <ShareSection :share-options="shareOptions" @share="handleShare" />
      </div>
    </div>
  `,
  setup() {
    const downloads = ref([])
    const shareOptions = ref([])

    const handleDownload = (item) => {
      // 处理下载逻辑
    }

    const handleShare = (platform) => {
      // 处理分享逻辑
    }

    return {
      downloads,
      shareOptions,
      handleDownload,
      handleShare
    }
  }
}))

const FutureTopicPage = defineAsyncComponent(() => Promise.resolve({
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">AI话题预测</h2>
        <p class="text-dark-100 mt-1">基于AI模型预测未来气候热门话题趋势</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <PredictionChart :prediction-range="predictionRange" @range-change="predictionRange = $event" />
          <PredictionDetails :predictions="predictions" />
        </div>

        <div class="space-y-6">
          <ModelInfo :model="modelInfo" />
          <TrendIndicators :indicators="trendIndicators" />
        </div>
      </div>
    </div>
  `,
  setup() {
    const predictionRange = ref('未来30天')
    const predictions = ref([])
    const modelInfo = ref({})
    const trendIndicators = ref({})

    return {
      predictionRange,
      predictions,
      modelInfo,
      trendIndicators
    }
  }
}))

// 侧边栏组件
const Sidebar = {
  props: ['currentPage', 'isMobileOpen'],
  emits: ['navigate', 'closeMobile'],
  template: `
    <!-- 桌面端侧边栏 -->
    <aside class="w-48 bg-dark-400 border-r border-dark-300 flex-shrink-0 hidden md:block transition-all duration-300 z-40">
      <SidebarContent :current-page="currentPage" @navigate="$emit('navigate', $event)" />
    </aside>

    <!-- 移动端侧边栏 -->
    <div v-show="isMobileOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div 
        class="absolute top-0 left-0 bottom-0 w-64 bg-dark-400 transform transition-transform duration-300"
        :class="{ '-translate-x-full': !isMobileOpen }"
        @click.stop
      >
        <SidebarContent :current-page="currentPage" @navigate="handleMobileNavigate" />
      </div>
    </div>
  `,
  methods: {
    handleMobileNavigate(page) {
      this.$emit('navigate', page)
      this.$emit('closeMobile')
    }
  }
}

// 侧边栏内容组件
const SidebarContent = {
  props: ['currentPage'],
  emits: ['navigate'],
  template: `
    <!-- Logo 和标题 -->
    <div class="flex items-center space-x-2 p-4 border-b border-dark-300">
      <div class="bg-primary/20 p-2 rounded-lg">
        <i class="fa fa-line-chart text-primary text-xl"></i>
      </div>
      <h1 class="text-lg font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
        气候变化舆情分析平台
      </h1>
    </div>

    <!-- 导航菜单 -->
    <nav class="py-4 w-48">
      <ul class="space-y-1 px-2">
        <li v-for="item in navigationItems" :key="item.id">
          <a 
            href="#" 
            @click.prevent="$emit('navigate', item.id)"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
              currentPage === item.id 
                ? 'nav-active bg-primary/10 text-primary border-l-4 border-primary' 
                : 'text-dark-100 hover:bg-dark-300/50'
            ]"
          >
            <i :class="['fa', item.icon, 'w-5 text-center']"></i>
            <span class="text-sm">{{ item.label }}</span>
          </a>
        </li>
      </ul>

      <div class="mt-8 px-4">
        <h3 class="text-xs uppercase text-dark-100 font-semibold px-4 mb-2">系统</h3>
        <ul class="space-y-1 px-2">
          <li>
            <a href="#" class="flex items-center space-x-3 px-4 py-2 rounded-lg text-dark-100 hover:bg-dark-300/50 transition-all">
              <i class="fa fa-cog w-5 text-center"></i>
              <span class="text-sm">设置</span>
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center space-x-3 px-4 py-2 rounded-lg text-dark-100 hover:bg-dark-300/50 transition-all">
              <i class="fa fa-question-circle w-5 text-center"></i>
              <span class="text-sm">帮助中心</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 底部用户信息 -->
    <div class="absolute bottom-0 left-0 right-0 border-t border-dark-300 p-2">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary mr-3"></div>
        <div class="hidden md:block ml-2">
          <p class="text-xs font-medium">管理员</p>
          <p class="text-[10px] text-dark-100">admin@example.com</p>
        </div>
        <button class="ml-auto p-1 rounded hover:bg-dark-300/50 transition-colors">
          <i class="fa fa-cog text-dark-100 text-sm"></i>
        </button>
      </div>
    </div>
  `,
  setup() {
    const navigationItems = [
      { id: 'dashboard', label: '数据概览', icon: 'fa-dashboard' },
      { id: 'trends', label: '时间趋势', icon: 'fa-line-chart' },
      { id: 'themes', label: '主题分析', icon: 'fa-tags' },
      { id: 'alerts', label: '预警中心', icon: 'fa-bell' },
      { id: 'timeline', label: '气候时间线', icon: 'fa-history' },
      { id: 'news-policy', label: '新闻政策', icon: 'fa-newspaper-o' },
      { id: 'discussion', label: '用户讨论', icon: 'fa-comments' },
      { id: 'download-share', label: '数据分享', icon: 'fa-download' },
      { id: 'future-topic', label: 'AI预测', icon: 'fa-magic' }
    ]

    return {
      navigationItems
    }
  }
}

// 顶部导航栏组件
const Header = {
  emits: ['toggleMobileMenu'],
  template: `
    <header class="h-16 bg-dark-400 border-b border-dark-300 flex items-center justify-between px-6 z-30">
      <!-- 移动端菜单按钮 -->
      <button 
        class="md:hidden p-2 rounded-md hover:bg-dark-300/50 transition-colors" 
        @click="$emit('toggleMobileMenu')"
      >
        <i class="fa fa-bars text-dark-100"></i>
      </button>

      <!-- 数据状态 -->
      <div class="hidden md:flex items-center gap-2 text-dark-100">
        <span class="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span>数据实时更新中</span>
      </div>

      <!-- 右侧工具栏 -->
      <div class="flex items-center space-x-4">
        <div class="relative">
          <input 
            type="text" 
            placeholder="搜索..." 
            v-model="searchQuery"
            class="bg-dark-300 border border-dark-200 rounded-lg py-1.5 pl-8 pr-3 w-40 lg:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
          <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-dark-100 text-sm"></i>
        </div>

        <button class="p-2 rounded-full hover:bg-dark-300/50 transition-colors relative">
          <i class="fa fa-bell-o text-dark-100"></i>
          <span class="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
      </div>
    </header>
  `,
  setup() {
    const searchQuery = ref('')

    return {
      searchQuery
    }
  }
}

// 全屏模态框组件
const FullscreenModal = {
  props: ['isOpen', 'title', 'content'],
  emits: ['close'],
  template: `
    <div 
      v-show="isOpen"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 transition-opacity duration-300"
      :class="{ 'opacity-0 pointer-events-none': !isOpen }"
      @click="$emit('close')"
    >
      <div 
        class="relative w-full max-w-5xl max-h-[90vh] bg-dark-400 rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-300"
        :class="{ 'scale-95': !isOpen, 'scale-100': isOpen }"
        @click.stop
      >
        <div class="p-4 border-b border-dark-300 flex justify-between items-center">
          <h3 class="font-semibold text-lg">{{ title }}</h3>
          <button @click="$emit('close')" class="text-dark-100 hover:text-white transition-colors p-2">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="p-6 h-[calc(100%-60px)] overflow-auto" v-html="content">
        </div>
      </div>
    </div>
  `
}

// 图表模态框组件
const ChartModal = {
  props: ['isOpen', 'title', 'chartSrc'],
  emits: ['close'],
  template: `
    <div 
      v-show="isOpen"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-0 m-0 transition-all duration-300"
      :class="{ 'opacity-0 pointer-events-none': !isOpen }"
      @click="$emit('close')"
    >
      <div class="bg-dark-400 rounded-xl w-[96vw] h-[96vh] max-w-none max-h-none flex flex-col" @click.stop>
        <div class="p-3 border-b border-dark-300 flex justify-between items-center bg-dark-400/95 backdrop-blur-sm z-10">
          <h3 class="font-semibold text-lg">{{ title }}</h3>
          <button @click="$emit('close')" class="text-dark-100 hover:text-white transition-colors p-1.5 rounded-full">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="flex-1 p-3">
          <iframe v-if="chartSrc" :src="chartSrc" class="w-full h-full border-0 rounded"></iframe>
        </div>
      </div>
    </div>
  `
}

export default {
  name: 'ClimateAnalysisDashboard',
  components: {
    Sidebar,
    SidebarContent,
    Header,
    FullscreenModal,
    ChartModal,
    DashboardPage,
    TrendsPage,
    ThemesPage,
    AlertsPage,
    TimelinePage,
    NewsPolicyPage,
    DiscussionPage,
    DownloadSharePage,
    FutureTopicPage,
    KeyMetricCard,
    HotTopicsCard,
    GlobalHotRegionsCard,
    DataFilterBar,
    GlobalMap,
    TrendChart,
    DistributionChart,
    HotTopicsList,
    ChartSection,
    HotTopicsDetail
  },
  setup() {
    // 响应式数据
    const currentPage = ref('dashboard')
    const isMobileSidebarOpen = ref(false)
    
    // 模态框状态
    const modal = reactive({
      isOpen: false,
      title: '',
      content: ''
    })

    const chartModal = reactive({
      isOpen: false,
      title: '',
      chartSrc: ''
    })

    // 计算当前页面组件
    const currentPageComponent = computed(() => {
      const pageMap = {
        'dashboard': 'DashboardPage',
        'trends': 'TrendsPage',
        'themes': 'ThemesPage',
        'alerts': 'AlertsPage',
        'timeline': 'TimelinePage',
        'news-policy': 'NewsPolicyPage',
        'discussion': 'DiscussionPage',
        'download-share': 'DownloadSharePage',
        'future-topic': 'FutureTopicPage'
      }
      return pageMap[currentPage.value] || 'DashboardPage'
    })

    // 导航处理
    const handleNavigation = (page) => {
      currentPage.value = page
    }

    // 模态框操作
    const openModal = (title, content) => {
      modal.title = title
      modal.content = content
      modal.isOpen = true
      document.body.style.overflow = 'hidden'
    }

    const closeModal = () => {
      modal.isOpen = false
      document.body.style.overflow = ''
    }

    const openChartModal = (chartSrc, title) => {
      chartModal.chartSrc = chartSrc
      chartModal.title = title
      chartModal.isOpen = true
      document.body.style.overflow = 'hidden'
    }

    const closeChartModal = () => {
      chartModal.isOpen = false
      document.body.style.overflow = ''
    }

    // 图表缩放功能
    const resizeChart = (chartId, scale) => {
      const chartElement = document.getElementById(chartId)
      if (chartElement) {
        const currentHeight = parseInt(chartElement.style.height) || 500
        const newHeight = Math.max(200, Math.min(800, currentHeight * scale))
        chartElement.style.height = newHeight + 'px'
      }
    }

    const resetChartSize = (chartId) => {
      const chartElement = document.getElementById(chartId)
      if (chartElement) {
        chartElement.style.height = '500px'
      }
    }

    const resizeModalChart = (scale) => {
      // 模态框图表缩放逻辑
    }

    const resetModalChart = () => {
      // 重置模态框图表大小
    }
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          if (modal.isOpen) closeModal()
          if (chartModal.isOpen) closeChartModal()
          if (isMobileSidebarOpen.value) isMobileSidebarOpen.value = false
        }
      }
      document.addEventListener('keydown', handleKeydown)
      
      // 组件卸载时清理事件监听
      return () => {
        document.removeEventListener('keydown', handleKeydown)
      }
    })

    return {
      currentPage,
      currentPageComponent,
      isMobileSidebarOpen,
      modal,
      chartModal,
      handleNavigation,
      openModal,
      closeModal,
      openChartModal,
      closeChartModal,
      resizeChart,
      resetChartSize,
      resizeModalChart,
      resetModalChart
    }
  }
}
</script>

<style>
@import url('https://cdn.tailwindcss.com');
@import url('https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Tailwind 配置 */
:root {
  --primary: #165DFF;
  --secondary: #36CFC9;
  --accent: #722ED1;
  --warning: #FF7D00;
  --danger: #F53F3F;
  --success: #00B42A;
  --dark-100: #86909C;
  --dark-200: #4E5969;
  --dark-300: #272E3B;
  --dark-400: #1D2129;
  --dark-500: #141414;
}

body {
  font-family: 'Inter', sans-serif;
}

.content-auto {
  content-visibility: auto;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  box-shadow: 0 10px 25px rgba(22, 93, 255, 0.2);
  transform: translateY(-4px);
}

.glass-effect {
  background: rgba(29, 33, 41, 0.8);
  backdrop-filter: blur(12px);
}

.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

.nav-active {
  background: rgba(22, 93, 255, 0.1);
  color: var(--primary);
  border-left: 4px solid var(--primary);
}

/* 动画 */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 响应式颜色类 */
.text-primary { color: var(--primary); }
.text-secondary { color: var(--secondary); }
.text-accent { color: var(--accent); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }
.text-success { color: var(--success); }
.text-dark-100 { color: var(--dark-100); }
.text-dark-200 { color: var(--dark-200); }

.bg-primary { background-color: var(--primary); }
.bg-secondary { background-color: var(--secondary); }
.bg-accent { background-color: var(--accent); }
.bg-warning { background-color: var(--warning); }
.bg-danger { background-color: var(--danger); }
.bg-success { background-color: var(--success); }
.bg-dark-100 { background-color: var(--dark-100); }
.bg-dark-200 { background-color: var(--dark-200); }
.bg-dark-300 { background-color: var(--dark-300); }
.bg-dark-400 { background-color: var(--dark-400); }
.bg-dark-500 { background-color: var(--dark-500); }

.border-primary { border-color: var(--primary); }
.border-secondary { border-color: var(--secondary); }
.border-accent { border-color: var(--accent); }
.border-warning { border-color: var(--warning); }
.border-danger { border-color: var(--danger); }
.border-success { border-color: var(--success); }
.border-dark-100 { border-color: var(--dark-100); }
.border-dark-200 { border-color: var(--dark-200); }
.border-dark-300 { border-color: var(--dark-300); }
</style>