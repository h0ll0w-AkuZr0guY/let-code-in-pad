<template>
  <div class="h-screen w-screen bg-gray-100 font-sans flex flex-col overflow-hidden" :class="{'select-none': isDragging}">
    
    <div v-if="!selectedAlgo && !isEditing" class="flex-1 flex flex-col px-8 pb-6 pt-safe">
      <div class="flex justify-between items-center mb-6 pb-2 mt-4">
        <div class="flex space-x-4 overflow-x-auto">
          <button 
            v-for="cat in categories" :key="cat"
            @click="activeCategory = cat"
            :class="['px-5 py-2 rounded-full font-bold shadow-sm transition-colors text-lg whitespace-nowrap', 
                     activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
          >
            {{ cat }}
          </button>
        </div>
        <button @click="createNew" class="bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-green-600 shrink-0">
          + 新建算法
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto pb-10 pr-2">
        <div 
          v-for="item in sortedFilteredAlgorithms" :key="item.id"
          @click="selectedAlgo = item"
          class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer transition flex flex-col justify-between h-40 group relative"
        >
          <div>
            <h3 class="text-xl font-bold text-gray-800 line-clamp-2">{{ item.title }}</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="cat in getCategories(item.category)" :key="cat" class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                {{ cat }}
              </span>
            </div>
          </div>
          <div class="mt-4 flex justify-between items-center">
            <span :class="['px-3 py-1 text-sm rounded-md font-medium', difficultyColor(item.difficulty)]">
              {{ item.difficulty }}
            </span>
            <button @click.stop="deleteAlgo(item.id)" class="text-red-500 opacity-0 group-hover:opacity-100 transition">删除</button>
          </div>
        </div>
        <div v-if="sortedFilteredAlgorithms.length === 0" class="col-span-full text-center text-gray-400 mt-10 text-lg">
          当前分类下没有题目，点击右上角新建一个吧！
        </div>
      </div>
    </div>

    <div v-else class="h-full flex flex-col bg-white">
      <div class="pt-safe pb-4 border-b flex justify-between items-center px-8 bg-gray-50 shrink-0 z-10 shadow-sm">
        <div class="flex items-center space-x-4 w-full mt-2">
          <button @click="goBack" class="text-gray-600 font-bold hover:text-blue-600 text-lg shrink-0">
            ← 返回列表
          </button>
          
          <template v-if="isEditing">
            <div class="flex-1 flex space-x-3 border-l-2 border-gray-300 pl-4 items-center">
              <input v-model="editForm.title" placeholder="算法标题(如 01.二叉树)" class="font-bold text-lg bg-white border px-3 py-1 rounded w-1/4 outline-none focus:border-blue-500" />
              <input v-model="editForm.category" placeholder="分类(用空格或逗号分隔多个)" class="bg-white border px-3 py-1 rounded w-48 outline-none focus:border-blue-500" />
              <select v-model="editForm.difficulty" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500">
                <option value="简单">简单</option>
                <option value="中等">中等</option>
                <option value="困难">困难</option>
              </select>
              <span class="text-gray-500 text-sm ml-2">语言:</span>
              <select v-model="editForm.language" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500">
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="go">Go</option>
                <option value="c">C</option>
              </select>
            </div>
            <button @click="saveAlgo" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 ml-4 shrink-0">
              保存至本地
            </button>
          </template>

          <template v-else>
            <div class="flex-1 flex items-center px-4 space-x-6 border-l-2 border-gray-300 ml-4 overflow-hidden">
              <h1 class="text-2xl font-bold truncate">{{ selectedAlgo.title }}</h1>
              <div class="flex space-x-2 shrink-0">
                <button @click="goPrev" :disabled="!hasPrev" :class="{'opacity-30 cursor-not-allowed': !hasPrev}" class="bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold hover:bg-gray-300 transition">&lt; 上一题</button>
                <button @click="goNext" :disabled="!hasNext" :class="{'opacity-30 cursor-not-allowed': !hasNext}" class="bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold hover:bg-gray-300 transition">下一题 &gt;</button>
              </div>
            </div>
            <div class="flex space-x-4 shrink-0">
              <button @click="startEdit" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300">编辑</button>
              <button @click="deleteAlgo(selectedAlgo.id)" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200">删除</button>
            </div>
          </template>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden relative">
        <div class="flex flex-col bg-white" :style="{ width: leftWidth + '%' }">
          <h2 class="text-sm font-bold text-gray-400 tracking-widest uppercase p-4 border-b shrink-0 bg-gray-50">题目描述</h2>
          <div class="p-6 flex-1 overflow-y-auto">
            <textarea v-if="isEditing" v-model="editForm.problemText" @paste="(e) => handleImagePaste(e, 'problemText')" placeholder="支持 Markdown 语法。Ctrl+V 粘贴截图..." class="w-full h-full resize-none outline-none text-lg p-2 border-2 border-dashed border-gray-200 rounded-lg focus:border-blue-400 focus:bg-blue-50 transition"></textarea>
            <div v-else class="prose max-w-none text-lg" v-html="renderMarkdown(selectedAlgo.problemText, selectedAlgo.images)"></div>
          </div>
        </div>
        <div class="w-3 cursor-col-resize bg-gray-100 hover:bg-blue-300 active:bg-blue-500 z-10 flex flex-col justify-center items-center transition-colors shadow-inner" @mousedown="startDrag" @touchstart="startDrag">
          <div class="h-12 w-1 bg-gray-400 rounded-full"></div>
        </div>
        <div class="flex flex-col bg-[#1e1e1e]" :style="{ width: (100 - leftWidth) + '%' }">
          <h2 class="text-sm font-bold text-gray-500 tracking-widest uppercase p-4 border-b border-gray-700 shrink-0 bg-[#2d2d2d] flex justify-between items-center">
            <span>题解与代码</span>
            <span v-if="!isEditing" class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">{{ selectedAlgo.language || 'python' }}</span>
          </h2>
          <div class="p-6 flex-1 overflow-y-auto">
            <textarea v-if="isEditing" v-model="editForm.solutionText" @paste="(e) => handleImagePaste(e, 'solutionText')" placeholder="直接粘贴纯代码（会自动按顶部语言高亮），或书写 Markdown..." class="w-full h-full resize-none outline-none text-lg p-2 bg-transparent text-gray-200 font-mono border-2 border-dashed border-gray-600 rounded-lg focus:border-blue-400"></textarea>
            <div v-else class="prose prose-invert max-w-none text-lg" v-html="renderSolution(selectedAlgo)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; 
