<template>
  <div class="h-screen w-screen bg-gray-100 font-sans flex flex-col overflow-hidden relative">
    
    <HomeView 
      v-if="!selectedAlgo && !isEditing"
      :categories="categories" :activeCategory="activeCategory" :sortedList="sortedFilteredAlgorithms"
      :getCategories="getCategories" :difficultyColor="difficultyColor" :customCatColors="customCatColors"
      @update:activeCategory="activeCategory = $event"
      @select="startView" @create="createNew" @openMenu="openActionMenu"
      @moveCat="moveCategory" @saveOrder="saveToDisk" @updateCatColor="updateCatColor"
      @openTrash="showTrashModal = true"
    />

    <div v-else class="h-full flex flex-col bg-white">
      <div class="pt-safe pb-4 border-b border-gray-200 shadow-sm flex justify-between items-center px-8 bg-gray-50 shrink-0 z-20">
        <div class="flex items-center space-x-4 w-full mt-2">
          <button @click="goBack" class="text-gray-600 font-bold hover:text-blue-600 text-lg shrink-0">← 返回列表</button>
          
          <template v-if="isEditing">
            <div class="flex-1 flex space-x-3 border-l-2 border-gray-300 pl-4 items-center">
              <select v-model="editForm.type" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500 font-bold text-blue-700">
                <option value="algorithm">算法题</option><option value="interview">面经/笔记</option>
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
            <button @click="saveAlgo" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 ml-4 shrink-0">保存</button>
          </template>

          <template v-else>
            <div class="flex-1 flex items-center px-4 space-x-6 border-l-2 border-gray-300 ml-4 overflow-hidden">
              <span :class="selectedAlgo.type === 'interview' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="text-xs px-2 py-1 rounded shrink-0 font-bold">
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
              <button @click="triggerDelete(selectedAlgo)" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200">删除</button>
            </div>
          </template>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden relative" @touchstart="handleSwipeStart" @touchend="handleSwipeEnd" @mousedown="handleSwipeStart" @mouseup="handleSwipeEnd">
        <InterviewView v-if="(isEditing ? editForm.type : selectedAlgo.type) === 'interview'" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
        <AlgoView v-else :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
      </div>
    </div>

    <ActionMenuModal 
      :show="showActionMenu" :item="actionItem"
      @close="showActionMenu = false"
      @pin="togglePin" @edit="handleMenuEdit" @delete="handleMenuDelete"
    />
    
    <TrashModal 
      :show="showTrashModal" :trashList="trashList"
      @close="showTrashModal = false" @restore="restoreItem" @delete="permanentlyDelete"
    />

    <div v-if="showDeleteConfirm" class="absolute inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-[24rem] flex flex-col">
        <h3 class="text-xl font-bold text-gray-800 mb-2">移入回收站</h3>
        <p class="text-gray-500 mb-6">确定将 <span class="font-bold text-gray-700">"{{ itemToDelete?.title }}"</span> 移入回收站？</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">取消</button>
          <button @click="confirmDelete" class="px-5 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-md">确定</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import localforage from 'localforage';
import HomeView from './components/HomeView.vue';
import AlgoView from './components/AlgoView.vue';
import InterviewView from './components/InterviewView.vue';
import ActionMenuModal from './components/ActionMenuModal.vue';
import TrashModal from './components/TrashModal.vue';

const algorithms = ref([]);
const trashList = ref([]); 
const activeCategory = ref('全部');
const selectedAlgo = ref(null);
const isEditing = ref(false);
const customCatOrder = ref([]); 
const customCatColors = ref({}); 
const editForm = ref({ id: '', title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {}, isPinned: false });

// 模态框状态
const showDeleteConfirm = ref(false);
const showTrashModal = ref(false);
const itemToDelete = ref(null);
const showActionMenu = ref(false);
const actionItem = ref(null);

// ================== 长按菜单操作 ==================
const openActionMenu = (item) => {
  actionItem.value = item;
  showActionMenu.value = true;
};

const togglePin = async (item) => {
  const idx = algorithms.value.findIndex(a => a.id === item.id);
  if (idx !== -1) {
    algorithms.value[idx].isPinned = !algorithms.value[idx].isPinned;
    showActionMenu.value = false;
    await saveToDisk();
  }
};

const handleMenuEdit = (item) => {
  showActionMenu.value = false;
  selectedAlgo.value = item;
  startEdit();
};

const handleMenuDelete = (item) => {
  showActionMenu.value = false;
  triggerDelete(item);
};

