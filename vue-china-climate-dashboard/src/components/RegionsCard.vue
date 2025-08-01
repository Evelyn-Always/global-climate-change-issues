<template>
  <div class="bg-dark-400 rounded-xl p-6 border border-dark-300 card-hover">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="text-dark-100 text-sm">全国热点地区</p>
        <div class="mt-2">
          <div 
            v-for="region in regions" 
            :key="region.name"
            class="flex items-center justify-between mb-2"
          >
            <div class="flex items-center">
              <span class="text-sm">{{ region.name }}</span>
            </div>
            <div class="w-24 bg-dark-300 rounded-full h-2">
              <div 
                :class="`bg-${region.color} h-2 rounded-full transition-all duration-1000`"
                :style="{ width: region.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-accent/10 p-2 rounded-lg">
        <i class="fa fa-map-marker text-accent"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegionsCard',
  props: {
    regions: {
      type: Array,
      required: true
    }
  }
}
</script>