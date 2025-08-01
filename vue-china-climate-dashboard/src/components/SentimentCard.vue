<template>
  <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="text-dark-100 text-sm">情感倾向分布</p>
        <div class="flex items-center mt-2">
          <div class="relative w-16 h-16">
            <canvas ref="sentimentChart"></canvas>
          </div>
          <div class="ml-3">
            <div class="flex items-center">
              <span class="w-2 h-2 rounded-full bg-danger mr-1"></span>
              <span class="text-xs text-dark-100">消极 {{ sentiment.negative }}%</span>
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 rounded-full bg-warning mr-1"></span>
              <span class="text-xs text-dark-100">中立 {{ sentiment.neutral }}%</span>
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 rounded-full bg-success mr-1"></span>
              <span class="text-xs text-dark-100">积极 {{ sentiment.positive }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SentimentCard',
  props: {
    sentiment: {
      type: Object,
      required: true,
      default: () => ({
        negative: 45,
        neutral: 30,
        positive: 25
      })
    }
  },
  mounted() {
    this.createChart()
  },
  methods: {
    createChart() {
      // 使用简单的CSS来模拟环形图
      // 在实际项目中可以使用Chart.js或ECharts
      const canvas = this.$refs.sentimentChart
      const ctx = canvas.getContext('2d')
      
      canvas.width = 64
      canvas.height = 64
      
      const centerX = 32
      const centerY = 32
      const radius = 25
      const innerRadius = 15
      
      // 清空画布
      ctx.clearRect(0, 0, 64, 64)
      
      // 绘制环形图
      const data = [
        { value: this.sentiment.negative, color: '#F53F3F' },
        { value: this.sentiment.neutral, color: '#FF7D00' },
        { value: this.sentiment.positive, color: '#00B42A' }
      ]
      
      let currentAngle = -Math.PI / 2
      
      data.forEach(item => {
        const sliceAngle = (item.value / 100) * 2 * Math.PI
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
        ctx.closePath()
        ctx.fillStyle = item.color
        ctx.fill()
        
        currentAngle += sliceAngle
      })
    }
  },
  watch: {
    sentiment: {
      handler() {
        this.$nextTick(() => {
          this.createChart()
        })
      },
      deep: true
    }
  }
}
</script>