// ================== 删除与回收站 ==================
const triggerDelete = (item) => { itemToDelete.value = item; showDeleteConfirm.value = true; };
const confirmDelete = async () => {
  const item = itemToDelete.value;
  algorithms.value = algorithms.value.filter(a => a.id !== item.id);
  trashList.value.unshift(item); 
  showDeleteConfirm.value = false;
  extractAndSyncCategories();
  await saveToDisk();
  if (selectedAlgo.value?.id === item.id) goBack();
};
const restoreItem = async (item) => {
  trashList.value = trashList.value.filter(a => a.id !== item.id);
  algorithms.value.unshift(item);
  extractAndSyncCategories();
  await saveToDisk();
};
const permanentlyDelete = async (item) => {
  if (confirm(`彻底删除 "${item.title}" 将无法找回，确认删除？`)) {
    trashList.value = trashList.value.filter(a => a.id !== item.id);
    await saveToDisk();
  }
};

// ================== 数据装载与保存 ==================
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
    const savedColors = await localforage.getItem('cat-colors');
    if (savedColors) customCatColors.value = savedColors;
    const savedTrash = await localforage.getItem('algo-trash');
    if (savedTrash) trashList.value = savedTrash;

    let dataToUse = null;
    const isNative = Capacitor.isNativePlatform();
    
    if (isNative) {
      ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {});
      const localData = await localforage.getItem('algo-data');
      if (localData && localData.length > 0) dataToUse = localData;
    }
    
    if (!dataToUse || !isNative) {
      const res = await fetch('/data.json?t=' + Date.now());
      if (res.ok) dataToUse = await res.json();
    }

    if (dataToUse) {
      algorithms.value = dataToUse.map(item => ({ type: item.type || 'algorithm', isPinned: !!item.isPinned, ...item }));
      extractAndSyncCategories();
      await localforage.setItem('algo-data', algorithms.value); 
    }
  } catch (e) { console.error("数据加载失败", e); }
};

const saveToDisk = async () => {
  try {
    const pureData = JSON.parse(JSON.stringify(algorithms.value));
    await localforage.setItem('algo-data', pureData);
    await localforage.setItem('algo-trash', JSON.parse(JSON.stringify(trashList.value)));
    await localforage.setItem('cat-order', JSON.parse(JSON.stringify(customCatOrder.value)));
    await localforage.setItem('cat-colors', JSON.parse(JSON.stringify(customCatColors.value)));

    if (!Capacitor.isNativePlatform()) {
      await fetch('/api/save', { method: 'POST', body: JSON.stringify(pureData) }).catch(() => {});
    }
    if (isEditing.value) {
      selectedAlgo.value = algorithms.value.find(a => a.id === editForm.value.id);
      isEditing.value = false;
    }
  } catch (e) { console.error(e); }
};

const updateCatColor = async (cat, color) => { customCatColors.value[cat] = color; await saveToDisk(); };

onMounted(() => {
  loadData();
  CapApp.addListener('backButton', () => {
    if (showActionMenu.value) showActionMenu.value = false;
    else if (showDeleteConfirm.value) showDeleteConfirm.value = false;
    else if (showTrashModal.value) showTrashModal.value = false;
    else if (selectedAlgo.value || isEditing.value) goBack(); 
    else CapApp.exitApp();
  });
});

let startX = 0;
const handleSwipeStart = (e) => { startX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].screenX; };
const handleSwipeEnd = (e) => {
  if (isEditing.value) return; 
  let endX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].screenX;
  if (startX - endX > 80 && hasNext.value) goNext();
  if (endX - startX > 80 && hasPrev.value) goPrev();
};

const getCategories = (catStr) => {
  if (!catStr) return ['未分类'];
  const cats = catStr.split(/[\s,，]+/).filter(Boolean);
  return cats.length > 0 ? cats : ['未分类'];
};

const categories = computed(() => ['全部', ...customCatOrder.value]);
const moveCategory = (index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= customCatOrder.value.length) return;
  const temp = customCatOrder.value[index];
  customCatOrder.value[index] = customCatOrder.value[targetIndex];
  customCatOrder.value[targetIndex] = temp;
};

// 【核心排序修改】：加入了 isPinned 属性的判断逻辑
const sortedFilteredAlgorithms = computed(() => {
  let list = activeCategory.value === '全部' ? algorithms.value : algorithms.value.filter(a => getCategories(a.category).includes(activeCategory.value));
  return list.slice().sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

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
  editForm.value = { id: Date.now().toString(), title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {}, isPinned: false };
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
  extractAndSyncCategories(); 
  await saveToDisk();
};
</script>