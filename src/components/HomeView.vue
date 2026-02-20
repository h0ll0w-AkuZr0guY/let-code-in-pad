<template>
  <div class="flex-1 flex flex-col h-full bg-gray-100 relative">
    <div class="sticky top-0 z-20 bg-gray-100 pt-safe px-8 pb-4 border-b border-gray-200 shadow-sm shrink-0 flex flex-col">
      <div class="flex justify-between items-center mt-2">
        <div class="flex space-x-4 overflow-x-auto flex-1 mr-4 py-2 px-1">
          <button 
            v-for="cat in categories" :key="cat" @click="$emit('update:activeCategory', cat)"
            class="px-5 py-2 rounded-full font-bold shadow-sm transition-colors text-lg whitespace-nowrap shrink-0"
            :style="getNavStyle(cat, activeCategory === cat)"
          >
            {{ cat }}
          </button>
        </div>
        <div class="flex space-x-3 shrink-0">
          <button @click="$emit('openTrash')" class="bg-white border border-gray-200 text-red-500 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-red-50">
            🗑️ 回收站
          </button>
          <button @click="showOrderModal = true" class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-50">
            ⚙️ 标签管理
          </button>
          <button @click="$emit('create')" class="bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-green-600">
            + 新建记录
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-8 py-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
        <div 
          v-for="item in sortedList" :key="item.id" 
          @click="handleClick(item)"
          @touchstart="startPress(item)" @touchend="cancelPress" 
          @mousedown="startPress(item)" @mouseup="cancelPress" @mouseleave="cancelPress"
          @contextmenu.prevent
          class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer transition flex flex-col justify-between min-h-[11rem] h-full group relative border-t-4 select-none"
          :class="item.type === 'interview' ? 'border-purple-400' : 'border-blue-400'"
        >
          <div v-if="item.isPinned" class="absolute -top-4 -right-3 text-3xl drop-shadow-md z-10 rotate-12">
            📌
          </div>

          <div>
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-gray-800 line-clamp-2 flex-1">{{ item.title }}</h3>
              <span :class="item.type === 'interview' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="text-xs px-2 py-1 rounded ml-2 shrink-0 font-bold">
                {{ item.type === 'interview' ? '面经' : '算法' }}
              </span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="cat in getCategories(item.category)" :key="cat" class="text-xs px-2 py-1 rounded-md font-medium shadow-sm transition-colors" :style="getBubbleStyle(cat)">
                {{ cat }}
              </span>
            </div>
          </div>
          <div class="mt-5 flex justify-between items-center shrink-0">
            <span v-if="item.type !== 'interview'" :class="['px-3 py-1 text-sm rounded-md font-medium', difficultyColor(item.difficulty)]">
              {{ item.difficulty }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="sortedList.length === 0" class="text-center text-gray-400 mt-20 text-lg">当前分类下没有内容，点击右上角新建一个吧！</div>
    </div>

    <div v-if="showOrderModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 rounded-xl backdrop-blur-sm">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-[28rem] max-h-[85%] flex flex-col">
        <div class="flex justify-between items-center mb-6 border-b pb-3">
          <h3 class="text-xl font-bold text-gray-800">自定义标签 & 颜色</h3>
          <button @click="closeOrderModal" class="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none">✕</button>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 pr-2">
          <div v-for="(cat, index) in categories.slice(1)" :key="cat" class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm transition hover:shadow">
            <div class="flex items-center space-x-4">
              <div class="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 shrink-0 cursor-pointer hover:scale-110 transition-transform shadow-inner">
                <input type="color" :value="customCatColors[cat] || '#9ca3af'" @input="(e) => $emit('updateCatColor', cat, e.target.value)" class="absolute -top-4 -left-4 w-16 h-16 cursor-pointer" />
              </div>
              <span class="font-bold text-gray-700 text-lg">{{ cat }}</span>
            </div>
            <div class="space-x-2 flex">
              <button @click="$emit('moveCat', index, -1)" :disabled="index === 0" class="w-8 h-8 flex items-center justify-center bg-white border text-blue-600 rounded-lg disabled:opacity-30 disabled:bg-gray-100 hover:bg-blue-50">↑</button>
              <button @click="$emit('moveCat', index, 1)" :disabled="index === categories.length - 2" class="w-8 h-8 flex items-center justify-center bg-white border text-blue-600 rounded-lg disabled:opacity-30 disabled:bg-gray-100 hover:bg-blue-50">↓</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps(['categories', 'activeCategory', 'sortedList', 'getCategories', 'difficultyColor', 'customCatColors']);
const emit = defineEmits(['update:activeCategory', 'select', 'create', 'openMenu', 'moveCat', 'saveOrder', 'updateCatColor', 'openTrash']);

const showOrderModal = ref(false);
const closeOrderModal = () => { showOrderModal.value = false; emit('saveOrder'); };

let pressTimer = null;
let isLongPress = false;

const startPress = (item) => {
  isLongPress = false;
  pressTimer = setTimeout(() => {
    isLongPress = true;
    emit('openMenu', item); // 长按呼出功能菜单
  }, 600); 
};

const cancelPress = () => { if (pressTimer) clearTimeout(pressTimer); };
const handleClick = (item) => { if (!isLongPress) emit('select', item); };

const getNavStyle = (cat, isActive) => {
  const color = props.customCatColors[cat];
  if (isActive) return { backgroundColor: color || '#2563eb', color: '#ffffff', border: `1px solid ${color || '#2563eb'}` };
  return { backgroundColor: '#ffffff', color: color || '#4b5563', border: `1px solid ${color || '#e5e7eb'}` };
};
const getBubbleStyle = (cat) => {
  const color = props.customCatColors[cat];
  if (color) return { backgroundColor: color + '1A', color: color, border: `1px solid ${color}` };
  return { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid transparent' };
};
</script>