import { App as CapApp } from '@capacitor/app';

// ---------------- Markdown 配置 ----------------
const md = new MarkdownIt({
  html: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try { return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + '</code></pre>'; } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const renderMarkdown = (text, images = {}) => {
  if (!text) return '';
  let processText = text;
  processText = processText.replace(/\]\(local:([^)]+)\)/g, (match, imgId) => {
    return `](${images[imgId] || ''})`;
  });
  return md.render(processText);
};

const renderSolution = (item) => {
  let text = item.solutionText || '';
  const lang = item.language || 'python';
  if (!text.includes('```') && text.trim().length > 0) {
    text = `\`\`\`${lang}\n${text}\n\`\`\``;
  }
  return renderMarkdown(text, item.images);
};

// ---------------- 状态管理 ----------------
const algorithms = ref([]);
const activeCategory = ref('全部');
const selectedAlgo = ref(null);
const isEditing = ref(false);

const editForm = ref({ 
  id: '', title: '', category: '', difficulty: '中等', language: 'python', 
  problemText: '', solutionText: '', images: {} 
});

// ---------------- 拖拽分栏逻辑 ----------------
const leftWidth = ref(50);
const isDragging = ref(false);

const startDrag = () => {
  isDragging.value = true;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const newWidth = (clientX / window.innerWidth) * 100;
  if (newWidth > 20 && newWidth < 80) leftWidth.value = newWidth;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);
};

// ---------------- 数据加载与保存 ----------------
const loadData = async () => {
  try {
    const res = await fetch('/data.json?t=' + Date.now());
    if (res.ok) algorithms.value = await res.json();
  } catch (e) { console.log("等待创建初始数据..."); }
};

onMounted(() => {
  loadData();
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (selectedAlgo.value) goBack();
    else CapApp.exitApp();
  });
});

const saveToDisk = async () => {
  try {
    const pureData = JSON.parse(JSON.stringify(algorithms.value));
    const res = await fetch('/api/save', { method: 'POST', body: JSON.stringify(pureData) });
    if (res.ok) {
      await loadData();
      selectedAlgo.value = algorithms.value.find(a => a.id === editForm.value.id);
      isEditing.value = false;
    } else alert("保存到硬盘失败！");
  } catch (e) { console.error(e); }
};

// ---------------- 【核心新增】：多标签解析逻辑 ----------------
// 使用正则将字符串按照 空格、英文逗号、中文逗号 拆分为数组
const getCategories = (catStr) => {
  if (!catStr) return ['未分类'];
  const cats = catStr.split(/[\s,，]+/).filter(Boolean);
  return cats.length > 0 ? cats : ['未分类'];
};

