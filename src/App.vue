<template>
  <div class="h-screen w-screen bg-gray-100 font-sans flex flex-col overflow-hidden">
    
    <HomeView 
      v-if="!selectedAlgo && !isEditing"
      :categories="categories" :activeCategory="activeCategory" :sortedList="sortedFilteredAlgorithms"
      :getCategories="getCategories" :difficultyColor="difficultyColor"
      @update:activeCategory="activeCategory = $event"
      @select="startView" @create="createNew" @delete="deleteAlgo"
      @moveCat="moveCategory" @saveOrder="saveToDisk"
    />

    <div v-else class="h-full flex flex-col bg-white">
      <div class="pt-safe pb-4 border-b flex justify-between items-center px-8 bg-gray-50 shrink-0 z-10 shadow-sm">
        <div class="flex items-center space-x-4 w-full mt-2">
          <button @click="goBack" class="text-gray-600 font-bold hover:text-blue-600 text-lg shrink-0">← 返回列表</button>
          
          <template v-if="isEditing">
            <div class="flex-1 flex space-x-3 border-l-2 border-gray-300 pl-4 items-center">
              <select v-model="editForm.type" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500 font-bold text-blue-700">
                <option value="algorithm">算法题</option>
                <option value="interview">面经/笔记</option>
              </select>
              <input v-model="editForm.title" placeholder="标题(支持数字前缀排序)" class="font-bold text-lg bg-white border px-3 py-1 rounded w-1/4 outline-none focus:border-blue-500" />
              <input v-model="editForm.category" placeholder="分类(空格或逗号分隔)" class="bg-white border px-3 py-1 rounded w-40 outline-none focus:border-blue-500" />
              <template v-if="editForm.type !== 'interview'">
                <select v-model="editForm.difficulty" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500">
                  <option value="简单">简单</option><option value="中等">中等</option><option value="困难">困难</option>
                </select>
                <select v-model="editForm.language" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500">
                  <option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option>
                  <option value="javascript">JS</option><option value="go">Go</option>
                </select>
              </template>
            </div>
            <button @click="saveAlgo" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 ml-4 shrink-0">
              保存
            </button>
          </template>

          <template v-else>
            <div class="flex-1 flex items-center px-4 space-x-6 border-l-2 border-gray-300 ml-4 overflow-hidden">
              <span :class="selectedAlgo.type === 'interview' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="text-xs px-2 py-1 rounded shrink-0">
                {{ selectedAlgo.type === 'interview' ? '面经' : '算法' }}
              </span>
              <h1 class="text-2xl font-bold truncate">{{ selectedAlgo.title }}</h1>
              <div class="flex space-x-2 shrink-0">
                <button @click="goPrev" :disabled="!hasPrev" :class="{'opacity-30 cursor-not-allowed': !hasPrev}" class="bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold hover:bg-gray-300 transition">&lt;</button>
                <button @click="goNext" :disabled="!hasNext" :class="{'opacity-30 cursor-not-allowed': !hasNext}" class="bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold hover:bg-gray-300 transition">&gt;</button>
              </div>
            </div>
            <div class="flex space-x-4 shrink-0">
              <button @click="startEdit" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300">编辑</button>
              <button @click="deleteAlgo(selectedAlgo.id)" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200">删除</button>
            </div>
          </template>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden relative" 
           @touchstart="handleSwipeStart" @touchend="handleSwipeEnd"
           @mousedown="handleSwipeStart" @mouseup="handleSwipeEnd">
        <InterviewView v-if="(isEditing ? editForm.type : selectedAlgo.type) === 'interview'" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
        <AlgoView v-else :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import localforage from 'localforage';
import HomeView from './components/HomeView.vue';
import AlgoView from './components/AlgoView.vue';
import InterviewView from './components/InterviewView.vue';

const algorithms = ref([]);
const activeCategory = ref('全部');
const selectedAlgo = ref(null);
const isEditing = ref(false);
const customCatOrder = ref([]); 
const editForm = ref({ id: '', title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {} });

// ================== 核心修复 1：严格区分存储环境 ==================
const extractAndSyncCategories = () => {
  const allCats = new Set(algorithms.value.flatMap(a => getCategories(a.category)));
  const ordered = customCatOrder.value.filter(c => allCats.has(c));
  const unordered = Array.from(allCats).filter(c => !ordered.includes(c));
  customCatOrder.value = [...ordered, ...unordered];
};

const loadData = async () => {
  try {
    const savedOrder = await localforage.getItem('cat-order');
    if (savedOrder) customCatOrder.value = savedOrder;

    let dataToUse = null;
    const isNative = Capacitor.isNativePlatform();

    // 1. 如果在平板原生环境，优先读取底层数据库
    if (isNative) {
      const localData = await localforage.getItem('algo-data');
      if (localData && localData.length > 0) dataToUse = localData;
    }

    // 2. 如果在电脑端 (或者平板初次安装没数据)，强制读取物理 data.json 确保最新！
    if (!dataToUse || !isNative) {
      const res = await fetch('/data.json?t=' + Date.now());
      if (res.ok) dataToUse = await res.json();
    }

    if (dataToUse) {
      algorithms.value = dataToUse.map(item => ({ type: item.type || 'algorithm', ...item }));
      extractAndSyncCategories(); // 初始化时梳理一次分类标签
      // 同步给底层数据库备份
      await localforage.setItem('algo-data', algorithms.value); 
    }
  } catch (e) { console.error("数据加载失败", e); }
};

