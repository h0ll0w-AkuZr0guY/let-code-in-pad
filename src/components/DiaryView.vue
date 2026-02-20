<template>
    <div class="flex-1 flex overflow-hidden bg-[#fdfbf7]">
      <div class="w-full max-w-5xl mx-auto flex flex-col shadow-sm bg-white border-x border-[#f3e8d6]">
        <h2 class="text-sm font-bold tracking-widest uppercase p-4 border-b shrink-0 bg-[#fdfaf3] text-center" 
            :class="form.type === 'diary' ? 'text-green-500' : 'text-orange-400'">
          {{ form.type === 'diary' ? '✍️ 日记正文' : '📓 手账内容' }}
        </h2>
        
        <div class="p-8 flex-1 overflow-y-auto">
          <textarea 
            v-if="isEditing" 
            v-model="form.problemText"
            @paste="(e) => handleSmartPaste(e, form, 'problemText')"
            placeholder="记录今天的故事、心情或灵感。同样支持 Markdown 语法与 Ctrl+V 粘贴图片..."
            class="w-full h-full resize-none outline-none text-lg p-6 border-2 border-dashed rounded-xl transition"
            :class="form.type === 'diary' ? 'border-green-200 focus:border-green-400 focus:bg-green-50/30' : 'border-orange-200 focus:border-orange-400 focus:bg-orange-50/30'"
          ></textarea>
          <div v-else class="prose max-w-none text-lg mx-auto leading-relaxed text-gray-700" v-html="renderMarkdown(form.problemText, form.images)"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { renderMarkdown, handleSmartPaste } from '../utils/core';
  const props = defineProps(['form', 'isEditing']);
  </script>