// 提取全部分类（去重）
const categories = computed(() => {
  const allCats = algorithms.value.flatMap(a => getCategories(a.category));
  return ['全部', ...new Set(allCats)];
});

// 列表排序过滤（支持多标签判断）
const sortedFilteredAlgorithms = computed(() => {
  let list = activeCategory.value === '全部' 
    ? algorithms.value 
    : algorithms.value.filter(a => getCategories(a.category).includes(activeCategory.value)); // 判断拆分后的数组中是否包含当前选中的标签

  return list.slice().sort((a, b) => {
    const matchA = a.title.match(/^\d+/);
    const matchB = b.title.match(/^\d+/);
    const numA = matchA ? parseInt(matchA[0], 10) : Number.MAX_SAFE_INTEGER;
    const numB = matchB ? parseInt(matchB[0], 10) : Number.MAX_SAFE_INTEGER;
    
    if (numA !== numB) return numA - numB;
    return a.title.localeCompare(b.title);
  });
});

const difficultyColor = (diff) => diff === '简单' ? 'bg-green-100 text-green-700' : diff === '中等' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

// ---------------- 翻页与基础交互 ----------------
const currentIndex = computed(() => {
  if (!selectedAlgo.value) return -1;
  return sortedFilteredAlgorithms.value.findIndex(a => a.id === selectedAlgo.value.id);
});

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < sortedFilteredAlgorithms.value.length - 1);

const goPrev = () => { if (hasPrev.value) selectedAlgo.value = sortedFilteredAlgorithms.value[currentIndex.value - 1]; };
const goNext = () => { if (hasNext.value) selectedAlgo.value = sortedFilteredAlgorithms.value[currentIndex.value + 1]; };

const goBack = () => { selectedAlgo.value = null; isEditing.value = false; };
const createNew = () => {
  editForm.value = { id: Date.now().toString(), title: '', category: '', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {} };
  selectedAlgo.value = null;
  isEditing.value = true;
};
const startEdit = () => {
  editForm.value = JSON.parse(JSON.stringify(selectedAlgo.value));
  if (!editForm.value.images) editForm.value.images = {};
  if (!editForm.value.language) editForm.value.language = 'python';
  isEditing.value = true;
};

const saveAlgo = async () => {
  if (!editForm.value.title) return alert("标题不能为空！");
  const index = algorithms.value.findIndex(a => a.id === editForm.value.id);
  if (index >= 0) algorithms.value[index] = editForm.value;
  else algorithms.value.unshift(editForm.value);
  await saveToDisk();
};

const deleteAlgo = async (id) => {
  if (!confirm("确定删除？（本地硬盘文件 data.json 也将被更新）")) return;
  algorithms.value = algorithms.value.filter(a => a.id !== id);
  await saveToDisk();
  if (selectedAlgo.value?.id === id) goBack();
};

const handleImagePaste = (event, targetField) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      event.preventDefault();
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Str = e.target.result;
        const imgId = 'img_' + Date.now() + Math.floor(Math.random() * 100);
        if (!editForm.value.images) editForm.value.images = {};
        editForm.value.images[imgId] = base64Str;
        const imgMarkdown = `\n![图片](local:${imgId})\n`;
        const textarea = event.target;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const text = editForm.value[targetField];
        editForm.value[targetField] = text.substring(0, startPos) + imgMarkdown + text.substring(endPos);
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = startPos + imgMarkdown.length;
        }, 10);
      };
      reader.readAsDataURL(blob);
      break;
    }
  }
};
</script>

<style>
/* 安全区适配 */
.pt-safe {
  padding-top: calc(env(safe-area-inset-top, 0px) + 2rem);
}
img { max-width: 100%; border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem; }
.hljs { border-radius: 8px; padding: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; font-size: 1.1rem;}

/* ================== 终极修复：行内代码块 ================== */

/* 1. 彻底干掉 Tailwind 默认给 inline code 两侧加的恶心反引号 */
.prose code::before,
.prose code::after {
  content: none !important;
}

/* 2. 强制覆盖左侧（浅色区域）的行内代码样式 */
.prose code:not(pre code) {
  background-color: #f1f5f9 !important; /* 浅灰底色 */
  color: #ef4444 !important; /* 鲜艳的红色字体 */
  padding: 0.15rem 0.4rem !important;
  border-radius: 0.3rem !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-weight: 600 !important;
  font-size: 0.85em !important;
  word-break: break-word !important;
}

/* 3. 强制覆盖右侧（深色代码区域）的行内代码样式 */
.prose-invert code:not(pre code) {
  background-color: #3f3f46 !important; /* 深灰底色 */
  color: #fca5a5 !important; /* 柔和的浅红字体 */
}
</style>