<template>
    <div class="flex-1 flex flex-col px-8 pb-6 pt-safe relative">
      
      <div class="flex justify-between items-center mb-6 pb-2 mt-4">
        <div class="flex space-x-4 overflow-x-auto flex-1 mr-4">
          <button 
            v-for="cat in categories" :key="cat" @click="$emit('update:activeCategory', cat)"
            :class="['px-5 py-2 rounded-full font-bold shadow-sm transition-colors text-lg whitespace-nowrap shrink-0', 
                     activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
          >
            {{ cat }}
          </button>
        </div>
        <div class="flex space-x-3 shrink-0">
          <button @click="showOrderModal = true" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-md hover:bg-gray-300">
            ⚙️ 排序
          </button>
          <button @click="$emit('create')" class="bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-green-600">
            + 新建记录
          </button>
        </div>
      </div>
  
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto pb-10">
        <div 
          v-for="item in sortedList" :key="item.id" @click="$emit('select', item)"
          class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer transition flex flex-col justify-between h-40 group relative border-t-4"
          :class="item.type === 'interview' ? 'border-purple-400' : 'border-blue-400'"
        >
          <div>
            <div class="flex justify-between items-start">
              <h3 class="text-xl font-bold text-gray-800 line-clamp-2 flex-1">{{ item.title }}</h3>
              <span :class="item.type === 'interview' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="text-xs px-2 py-1 rounded ml-2 shrink-0">
                {{ item.type === 'interview' ? '面经' : '算法' }}
              </span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="cat in getCategories(item.category)" :key="cat" class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">{{ cat }}</span>
            </div>
          </div>
          <div class="mt-4 flex justify-between items-center">
            <span v-if="item.type !== 'interview'" :class="['px-3 py-1 text-sm rounded-md font-medium', difficultyColor(item.difficulty)]">
              {{ item.difficulty }}
            </span>
            <span v-else></span>
            <button @click.stop="$emit('delete', item.id)" class="text-red-500 opacity-0 group-hover:opacity-100 transition">删除</button>
          </div>
        </div>
      </div>
  
      <div v-if="showOrderModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 rounded-xl backdrop-blur-sm">
        <div class="bg-white p-6 rounded-2xl shadow-2xl w-96 max-h-[80%] flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">自定义标签排序</h3>
            <button @click="closeOrderModal" class="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
          </div>
          <div class="flex-1 overflow-y-auto space-y-2 pr-2">
            <div v-for="(cat, index) in categories.slice(1)" :key="cat" class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
              <span class="font-bold text-gray-700">{{ cat }}</span>
              <div class="space-x-2">
                <button @click="$emit('moveCat', index, -1)" :disabled="index === 0" class="px-3 py-1 bg-blue-100 text-blue-600 rounded disabled:opacity-30">↑</button>
                <button @click="$emit('moveCat', index, 1)" :disabled="index === categories.length - 2" class="px-3 py-1 bg-blue-100 text-blue-600 rounded disabled:opacity-30">↓</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  defineProps(['categories', 'activeCategory', 'sortedList', 'getCategories', 'difficultyColor']);
  const emit = defineEmits(['update:activeCategory', 'select', 'create', 'delete', 'moveCat', 'saveOrder']);
  
  const showOrderModal = ref(false);
  const closeOrderModal = () => {
    showOrderModal.value = false;
    emit('saveOrder'); // 关闭弹窗时通知父组件保存最新顺序
  };
  </script>