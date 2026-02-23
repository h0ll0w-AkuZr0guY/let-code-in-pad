<template>
  <div v-if="show" class="absolute inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl w-[24rem] flex flex-col transform transition-transform overflow-hidden">
      <div class="border-b dark:border-gray-700 pb-4 mb-4 flex justify-between items-start">
        <div class="flex-1 overflow-hidden pr-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{{ item.title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{{ item.category }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-red-500 font-bold text-xl leading-none bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
      </div>
      <div class="space-y-3">
        <button @click="$emit('pin', item)" class="w-full flex items-center p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition text-left group border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
          <div class="text-3xl mr-4 group-hover:scale-110 transition-transform">{{ item.isPinned ? '🔽' : '📌' }}</div>
          <div><div class="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ item.isPinned ? '取消置顶' : '置顶此项' }}</div><div class="text-xs text-gray-500 dark:text-gray-400">将其永远固定在列表最前方</div></div>
        </button>
        <button @click="$emit('edit', item)" class="w-full flex items-center p-3 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/30 transition text-left group border border-transparent hover:border-green-100 dark:hover:border-green-800">
          <div class="text-3xl mr-4 group-hover:scale-110 transition-transform">✏️</div>
          <div><div class="font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400">编辑内容</div><div class="text-xs text-gray-500 dark:text-gray-400">直接进入编辑模式</div></div>
        </button>
        <button @click="$emit('shareData', item)" class="w-full flex items-center p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition text-left group border border-transparent hover:border-purple-100 dark:hover:border-purple-800">
          <div class="text-3xl mr-4 group-hover:scale-110 transition-transform">📦</div>
          <div><div class="font-bold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">复制 LCP 数据包</div><div class="text-xs text-gray-500 dark:text-gray-400">复制底层 JSON，供其他设备一键导入</div></div>
        </button>
        <button @click="$emit('delete', item)" class="w-full flex items-center p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/30 transition text-left group border border-transparent hover:border-red-100 dark:hover:border-red-800">
          <div class="text-3xl mr-4 group-hover:scale-110 transition-transform">🗑️</div>
          <div><div class="font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-500 dark:group-hover:text-red-400">移入回收站</div><div class="text-xs text-gray-500 dark:text-gray-400">可在回收站中找回</div></div>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps(['show', 'item']);
defineEmits(['close', 'pin', 'edit', 'delete', 'shareData']);
</script>