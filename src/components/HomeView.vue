<template>
    <div class="flex-1 flex flex-col px-8 pb-6 pt-safe">
      <div class="flex justify-between items-center mb-6 pb-2 mt-4">
        <div class="flex space-x-4 overflow-x-auto">
          <button 
            v-for="cat in categories" :key="cat" @click="$emit('update:activeCategory', cat)"
            :class="['px-5 py-2 rounded-full font-bold shadow-sm transition-colors text-lg whitespace-nowrap', 
                     activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
          >
            {{ cat }}
          </button>
        </div>
        <button @click="$emit('create')" class="bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-green-600 shrink-0">
          + 新建记录
        </button>
      </div>
  
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto pb-10 pr-2">
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
              <span v-for="cat in getCategories(item.category)" :key="cat" class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                {{ cat }}
              </span>
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
        <div v-if="sortedList.length === 0" class="col-span-full text-center text-gray-400 mt-10 text-lg">
          当前分类下没有内容，点击右上角新建一个吧！
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['categories', 'activeCategory', 'sortedList', 'getCategories', 'difficultyColor']);
  defineEmits(['update:activeCategory', 'select', 'create', 'delete']);
  </script>