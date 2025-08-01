<template>
  <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="text-dark-100 text-sm">{{ title }}</p>
        <h3 class="text-3xl font-bold mt-1">{{ formattedValue }}</h3>
      </div>
      <div :class="`bg-${iconColor}/10 p-2 rounded-lg`">
        <i :class="`${icon} text-${iconColor}`"></i>
      </div>
    </div>
    <div class="flex items-center text-sm">
      <span class="text-success flex items-center">
        <i class="fa fa-arrow-up mr-1"></i> {{ growth }}%
      </span>
      <span class="text-dark-100 ml-2">较昨日</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    growth: {
      type: Number,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    iconColor: {
      type: String,
      default: 'primary'
    }
  },
  computed: {
    formattedValue() {
      return this.value.toLocaleString()
    }
  }
}
</script>