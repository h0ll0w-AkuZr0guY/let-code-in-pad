<template>
    <div v-if="show" class="absolute inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" @click.self="$emit('close')">
      <div class="bg-white p-8 rounded-3xl shadow-2xl w-[32rem] max-h-[85%] flex flex-col transform transition-transform">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h3 class="text-2xl font-bold text-gray-800 flex items-center">👤 个人中心</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        
        <div class="flex-1 overflow-y-auto space-y-6 pr-2">
          <div class="flex items-center space-x-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-inner">🧑‍💻</div>
            <div>
              <div class="text-xl font-bold text-gray-800">本地开发者</div>
              <div class="text-sm text-gray-500 mt-1">Let Code in Pad 离线用户</div>
            </div>
          </div>
  
          <div>
            <h4 class="font-bold text-gray-400 mb-3 uppercase tracking-wider text-xs ml-1">数据看板</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-center items-center shadow-sm">
                <span class="text-3xl font-bold text-blue-600 mb-1">{{ algoCount }}</span>
                <span class="text-xs text-blue-500 font-bold">算法题数</span>
              </div>
              <div class="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col justify-center items-center shadow-sm">
                <span class="text-3xl font-bold text-purple-600 mb-1">{{ interviewCount }}</span>
                <span class="text-xs text-purple-500 font-bold">面经笔记数</span>
              </div>
            </div>
          </div>
  
          <div>
            <h4 class="font-bold text-gray-400 mb-3 uppercase tracking-wider text-xs ml-1">资源配置 (即将开放)</h4>
            <div class="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300 text-gray-500 text-sm flex flex-col space-y-3">
              <div class="flex items-center space-x-3 opacity-60">
                <span class="text-xl">☁️</span>
                <span class="font-bold">云端数据同步 (WebDAV / GitHub)</span>
              </div>
              <div class="flex items-center space-x-3 opacity-60">
                <span class="text-xl">🎨</span>
                <span class="font-bold">深色模式与主题自定义</span>
              </div>
              <div class="flex items-center space-x-3 opacity-60">
                <span class="text-xl">📤</span>
                <span class="font-bold">一键导出 PDF / Markdown 归档</span>
              </div>
              <div class="text-xs text-gray-400 mt-2 text-center pt-2 border-t border-gray-200">
                未来将在架构更新中逐步支持
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['show', 'algoCount', 'interviewCount']);
  defineEmits(['close']);
  </script>