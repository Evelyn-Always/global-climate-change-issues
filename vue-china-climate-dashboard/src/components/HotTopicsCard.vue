<template>
  <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="text-dark-100 text-sm">当日热点话题</p>
        <div class="space-y-2 mt-2">
          <div 
            v-for="(topic, index) in topics" 
            :key="index"
            class="flex items-center"
          >
            <span 
              :class="`bg-${getTopicColor(index)}/10 text-${getTopicColor(index)} text-xs px-2 py-1 rounded mr-2`"
            >
              #{{ topic.name }}
            </span>
            <span class="text-dark-100 text-xs">{{ topic.discussions }} 讨论</span>
          </div>
        </div>
      </div>
      <div class="bg-secondary/10 p-2 rounded-lg">
        <i class="fa fa-fire text-secondary"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HotTopicsCard',
  props: {
    topics: {
      type: Array,
      required: true
    }
  },
  methods: {
    getTopicColor(index) {
      const colors = ['primary', 'secondary', 'accent', 'warning', 'success']
      return colors[index % colors.length]
    }
  }
}
</script>