const saveToDisk = async () => {
  try {
    const pureData = JSON.parse(JSON.stringify(algorithms.value));
    
    await localforage.setItem('algo-data', pureData);
    await localforage.setItem('cat-order', JSON.parse(JSON.stringify(customCatOrder.value)));

    if (!Capacitor.isNativePlatform()) {
      await fetch('/api/save', { method: 'POST', body: JSON.stringify(pureData) }).catch(() => {});
    }

    if (isEditing.value) {
      selectedAlgo.value = algorithms.value.find(a => a.id === editForm.value.id);
      isEditing.value = false;
    }
  } catch (e) { console.error(e); }
};

onMounted(() => {
  loadData();
  CapApp.addListener('backButton', () => {
    if (selectedAlgo.value || isEditing.value) goBack(); else CapApp.exitApp();
  });
});

// ================== 核心修复 2：滑动切题支持鼠标 ==================
let startX = 0;
const handleSwipeStart = (e) => {
  startX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].screenX;
};
const handleSwipeEnd = (e) => {
  if (isEditing.value) return; 
  let endX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].screenX;
  if (startX - endX > 80 && hasNext.value) goNext(); // 向左滑 -> 下一题
  if (endX - startX > 80 && hasPrev.value) goPrev(); // 向右滑 -> 上一题
};

// ================== 核心修复 3：真实的分类排序逻辑 ==================
const getCategories = (catStr) => {
  if (!catStr) return ['未分类'];
  const cats = catStr.split(/[\s,，]+/).filter(Boolean);
  return cats.length > 0 ? cats : ['未分类'];
};

// 纯展示用的 computed，不再包含任何改变数组自身的操作
const categories = computed(() => ['全部', ...customCatOrder.value]);

// 处理真实的排序移动
const moveCategory = (index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= customCatOrder.value.length) return;
  // 真实交换数组位置
  const temp = customCatOrder.value[index];
  customCatOrder.value[index] = customCatOrder.value[targetIndex];
  customCatOrder.value[targetIndex] = temp;
};

// ================== 其他业务逻辑 ==================
const sortedFilteredAlgorithms = computed(() => {
  let list = activeCategory.value === '全部' ? algorithms.value : algorithms.value.filter(a => getCategories(a.category).includes(activeCategory.value));
  return list.slice().sort((a, b) => {
    const numA = a.title.match(/^\d+/) ? parseInt(a.title.match(/^\d+/)[0], 10) : Number.MAX_SAFE_INTEGER;
    const numB = b.title.match(/^\d+/) ? parseInt(b.title.match(/^\d+/)[0], 10) : Number.MAX_SAFE_INTEGER;
    if (numA !== numB) return numA - numB;
    return a.title.localeCompare(b.title);
  });
});

const difficultyColor = (diff) => diff === '简单' ? 'bg-green-100 text-green-700' : diff === '中等' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
const currentIndex = computed(() => !selectedAlgo.value ? -1 : sortedFilteredAlgorithms.value.findIndex(a => a.id === selectedAlgo.value.id));
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < sortedFilteredAlgorithms.value.length - 1);

const goPrev = () => { if (hasPrev.value) selectedAlgo.value = sortedFilteredAlgorithms.value[currentIndex.value - 1]; };
const goNext = () => { if (hasNext.value) selectedAlgo.value = sortedFilteredAlgorithms.value[currentIndex.value + 1]; };
const goBack = () => { selectedAlgo.value = null; isEditing.value = false; };
const startView = (item) => { selectedAlgo.value = item; isEditing.value = false; };

const createNew = () => {
  editForm.value = { id: Date.now().toString(), title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {} };
  selectedAlgo.value = null;
  isEditing.value = true;
};
const startEdit = () => {
  editForm.value = JSON.parse(JSON.stringify(selectedAlgo.value));
  if (!editForm.value.images) editForm.value.images = {};
  if (!editForm.value.type) editForm.value.type = 'algorithm';
  isEditing.value = true;
};
const saveAlgo = async () => {
  if (!editForm.value.title) return alert("标题不能为空！");
  const index = algorithms.value.findIndex(a => a.id === editForm.value.id);
  if (index >= 0) algorithms.value[index] = editForm.value;
  else algorithms.value.unshift(editForm.value);
  extractAndSyncCategories(); // 保存时如果产生了新分类，确保它被加入排序列表
  await saveToDisk();
};
const deleteAlgo = async (id) => {
  if (!confirm("确定删除？")) return;
  algorithms.value = algorithms.value.filter(a => a.id !== id);
  extractAndSyncCategories();
  await saveToDisk();
  if (selectedAlgo.value?.id === id) goBack();
};
</script>