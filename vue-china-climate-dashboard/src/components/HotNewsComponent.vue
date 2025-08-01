<template>
  <div class="bg-dark-400 rounded-xl border border-dark-300 overflow-hidden shadow-lg">
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
        <div 
          v-for="(news, index) in hotNews" 
          :key="index"
          class="bg-dark-300/50 rounded-lg p-3 hover:bg-dark-300/70 transition-colors cursor-pointer"
        >
          <div class="flex items-center mb-2">
            <div :class="`w-8 h-8 rounded-full bg-${news.iconColor}/20 flex items-center justify-center mr-2`">
              <i :class="`${news.icon} text-${news.iconColor}`"></i>
            </div>
            <div>
              <h4 class="font-medium text-sm">{{ news.title }}</h4>
              <p class="text-xs text-dark-100">{{ news.date }} · {{ news.category }}</p>
            </div>
          </div>
          <p class="text-sm text-dark-100">{{ news.content }}</p>
          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center">
              <span 
                v-for="(tag, tagIndex) in news.tags" 
                :key="tagIndex"
                :class="`bg-${getTagColor(tagIndex)}/10 text-${getTagColor(tagIndex)} text-xs px-2 py-1 rounded mr-1`"
              >
                {{ tag }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-dark-100 text-xs">
              <span><i class="fa fa-eye mr-1"></i> {{ news.views }}</span>
              <span><i class="fa fa-comment mr-1"></i> {{ news.comments }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HotNewsComponent',
  data() {
    return {
      hotNews: [
        {
          title: '生态环境部：中国发布《2025年应对气候变化国家报告》',
          date: '2025-07-15',
          category: '政策讨论',
          content: '报告显示，中国在过去五年中碳排放强度下降了18%，可再生能源占比提高至42%，森林碳汇能力显著增强...',
          tags: ['碳中和', '可再生能源'],
          views: '2.4k',
          comments: '328',
          icon: 'fa fa-newspaper-o',
          iconColor: 'primary'
        },
        {
          title: '联合国秘书长：全球气候危机已达临界点，中国行动受关注',
          date: '2025-07-14',
          category: '国际合作',
          content: '在最新的联合国气候峰会上，秘书长强调全球气温上升速度超过预期，赞扬中国在减排方面的努力...',
          tags: ['气候峰会', '减排目标'],
          views: '5.7k',
          comments: '842',
          icon: 'fa fa-globe',
          iconColor: 'danger'
        },
        {
          title: '北京发布绿色金融支持政策，推动低碳产业发展',
          date: '2025-07-13',
          category: '地方政策',
          content: '北京市发布新的绿色金融支持政策，为低碳产业发展提供资金支持，预计带动千亿投资...',
          tags: ['绿色金融', '低碳产业'],
          views: '3.2k',
          comments: '156',
          icon: 'fa fa-bank',
          iconColor: 'success'
        },
        {
          title: '长江流域极端天气事件增多，专家呼吁加强防范',
          date: '2025-07-12',
          category: '环境监测',
          content: '长江流域近期极端天气事件频发，引发社会广泛关注，专家建议加强气候适应性建设...',
          tags: ['极端天气', '防灾减灾'],
          views: '4.1k',
          comments: '267',
          icon: 'fa fa-cloud',
          iconColor: 'warning'
        }
      ]
    }
  },
  methods: {
    getTagColor(index) {
      const colors = ['primary', 'secondary', 'accent', 'warning', 'success']
      return colors[index % colors.length]
    }
  }
}
</script>