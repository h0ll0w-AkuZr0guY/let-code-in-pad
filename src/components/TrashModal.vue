<template>
    <div v-if="show" class="absolute inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-[36rem] max-h-[85%] flex flex-col">
        <div class="flex justify-between items-center mb-6 border-b pb-3">
          <h3 class="text-xl font-bold text-gray-800 flex items-center">🗑️ 回收站 <span class="text-sm font-normal text-gray-400 ml-2">({{ trashList.length }} 项)</span></h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none">✕</button>
        </div>
        
        <div class="flex-1 overflow-y-auto space-y-3 pr-2">
          <div v-if="trashList.length === 0" class="text-center text-gray-400 mt-10">回收站是空的</div>
          <div v-for="item in trashList" :key="item.id" class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
            <div class="flex-1 overflow-hidden pr-4">
              <h4 class="font-bold text-gray-700 truncate">{{ item.title }}</h4>
              <p class="text-xs text-gray-400 mt-1">{{ item.category }} | {{ item.type === 'interview' ? '面经' : '算法' }}</p>
            </div>
            <div class="flex space-x-2 shrink-0">
              <button @click="$emit('restore', item)" class="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200 transition text-sm">恢复</button>
              <button @click="$emit('delete', item)" class="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-200 transition text-sm">彻底删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['show', 'trashList']);
  defineEmits(['close', 'restore', 'delete']);
  </script>