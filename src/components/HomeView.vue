<template>
  <div class="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-900 relative transition-colors">
    <div class="sticky top-0 z-20 bg-gray-100 dark:bg-gray-900 pt-safe px-8 pb-3 border-b border-gray-200 dark:border-gray-800 shadow-sm shrink-0 flex flex-col transition-colors">
      <div class="flex justify-between items-center mb-4">
        <div class="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 transition-colors">
          <template v-if="appSpace === 'tech'">
            <button @click="$emit('update:activeTypeMode', 'all')" :class="activeTypeMode === 'all' ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'" class="px-6 py-1.5 rounded-lg font-bold transition">所有记录</button>
            <button @click="$emit('update:activeTypeMode', 'algorithm')" :class="activeTypeMode === 'algorithm' ? 'bg-blue-500 dark:bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'" class="px-6 py-1.5 rounded-lg font-bold transition">算法特训</button>
            <button @click="$emit('update:activeTypeMode', 'interview')" :class="activeTypeMode === 'interview' ? 'bg-purple-500 dark:bg-purple-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'" class="px-6 py-1.5 rounded-lg font-bold transition">面经笔记</button>
          </template>
          <template v-else>
            <button @click="$emit('update:activeTypeMode', 'all')" :class="activeTypeMode === 'all' ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'" class="px-6 py-1.5 rounded-lg font-bold transition">所有回忆</button>
            <button @click="$emit('update:activeTypeMode', 'diary')" :class="activeTypeMode === 'diary' ? 'bg-green-500 dark:bg-green-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'" class="px-6 py-1.5 rounded-lg font-bold transition">我的日记</button>
            <button @click="$emit('update:activeTypeMode', 'journal')" :class="activeTypeMode === 'journal' ? 'bg-orange-500 dark:bg-orange-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'" class="px-6 py-1.5 rounded-lg font-bold transition">个人手账</button>
          </template>
        </div>
        <div class="flex space-x-3 shrink-0">
          <button @click="$emit('openImportCenter')" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-purple-50 dark:hover:bg-gray-700 transition">📥 同步中心</button>
          <button @click="$emit('openUserCenter')" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition">👤 个人中心</button>
          <button @click="$emit('openTrash')" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 dark:text-red-400 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-red-50 dark:hover:bg-gray-700 transition">🗑️ 回收站</button>
          <button @click="showOrderModal = true" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">⚙️ 标签管理</button>
          <button @click="$emit('create')" :class="appSpace === 'tech' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'" class="text-white px-6 py-2 rounded-xl font-bold shadow-md">+ {{ appSpace === 'tech' ? '新建记录' : '写下心情' }}</button>
        </div>
      </div>
      <div class="flex space-x-4 overflow-x-auto py-2 px-1">
        <button v-for="cat in categories" :key="cat" @click="$emit('update:activeCategory', cat)" class="px-5 py-2 rounded-full font-bold shadow-sm transition-colors text-lg whitespace-nowrap shrink-0 border" :style="getNavStyle(cat, activeCategory === cat)">{{ cat }}</button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-8 py-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-28">
        <div 
          v-for="item in sortedList" :key="item.id" 
          @click="handleClick(item)" @touchstart="startPress(item)" @touchend="cancelPress" @mousedown="startPress(item)" @mouseup="cancelPress" @mouseleave="cancelPress" @contextmenu.prevent
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[11rem] h-full group relative border-t-4 select-none"
          :class="[getCardBorderClass(item.type), !isBulkMode ? 'hover:shadow-xl dark:hover:shadow-gray-900' : '', isBulkMode && selectedIds.includes(item.id) ? 'ring-4 ring-blue-400 dark:ring-blue-600 scale-[0.97]' : '', isBulkMode && !selectedIds.includes(item.id) ? 'opacity-60 scale-100 grayscale-[20%]' : '']"
        >
          <div v-if="isBulkMode" class="absolute top-4 right-4 z-20 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors" :class="selectedIds.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'">
            <span v-if="selectedIds.includes(item.id)" class="text-white text-sm font-bold leading-none">✓</span>
          </div>
          <div v-if="item.isPinned && !isBulkMode" class="absolute -top-4 -right-3 text-3xl drop-shadow-md z-10 rotate-12">📌</div>
          <div>
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 line-clamp-2 flex-1">{{ item.title }}</h3>
              <span v-if="!isBulkMode" :class="getTypeBadgeClass(item.type)" class="text-xs px-2 py-1 rounded ml-2 shrink-0 font-bold">{{ getTypeName(item.type) }}</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="cat in getCategories(item.category)" :key="cat" class="text-xs px-2 py-1 rounded-md font-medium shadow-sm transition-colors border" :style="getBubbleStyle(cat)">{{ cat }}</span>
            </div>
          </div>
          <div class="mt-5 flex justify-between items-center shrink-0">
            <span v-if="['algorithm'].includes(item.type)" :class="['px-3 py-1 text-sm rounded-md font-medium', difficultyColor(item.difficulty)]">{{ item.difficulty }}</span>
            <span v-else class="text-gray-400 dark:text-gray-500 text-xs font-mono">{{ new Date(parseInt(item.id)).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
      <div v-if="sortedList.length === 0" class="text-center text-gray-400 dark:text-gray-600 mt-20 text-lg">当前视图下没有内容，点击右上角新建一个吧！</div>
    </div>

    <div class="absolute bottom-8 right-8 flex flex-col space-y-4 z-30" v-if="!isBulkMode">
      <button @click="$emit('toggleDarkMode')" class="w-14 h-14 bg-gray-800 dark:bg-gray-100 text-yellow-300 dark:text-gray-800 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center text-2xl hover:scale-110 transition group relative border dark:border-transparent border-gray-700">
        {{ isDarkMode ? '☀️' : '🌙' }}
        <span class="absolute right-16 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none shadow-md">
          {{ isDarkMode ? '切换浅色模式' : '切换深色模式' }}
        </span>
      </button>
      <button @click="$emit('toggleSort')" class="w-14 h-14 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group relative">
        {{ sortMode === 'time' ? '🕒' : '🔤' }}
        <span class="absolute right-16 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none shadow-md">
          当前: {{ sortMode === 'time' ? '按创建时间排列' : '按自定义序号排列' }}
        </span>
      </button>
      <button @click="enterBulkMode" class="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.4)] flex items-center justify-center text-white text-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition group relative">
        ☑️
        <span class="absolute right-16 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none shadow-md">
          批量管理
        </span>
      </button>
    </div>

    <div v-if="isBulkMode" class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-15px_30px_rgba(0,0,0,0.05)] p-4 px-8 z-40 flex justify-between items-center transition-transform">
      <div class="flex items-center space-x-4">
        <button @click="exitBulkMode" class="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-bold px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition">取消</button>
        <span class="font-bold text-gray-700 dark:text-gray-200 text-lg">已选择 <span class="text-blue-600 dark:text-blue-400">{{ selectedIds.length }}</span> 项</span>
      </div>
      <div class="flex items-center space-x-3">
        <button @click="toggleSelectAll" class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition border border-blue-100 dark:border-blue-800 w-48">
          {{ isAllSelected ? '取消全选' : '全选当前视图' }}
        </button>
        <button @click="$emit('requestBulkDelete', selectedIds)" :disabled="selectedIds.length === 0" class="bg-red-500 dark:bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 dark:hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
          🗑️ 批量移入回收站
        </button>
      </div>
    </div>

    <div v-if="showOrderModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[28rem] max-h-[85%] flex flex-col">
        <div class="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-3">
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">自定义标签排序 <span class="text-sm text-gray-400 font-normal ml-2">(长按≡拖拽)</span></h3>
          <button @click="closeOrderModal" class="text-gray-400 dark:text-gray-500 hover:text-red-500 font-bold text-2xl leading-none">✕</button>
        </div>
        
        <div ref="sortableContainer" class="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
          <div v-for="cat in globalCategories" :key="cat" class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm transition group cursor-grab active:cursor-grabbing">
            <div class="flex items-center space-x-4">
              <div class="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-500 shrink-0 cursor-pointer hover:scale-110 transition-transform shadow-inner z-10">
                <input type="color" :value="customCatColors[cat] || '#9ca3af'" @input="(e) => $emit('updateCatColor', cat, e.target.value)" class="absolute -top-4 -left-4 w-16 h-16 cursor-pointer" />
              </div>
              <span class="font-bold text-gray-700 dark:text-gray-200 text-lg select-none">{{ cat }}</span>
            </div>
            <div class="text-gray-300 dark:text-gray-500 text-2xl px-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors pointer-events-none">
              ≡
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import Sortable from 'sortablejs'; // 【新增依赖】

const props = defineProps(['categories', 'globalCategories', 'activeCategory', 'activeTypeMode', 'appSpace', 'sortedList', 'getCategories', 'difficultyColor', 'customCatColors', 'sortMode', 'isDarkMode']);
// 将原先的 'moveCat' 替换为更强大的 'reorderCat'
const emit = defineEmits(['update:activeCategory', 'update:activeTypeMode', 'select', 'create', 'openMenu', 'reorderCat', 'saveOrder', 'updateCatColor', 'openTrash', 'openUserCenter', 'openImportCenter', 'toggleSort', 'toggleDarkMode', 'requestBulkDelete']);

const showOrderModal = ref(false);
const closeOrderModal = () => { showOrderModal.value = false; emit('saveOrder'); };

// ================== SortableJS 拖拽引擎 ==================
const sortableContainer = ref(null);
let sortableInstance = null;

// 监听 Modal 打开时，初始化拖拽引擎
watch(showOrderModal, async (newVal) => {
  if (newVal) {
    await nextTick(); // 确保 DOM 已渲染
    if (sortableContainer.value) {
      sortableInstance = Sortable.create(sortableContainer.value, {
        animation: 250, // 丝滑过渡动画
        delay: 200, // 移动端长按 200ms 后才触发拖拽 (防止与滑动冲突)
        delayOnTouchOnly: true, // 仅触摸屏需要长按，电脑鼠标即点即拖
        ghostClass: 'opacity-40', // 拖出位置的残影
        dragClass: 'scale-105', // 抓起时的放大效果
        onEnd: (evt) => {
          if (evt.oldIndex !== evt.newIndex) {
            emit('reorderCat', evt.oldIndex, evt.newIndex);
          }
        }
      });
    }
  } else {
    // 关闭时清理引擎
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }
  }
});

