<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 transition-colors">
    <div class="w-full max-w-5xl mx-auto flex flex-col border-x dark:border-gray-800 shadow-sm transition-colors h-full relative">
      
      <div class="flex items-center border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0 min-h-[52px]">
        <h2 class="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase px-6 shrink-0 flex items-center">
          笔记正文
        </h2>

        <div v-if="!isEditing && h2Headings.length > 0" class="flex-1 flex items-center space-x-2 overflow-x-auto px-4 border-l border-gray-200 dark:border-gray-700 h-full py-2 [&::-webkit-scrollbar]:hidden">
          <span class="text-gray-400 dark:text-gray-500 font-bold text-xs shrink-0 mr-1">📌 跳转:</span>
          <button v-for="h in h2Headings" :key="h.slug" @click="scrollTo(h.slug)"
                  class="px-3 py-1 rounded-md text-xs font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 transition-colors whitespace-nowrap shrink-0">
            {{ h.title }}
          </button>
        </div>
      </div>

      <div class="p-8 flex-1 overflow-y-auto bg-white dark:bg-gray-900 transition-colors scroll-smooth">
        <textarea v-if="isEditing" v-model="form.problemText" @paste="(e) => handleSmartPaste(e, form, 'problemText')" 
                  class="w-full h-full resize-none outline-none p-4 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-lg focus:border-purple-400 dark:bg-gray-800 dark:text-gray-200 transition" 
                  :style="{ fontSize: contentFontSize + 'px' }"></textarea>
        
        <div v-else class="prose dark:prose-invert max-w-none mx-auto transition-all duration-300" 
             :style="{ fontSize: contentFontSize + 'px' }" 
             v-html="renderMarkdown(form.problemText, form.images)"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { renderMarkdown, handleSmartPaste } from '../utils/core'; 

const props = defineProps(['form', 'isEditing', 'contentFontSize']);

// 动态提取所有的 H2 二级标题
const h2Headings = computed(() => {
  if (!props.form || !props.form.problemText) return [];
  const textWithoutCodeBlocks = props.form.problemText.replace(/```[\s\S]*?```/g, '');
  const matches = [...textWithoutCodeBlocks.matchAll(/^##\s+(.+)$/gm)];

  return matches.map(m => {
    const rawTitle = m[1].trim();
    const slug = 'toc-' + encodeURIComponent(rawTitle.replace(/[*`_]/g, '').trim().toLowerCase().replace(/\s+/g, '-').substring(0, 30)).replace(/%/g, '');
    
    let displayTitle = rawTitle.replace(/[*`_]/g, '');
    if (displayTitle.length > 15) displayTitle = displayTitle.substring(0, 14) + '...';
    
    return { title: displayTitle, slug };
  });
});

// 【终极修复】：安全滚动引擎，杜绝原生方法导致全局页面错位
const scrollTo = (slug) => {
  const el = document.getElementById(slug);
  if (el) {
    // 1. 精准查找到负责正文滚动的容器
    const container = el.closest('.overflow-y-auto');
    if (container) {
      // 2. 计算目标元素与滚动容器的相对高度差，执行局部滑动
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      container.scrollBy({
        top: elRect.top - containerRect.top - 20, // 预留 20px 顶部呼吸空间
        behavior: 'smooth'
      });
    } else {
      // 兜底方案
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};
</script>