<template>
    <div class="flex-1 flex overflow-hidden bg-white">
      <div class="w-full max-w-5xl mx-auto flex flex-col border-x shadow-sm">
        <h2 class="text-sm font-bold text-gray-400 tracking-widest uppercase p-4 border-b shrink-0 bg-gray-50 text-center">
          笔记正文
        </h2>
        <div class="p-8 flex-1 overflow-y-auto bg-white">
          <textarea 
            v-if="isEditing" 
            v-model="form.problemText"
            @paste="(e) => handleSmartPaste(e, form, 'problemText')"
            placeholder="尽情记录你的面经、系统设计或学习笔记。支持 Markdown 语法与图片粘贴..."
            class="w-full h-full resize-none outline-none text-lg p-4 border-2 border-dashed border-purple-200 rounded-lg focus:border-purple-400 focus:bg-purple-50 transition"
          ></textarea>
          <div v-else class="prose max-w-none text-lg mx-auto" v-html="renderMarkdown(form.problemText, form.images)"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { renderMarkdown, handleSmartPaste } from '../utils/core';
  const props = defineProps(['form', 'isEditing']);
  </script>