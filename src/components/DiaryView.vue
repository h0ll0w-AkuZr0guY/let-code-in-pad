<template>
  <div class="flex-1 flex overflow-hidden bg-[#fdfbf7] dark:bg-gray-900 transition-colors">
    <div class="w-full max-w-5xl mx-auto flex flex-col shadow-sm bg-white dark:bg-gray-800 border-x border-[#f3e8d6] dark:border-gray-700 transition-colors">
      <h2 class="text-sm font-bold tracking-widest uppercase p-4 border-b dark:border-gray-700 shrink-0 bg-[#fdfaf3] dark:bg-gray-800 text-center" :class="form.type === 'diary' ? 'text-green-500' : 'text-orange-400'">{{ form.type === 'diary' ? '✍️ 日记正文' : '📓 手账内容' }}</h2>
      <div class="p-8 flex-1 overflow-y-auto">
        <textarea v-if="isEditing" v-model="form.problemText" @paste="(e) => handleSmartPaste(e, form, 'problemText')" class="w-full h-full resize-none outline-none text-lg p-6 border-2 border-dashed rounded-xl transition dark:bg-gray-900 dark:text-gray-200" :class="form.type === 'diary' ? 'border-green-200 dark:border-green-800 focus:border-green-400' : 'border-orange-200 dark:border-orange-800 focus:border-orange-400'"></textarea>
        <div v-else class="prose dark:prose-invert max-w-none text-lg mx-auto leading-relaxed text-gray-700 dark:text-gray-300" v-html="renderMarkdown(form.problemText, form.images)"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { renderMarkdown, handleSmartPaste } from '../utils/core';
const props = defineProps(['form', 'isEditing']);
</script>