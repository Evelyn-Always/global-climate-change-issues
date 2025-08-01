<template>
  <div class="bg-dark-500 text-white font-inter antialiased min-h-screen flex flex-col overflow-hidden">
    <div class="flex h-screen">
      <!-- 左侧导航栏 -->
      <SidebarComponent 
        :activeTab="activeTab" 
        @tab-change="handleTabChange"
      />

      <!-- 主内容区域 -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- 顶部导航栏 -->
        <HeaderComponent @toggle-mobile-menu="toggleMobileMenu" />

        <!-- 页面内容区域 -->
        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <!-- 数据概览页面 -->
          <DashboardOverview v-if="activeTab === 'dashboard'" />
          
          <!-- 时间趋势页面 -->
          <div v-else-if="activeTab === 'trends'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">舆情时间趋势分析</h2>
              <p class="text-dark-100 mt-1">分析气候变化相关舆情随时间的发展趋势与规律</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">时间趋势分析功能开发中...</p>
            </div>
          </div>

          <!-- 主题分析页面 -->
          <div v-else-if="activeTab === 'themes'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">主题与情感分析</h2>
              <p class="text-dark-100 mt-1">深入分析气候变化相关舆情的主题分布与情感倾向</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">主题分析功能开发中...</p>
            </div>
          </div>

          <!-- 预警中心页面 -->
          <div v-else-if="activeTab === 'alerts'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">预警中心</h2>
              <p class="text-dark-100 mt-1">实时监控舆情异常变化，提供及时预警</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">预警中心功能开发中...</p>
            </div>
          </div>

          <!-- 气候时间线页面 -->
          <div v-else-if="activeTab === 'timeline'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">中国气候事件时间线</h2>
              <p class="text-dark-100 mt-1">展示中国重大气候事件的时间发展脉络</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">气候时间线功能开发中...</p>
            </div>
          </div>

          <!-- 新闻政策页面 -->
          <div v-else-if="activeTab === 'news-policy'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">新闻政策聚合</h2>
              <p class="text-dark-100 mt-1">聚合中国最新气候新闻和政策动态</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">新闻政策功能开发中...</p>
            </div>
          </div>

          <!-- 用户讨论页面 -->
          <div v-else-if="activeTab === 'discussion'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">用户讨论区</h2>
              <p class="text-dark-100 mt-1">参与气候变化话题讨论，分享观点和见解</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">用户讨论功能开发中...</p>
            </div>
          </div>

          <!-- 数据分享页面 -->
          <div v-else-if="activeTab === 'download-share'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">数据下载与分享</h2>
              <p class="text-dark-100 mt-1">下载分析数据或分享至社交平台</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">数据分享功能开发中...</p>
            </div>
          </div>

          <!-- AI预测页面 -->
          <div v-else-if="activeTab === 'future-topic'" class="page-content">
            <div class="mb-6">
              <h2 class="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white">AI话题预测</h2>
              <p class="text-dark-100 mt-1">基于AI模型预测未来气候热门话题趋势</p>
            </div>
            <div class="bg-dark-400 rounded-xl p-6 border border-dark-300">
              <p class="text-dark-100">AI预测功能开发中...</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 移动端侧边栏 -->
    <div 
      v-if="showMobileMenu" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="closeMobileMenu"
    >
      <div 
        class="absolute top-0 left-0 bottom-0 w-64 bg-dark-400 transform transition-transform duration-300"
        :class="{ '-translate-x-full': !showMobileMenu }"
        @click.stop
      >
        <!-- 移动端侧边栏内容 -->
        <div class="flex items-center space-x-2 p-4 border-b border-dark-300">
          <div class="bg-primary/20 p-2 rounded-lg">
            <i class="fa fa-line-chart text-primary text-xl"></i>
          </div>
          <h1 class="text-lg font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            中国气候变化舆情分析平台
          </h1>
        </div>

        <nav class="py-4">
          <ul class="space-y-1 px-2">
            <li v-for="item in menuItems" :key="item.id">
              <a 
                href="#" 
                :class="[
                  'mobile-nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                  activeTab === item.id ? 'nav-active text-white' : 'text-dark-100 hover:bg-dark-300/50'
                ]"
                @click.prevent="handleMobileTabChange(item.id)"
              >
                <i :class="item.icon + ' w-5 text-center'"></i>
                <span>{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarComponent from './components/SidebarComponent.vue'
import HeaderComponent from './components/HeaderComponent.vue'
import DashboardOverview from './components/DashboardOverview.vue'

export default {
  name: 'App',
  components: {
    SidebarComponent,
    HeaderComponent,
    DashboardOverview
  },
  data() {
    return {
      activeTab: 'dashboard',
      showMobileMenu: false,
      menuItems: [
        { id: 'dashboard', label: '数据概览', icon: 'fa fa-dashboard' },
        { id: 'trends', label: '时间趋势', icon: 'fa fa-line-chart' },
        { id: 'themes', label: '主题分析', icon: 'fa fa-tags' },
        { id: 'alerts', label: '预警中心', icon: 'fa fa-bell' },
        { id: 'timeline', label: '气候时间线', icon: 'fa fa-history' },
        { id: 'news-policy', label: '新闻政策', icon: 'fa fa-newspaper-o' },
        { id: 'discussion', label: '用户讨论', icon: 'fa fa-comments' },
        { id: 'download-share', label: '数据分享', icon: 'fa fa-download' },
        { id: 'future-topic', label: 'AI预测', icon: 'fa fa-magic' }
      ]
    }
  },
  methods: {
    handleTabChange(tabId) {
      this.activeTab = tabId
    },
    handleMobileTabChange(tabId) {
      this.activeTab = tabId
      this.showMobileMenu = false
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
    }
  }
}
</script>