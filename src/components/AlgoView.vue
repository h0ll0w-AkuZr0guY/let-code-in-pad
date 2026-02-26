<template>
  <div class="flex-1 flex overflow-hidden relative transition-colors" :class="{'select-none': isDragging}">
    <div class="flex flex-col bg-white dark:bg-gray-900 transition-colors" :style="{ width: leftWidth + '%' }">
      <h2 class="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase p-4 border-b dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-900">题目描述</h2>
      <div class="p-6 flex-1 overflow-y-auto">
        <textarea v-if="isEditing" v-model="form.problemText" @paste="(e) => handleSmartPaste(e, form, 'problemText')" class="w-full h-full resize-none outline-none p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-transparent dark:text-gray-200 rounded-lg focus:border-blue-400 dark:focus:border-blue-500 transition" :style="{ fontSize: contentFontSize + 'px' }"></textarea>
        <div v-else class="prose dark:prose-invert max-w-none transition-all duration-300" :style="{ fontSize: contentFontSize + 'px' }" v-html="renderMarkdown(form.problemText, form.images)"></div>
      </div>
    </div>
    
    <div class="w-3 cursor-col-resize bg-gray-100 dark:bg-gray-800 hover:bg-blue-300 dark:hover:bg-blue-600 z-10 flex flex-col justify-center items-center transition-colors shadow-inner" @mousedown="startDrag" @touchstart="startDrag">
      <div class="h-12 w-1 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
    </div>
    
    <div class="flex flex-col bg-[#1e1e1e] dark:bg-black transition-colors" :style="{ width: (100 - leftWidth) + '%' }">
      <h2 class="text-sm font-bold text-gray-500 tracking-widest uppercase p-4 border-b border-gray-700 shrink-0 bg-[#2d2d2d] dark:bg-[#1a1a1a] flex justify-between items-center">
        <span>题解与代码</span><span v-if="!isEditing" class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">{{ form.language || 'python' }}</span>
      </h2>
      <div class="p-6 flex-1 overflow-y-auto">
        <textarea v-if="isEditing" v-model="form.solutionText" @paste="(e) => handleSmartPaste(e, form, 'solutionText')" class="w-full h-full resize-none outline-none p-2 bg-transparent text-gray-200 font-mono border-2 border-dashed border-gray-600 rounded-lg focus:border-blue-400" :style="{ fontSize: contentFontSize + 'px' }"></textarea>
        <div v-else class="prose prose-invert max-w-none transition-all duration-300" :style="{ fontSize: contentFontSize + 'px' }" v-html="renderSolution(form.solutionText, form.language, form.images)"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'; 
import { renderMarkdown, renderSolution, handleSmartPaste } from '../utils/core'; 
const props = defineProps(['form', 'isEditing', 'contentFontSize']); 
const leftWidth = ref(50); 
const isDragging = ref(false); 
const startDrag = () => { isDragging.value = true; document.addEventListener('mousemove', onDrag); document.addEventListener('mouseup', stopDrag); document.addEventListener('touchmove', onDrag, { passive: false }); document.addEventListener('touchend', stopDrag); }; 
const onDrag = (e) => { if (!isDragging.value) return; const clientX = e.touches ? e.touches[0].clientX : e.clientX; const newWidth = (clientX / window.innerWidth) * 100; if (newWidth > 20 && newWidth < 80) leftWidth.value = newWidth; }; 
const stopDrag = () => { isDragging.value = false; document.removeEventListener('mousemove', onDrag); document.removeEventListener('mouseup', stopDrag); document.removeEventListener('touchmove', onDrag); document.removeEventListener('touchend', stopDrag); };
</script>