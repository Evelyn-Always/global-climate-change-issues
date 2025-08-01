<template>
  <aside class="w-48 bg-dark-400 border-r border-dark-300 flex-shrink-0 hidden md:block transition-all duration-300 z-40">
    <!-- Logo 和标题 -->
    <div class="flex items-center space-x-2 p-4 border-b border-dark-300">
      <div class="bg-primary/20 p-2 rounded-lg">
        <i class="fa fa-line-chart text-primary text-xl"></i>
      </div>
      <h1 class="text-lg font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
        中国气候变化舆情分析平台
      </h1>
    </div>

    <!-- 导航菜单 -->
    <nav class="py-4 w-48">
      <ul class="space-y-1 px-2">
        <li v-for="item in menuItems" :key="item.id">
          <a 
            href="#" 
            :class="[
              'nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
              activeTab === item.id ? 'nav-active text-white' : 'text-dark-100 hover:bg-dark-300/50'
            ]"
            @click.prevent="$emit('tab-change', item.id)"
          >
            <i :class="item.icon + ' w-5 text-center'"></i>
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
    <div class="absolute bottom-0 left-0 right-600 border-t border-dark-300 p-2">
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
  </aside>
</template>

<script>
export default {
  name: 'SidebarComponent',
  props: {
    activeTab: {
      type: String,
      default: 'dashboard'
    }
  },
  emits: ['tab-change'],
  data() {
    return {
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
  }
}
</script>