<template>
  <div v-if="show" class="absolute inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" @click.self="closeModal">
    <div class="bg-white p-8 rounded-3xl shadow-2xl w-[32rem] max-h-[85%] flex flex-col transform transition-transform">
      
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <div class="flex items-center space-x-4">
          <h3 class="text-2xl font-bold text-gray-800">👤 个人中心</h3>
          <div v-if="appSpace === 'life'" class="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <span class="text-xs font-bold text-green-700">默认启动日记</span>
            <button @click="$emit('toggleDefaultSpace')" class="w-8 h-4 rounded-full transition-colors relative" :class="defaultAppSpace === 'life' ? 'bg-green-500' : 'bg-gray-300'">
              <div class="w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform" :class="defaultAppSpace === 'life' ? 'translate-x-4' : 'translate-x-0.5'"></div>
            </button>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
      </div>
      
      <div class="flex-1 overflow-y-auto pr-2">
        
        <div v-if="!showExportMenu" class="space-y-6">
          <div class="flex items-center space-x-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-blue-50 transition select-none group" @dblclick="$emit('toggleAppSpace')" title="双击试试看？">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">🧑‍💻</div>
            <div>
              <div class="text-xl font-bold text-gray-800">本地开发者</div>
              <div class="text-sm text-gray-500 mt-1">双击头像区，切换平行空间</div>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-gray-400 mb-3 uppercase tracking-wider text-xs ml-1">{{ appSpace === 'tech' ? '技术看板' : '生活看板' }}</h4>
            <div v-if="appSpace === 'tech'" class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-center items-center shadow-sm">
                <span class="text-3xl font-bold text-blue-600 mb-1">{{ algoCount }}</span><span class="text-xs text-blue-500 font-bold">算法题数</span>
              </div>
              <div class="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col justify-center items-center shadow-sm">
                <span class="text-3xl font-bold text-purple-600 mb-1">{{ interviewCount }}</span><span class="text-xs text-purple-500 font-bold">面经笔记数</span>
              </div>
            </div>
            <div v-else class="grid grid-cols-2 gap-4">
              <div class="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col justify-center items-center shadow-sm">
                <span class="text-3xl font-bold text-green-600 mb-1">{{ diaryCount }}</span><span class="text-xs text-green-500 font-bold">日记数</span>
              </div>
              <div class="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col justify-center items-center shadow-sm">
                <span class="text-3xl font-bold text-orange-600 mb-1">{{ journalCount }}</span><span class="text-xs text-orange-500 font-bold">手账数</span>
              </div>
            </div>
          </div>

          <div class="mt-4 cursor-pointer bg-white p-4 rounded-2xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition flex flex-col" @click="showExportMenu = true">
            <div class="flex items-center space-x-3">
              <span class="text-xl">📤</span><span class="font-bold text-gray-700">一键导出归档 (PDF / Markdown)</span><span class="text-xs ml-auto text-blue-500 font-bold">点击进入 ▸</span>
            </div>
            <div class="text-xs text-gray-400 mt-2 pl-8">将当前空间的记录导出为可打印或备份的文件</div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <button @click="showExportMenu = false" class="text-sm text-gray-500 hover:text-blue-600 font-bold mb-2 flex items-center">◂ 返回概览</button>
          <h4 class="font-bold text-gray-800 text-lg mb-4">选择导出格式与范围 ({{ appSpace === 'tech' ? '技术区' : '生活区' }})</h4>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <div class="font-bold text-red-500 text-sm mb-2 flex items-center">📄 导出为 PDF</div>
              <button @click="triggerExport('pdf', 'all')" class="w-full py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-bold border border-red-100">全部记录</button>
              <button @click="triggerExport('pdf', appSpace === 'tech' ? 'algorithm' : 'diary')" class="w-full py-2.5 bg-white text-gray-600 rounded-xl hover:bg-gray-50 font-medium border border-gray-200">仅 {{ appSpace === 'tech' ? '算法' : '日记' }}</button>
              <button @click="triggerExport('pdf', appSpace === 'tech' ? 'interview' : 'journal')" class="w-full py-2.5 bg-white text-gray-600 rounded-xl hover:bg-gray-50 font-medium border border-gray-200">仅 {{ appSpace === 'tech' ? '面经' : '手账' }}</button>
            </div>
            <div class="space-y-3">
              <div class="font-bold text-blue-500 text-sm mb-2 flex items-center">📝 导出为 Markdown</div>
              <button @click="triggerExport('md', 'all')" class="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-bold border border-blue-100">全部记录</button>
              <button @click="triggerExport('md', appSpace === 'tech' ? 'algorithm' : 'diary')" class="w-full py-2.5 bg-white text-gray-600 rounded-xl hover:bg-gray-50 font-medium border border-gray-200">仅 {{ appSpace === 'tech' ? '算法' : '日记' }}</button>
              <button @click="triggerExport('md', appSpace === 'tech' ? 'interview' : 'journal')" class="w-full py-2.5 bg-white text-gray-600 rounded-xl hover:bg-gray-50 font-medium border border-gray-200">仅 {{ appSpace === 'tech' ? '面经' : '手账' }}</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps(['show', 'appSpace', 'defaultAppSpace', 'algoCount', 'interviewCount', 'diaryCount', 'journalCount']);
const emit = defineEmits(['close', 'toggleAppSpace', 'toggleDefaultSpace', 'exportData']);

const showExportMenu = ref(false);

const closeModal = () => {
  showExportMenu.value = false;
  emit('close');
};

const triggerExport = (format, scope) => {
  emit('exportData', format, scope);
};
</script>