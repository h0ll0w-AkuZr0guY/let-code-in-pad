<template>
  <div class="flex-1 flex overflow-hidden bg-white dark:bg-gray-900 transition-colors">
    <div class="w-full max-w-5xl mx-auto flex flex-col border-x dark:border-gray-800 shadow-sm transition-colors">
      <h2 class="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase p-4 border-b dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-900 text-center">笔记正文</h2>
      <div class="p-8 flex-1 overflow-y-auto bg-white dark:bg-gray-900 transition-colors">
        <textarea v-if="isEditing" v-model="form.problemText" @paste="(e) => handleSmartPaste(e, form, 'problemText')" class="w-full h-full resize-none outline-none text-lg p-4 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-lg focus:border-purple-400 dark:bg-gray-800 dark:text-gray-200 transition"></textarea>
        <div v-else class="prose dark:prose-invert max-w-none text-lg mx-auto" v-html="renderMarkdown(form.problemText, form.images)"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { renderMarkdown, handleSmartPaste } from '../utils/core';
const props = defineProps(['form', 'isEditing']);
</script>