// ================== 其他逻辑保持不变 ==================
const isBulkMode = ref(false);
const selectedIds = ref([]);
const isAllSelected = computed(() => props.sortedList.length > 0 && selectedIds.value.length === props.sortedList.length);

const enterBulkMode = () => { isBulkMode.value = true; selectedIds.value = []; };
const exitBulkMode = () => { isBulkMode.value = false; selectedIds.value = []; };
defineExpose({ exitBulkMode }); 

const toggleSelectAll = () => { if (isAllSelected.value) selectedIds.value = []; else selectedIds.value = props.sortedList.map(i => i.id); };

let pressTimer = null; let isLongPress = false;
const startPress = (item) => { if (isBulkMode.value) return; isLongPress = false; pressTimer = setTimeout(() => { isLongPress = true; emit('openMenu', item); }, 600); };
const cancelPress = () => { if (pressTimer) clearTimeout(pressTimer); };
const handleClick = (item) => { if (isBulkMode.value) { const idx = selectedIds.value.indexOf(item.id); if (idx > -1) selectedIds.value.splice(idx, 1); else selectedIds.value.push(item.id); return; } if (!isLongPress) emit('select', item); };

const getNavStyle = (cat, isActive) => { const color = props.customCatColors[cat]; if (isActive) return { backgroundColor: color || '#2563eb', color: '#ffffff', borderColor: color || '#2563eb' }; return { backgroundColor: props.isDarkMode ? '#1f2937' : '#ffffff', color: color || (props.isDarkMode ? '#e5e7eb' : '#4b5563'), borderColor: color || (props.isDarkMode ? '#374151' : '#e5e7eb') }; };
const getBubbleStyle = (cat) => { const color = props.customCatColors[cat]; if (color) return { backgroundColor: color + '26', color: color, borderColor: color }; return { backgroundColor: props.isDarkMode ? '#374151' : '#f3f4f6', color: props.isDarkMode ? '#d1d5db' : '#6b7280', borderColor: 'transparent' }; };
const getTypeBadgeClass = (type) => { switch(type) { case 'interview': return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'; case 'diary': return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'; case 'journal': return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'; default: return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'; } };
const getTypeName = (type) => { switch(type) { case 'interview': return '面经'; case 'diary': return '日记'; case 'journal': return '手账'; default: return '算法'; } };
const getCardBorderClass = (type) => { switch(type) { case 'interview': return 'border-purple-400 dark:border-purple-600'; case 'diary': return 'border-green-400 dark:border-green-600'; case 'journal': return 'border-orange-400 dark:border-orange-600'; default: return 'border-blue-400 dark:border-blue-600'; } };
</script>