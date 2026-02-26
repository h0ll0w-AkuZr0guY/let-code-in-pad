<template>
  <transition 
    enter-active-class="transition-transform duration-300 ease-out" 
    enter-from-class="translate-x-full" 
    enter-to-class="translate-x-0" 
    leave-active-class="transition-transform duration-200 ease-in" 
    leave-from-class="translate-x-0" 
    leave-to-class="translate-x-full">
    
    <div v-if="show" class="absolute top-0 right-0 w-72 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col z-30">
      
      <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
        <h3 class="font-bold text-gray-800 dark:text-gray-200 tracking-wider text-sm flex items-center">
          <span class="text-blue-500 mr-2 text-lg">🗂️</span> 内容导航
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 w-7 h-7 rounded-full flex items-center justify-center font-bold transition-colors">✕</button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-0.5 pb-24 scroll-smooth">
        <div v-if="headings.length === 0" class="text-sm text-gray-400 dark:text-gray-500 text-center mt-12 flex flex-col items-center">
          <span class="text-3xl mb-2 opacity-50">📄</span>正文暂无标题结构
        </div>
        
        <div v-for="h in headings" :key="h.slug" 
             @click="scrollTo(h.slug)"
             class="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg px-3 py-2 transition-colors flex items-center group"
             :class="[
               h.level === 1 ? 'mt-2 mb-1' : '',
               h.level === 2 ? 'ml-3' : '',
               h.level === 3 ? 'ml-7' : '',
               h.level === 4 ? 'ml-10' : ''
             ]"
             :title="h.rawTitle">
          
          <span v-if="h.level === 1" class="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mr-2.5 shrink-0 shadow-sm group-hover:scale-125 transition-transform"></span>
          <span v-else class="text-gray-300 dark:text-gray-600 mr-2 shrink-0 text-xs font-bold group-hover:text-blue-400 transition-colors">-</span>
          
          <span class="truncate transition-colors"
                :class="[
                  h.level === 1 ? 'font-bold text-gray-800 dark:text-gray-100 text-[14px] group-hover:text-blue-600 dark:group-hover:text-blue-400' : 
                  h.level === 2 ? 'font-medium text-gray-600 dark:text-gray-300 text-[13px] group-hover:text-blue-600 dark:group-hover:text-blue-400' : 
                  'text-gray-500 dark:text-gray-400 text-xs group-hover:text-blue-500 dark:group-hover:text-blue-300'
                ]">
            {{ h.title }}
          </span>
        </div>
      </div>

    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['show', 'form']);
defineEmits(['close']);

const headings = computed(() => {
  if (!props.form) return [];
  const text = [props.form.problemText, props.form.solutionText].filter(Boolean).join('\n\n');
  const textWithoutCodeBlocks = text.replace(/```[\s\S]*?```/g, '');
  const matches = [...textWithoutCodeBlocks.matchAll(/^(#{1,4})\s+(.+)$/gm)];
  
  return matches.map(m => {
    const level = m[1].length;
    const rawTitle = m[2].trim();
    const slug = 'toc-' + encodeURIComponent(rawTitle.replace(/[*`_]/g, '').trim().toLowerCase().replace(/\s+/g, '-').substring(0, 30)).replace(/%/g, '');
    
    let displayTitle = rawTitle.replace(/[*`_]/g, ''); 
    if (displayTitle.length > 20) displayTitle = displayTitle.substring(0, 19) + '...';

    return { level, title: displayTitle, rawTitle, slug };
  });
});

// 【同步应用】：将计算滚动距离的安全方法同样植入右侧大目录组件
const scrollTo = (slug) => {
  const el = document.getElementById(slug);
  if (el) {
    const container = el.closest('.overflow-y-auto');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      container.scrollBy({
        top: elRect.top - containerRect.top - 20, 
        behavior: 'smooth'
      });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } else {
    console.warn("未能找到对应的目录锚点：", slug);
  }
};
</script>