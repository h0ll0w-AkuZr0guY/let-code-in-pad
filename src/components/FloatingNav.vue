<template>
    <button 
      v-if="hasPrev" 
      @click="$emit('prev')" 
      class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-32 bg-transparent hover:bg-gray-400/20 active:bg-gray-400/40 rounded-r-2xl flex items-center justify-center transition-all z-40 text-gray-300 hover:text-gray-600 text-5xl"
    >
      <span class="drop-shadow-sm -translate-x-1">‹</span>
    </button>
    
    <button 
      v-if="hasNext" 
      @click="$emit('next')" 
      class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-32 bg-transparent hover:bg-gray-400/20 active:bg-gray-400/40 rounded-l-2xl flex items-center justify-center transition-all z-40 text-gray-300 hover:text-gray-600 text-5xl"
    >
      <span class="drop-shadow-sm translate-x-1">›</span>
    </button>
  </template>
  
  <script setup>
  defineProps(['hasPrev', 'hasNext']);
  defineEmits(['prev', 'next']);
  </script>