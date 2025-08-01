<template>
  <header class="h-16 bg-dark-400 border-b border-dark-300 flex items-center justify-between px-6 z-30">
    <!-- 移动端菜单按钮 -->
    <button 
      class="md:hidden p-2 rounded-md hover:bg-dark-300/50 transition-colors" 
      @click="$emit('toggle-mobile-menu')"
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
</template>

<script>
export default {
  name: 'HeaderComponent',
  emits: ['toggle-mobile-menu'],
  data() {
    return {
      searchQuery: ''
    }
  }
}
</script>