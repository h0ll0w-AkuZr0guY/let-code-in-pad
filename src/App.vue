<template>
  <div class="h-screen w-screen bg-gray-100 dark:bg-gray-900 font-sans flex flex-col overflow-hidden relative transition-colors duration-300">
    
    <HomeView 
      ref="homeViewRef" v-if="!selectedAlgo && !isEditing"
      :appSpace="appSpace" :activeTypeMode="activeTypeMode" @update:activeTypeMode="handleModeChange"
      :categories="activeModeCategories" :globalCategories="customCatOrder" 
      :activeCategory="activeCategory" :sortedList="sortedFilteredAlgorithms"
      :getCategories="getCategories" :difficultyColor="difficultyColor" :customCatColors="customCatColors"
      :sortMode="sortMode" :isDarkMode="isDarkMode" 
      @toggleSort="toggleSort" @toggleDarkMode="toggleDarkMode" @requestBulkDelete="handleBulkDeleteRequest"
      @update:activeCategory="activeCategory = $event"
      @select="startView" @create="createNew" @openMenu="openActionMenu"
      @moveCat="moveCategory" @saveOrder="saveToDisk" @updateCatColor="updateCatColor"
      @openTrash="showTrashModal = true" @openUserCenter="showUserCenter = true"
      @openImportCenter="showImportModal = true"
    />

    <div v-else class="h-full flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <div class="pt-safe pb-4 border-b border-gray-200 dark:border-gray-800 shadow-sm flex justify-between items-center px-8 bg-gray-50 dark:bg-gray-900 shrink-0 z-20">
        <div class="flex items-center space-x-4 w-full mt-2">
          <button @click="goBack" class="text-gray-600 dark:text-gray-400 font-bold hover:text-blue-600 dark:hover:text-blue-400 text-lg shrink-0">← 返回列表</button>
          
          <template v-if="isEditing">
            <div class="flex-1 flex space-x-3 border-l-2 border-gray-300 dark:border-gray-700 pl-4 items-center">
              <select v-model="editForm.type" class="bg-white dark:bg-gray-800 border dark:border-gray-700 px-3 py-1 rounded outline-none font-bold"
                      :class="appSpace === 'tech' ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'">
                <template v-if="appSpace === 'tech'"><option value="algorithm">算法题</option><option value="interview">面经/笔记</option></template>
                <template v-else><option value="diary">我的日记</option><option value="journal">个人手账</option></template>
              </select>
              <input v-model="editForm.title" placeholder="标题(支持数字前缀排序)" class="font-bold text-lg bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 px-3 py-1 rounded w-1/4 outline-none focus:border-blue-500" />
              <input v-model="editForm.category" placeholder="分类(空格或逗号分隔)" class="bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 px-3 py-1 rounded w-40 outline-none focus:border-blue-500" />
              <template v-if="editForm.type === 'algorithm'">
                <select v-model="editForm.difficulty" class="bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 px-3 py-1 rounded outline-none">
                  <option value="简单">简单</option><option value="中等">中等</option><option value="困难">困难</option>
                </select>
                <select v-model="editForm.language" class="bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 px-3 py-1 rounded outline-none">
                  <option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option>
                  <option value="javascript">JS</option><option value="go">Go</option>
                </select>
              </template>
            </div>
            <button @click="saveAlgo" class="text-white px-6 py-2 rounded-lg font-bold ml-4 shrink-0 shadow-md"
                    :class="appSpace === 'tech' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700' : 'bg-green-600 hover:bg-green-700 dark:bg-green-700'">保存更改</button>
          </template>

          <template v-else>
            <div class="flex-1 flex items-center px-4 space-x-6 border-l-2 border-gray-300 dark:border-gray-700 ml-4 overflow-hidden">
              <h1 class="text-2xl font-bold dark:text-white truncate">{{ selectedAlgo.title }}</h1>
            </div>
            <div class="flex space-x-4 shrink-0 z-50">
              <button @click="startEdit" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">编辑</button>
              <button @click="triggerDelete(selectedAlgo)" class="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-200 dark:hover:bg-red-800/60">删除</button>
            </div>
          </template>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden relative">
        <FloatingNav v-if="!isEditing" :hasPrev="hasPrev" :hasNext="hasNext" @prev="goPrev" @next="goNext" />
        
        <TocPanel :show="isTocOpen && !isEditing && selectedAlgo?.type !== 'algorithm'" :form="selectedAlgo" @close="isTocOpen = false" :contentFontSize="contentFontSize" />
        <DiaryView v-if="['diary', 'journal'].includes(isEditing ? editForm.type : selectedAlgo?.type)" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" :contentFontSize="contentFontSize" />
        <InterviewView v-else-if="(isEditing ? editForm.type : selectedAlgo?.type) === 'interview'" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" :contentFontSize="contentFontSize" />
        <AlgoView v-else :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" :contentFontSize="contentFontSize" />
      </div>

      <div v-if="selectedAlgo && !isEditing" class="fixed bottom-8 right-8 flex flex-col space-y-4 z-[100]">
        <div class="flex flex-col bg-white dark:bg-gray-800 rounded-full shadow-lg border dark:border-gray-700 border-gray-200 overflow-hidden group">
          <button @click="increaseFontSize" class="w-14 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition font-bold text-lg border-b border-gray-100 dark:border-gray-700">A+</button>
          <button @click="decreaseFontSize" class="w-14 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition font-bold text-sm">A-</button>
        </div>
        <button v-if="selectedAlgo.type !== 'algorithm'" @click="toggleToc" class="w-14 h-14 bg-white dark:bg-gray-800 text-blue-500 dark:text-blue-400 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-all border dark:border-gray-700 border-gray-200">📑</button>
        <button @click="toggleDarkMode" class="w-14 h-14 bg-gray-800 dark:bg-gray-100 text-yellow-300 dark:text-gray-800 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-all border dark:border-transparent border-gray-700">{{ isDarkMode ? '☀️' : '🌙' }}</button>
      </div>
    </div>

    <ActionMenuModal :show="showActionMenu" :item="actionItem" @close="showActionMenu = false" @pin="togglePin" @edit="handleMenuEdit" @delete="handleMenuDelete" @shareData="handleShareData" />
    <TrashModal :show="showTrashModal" :trashList="trashList" @close="showTrashModal = false" @restore="restoreItem" @requestPermDelete="handlePermDeleteRequest" @requestEmpty="handleEmptyTrashRequest" />
    <UserCenterModal :show="showUserCenter" :appSpace="appSpace" :defaultAppSpace="defaultAppSpace" :algoCount="algoCount" :interviewCount="interviewCount" :diaryCount="diaryCount" :journalCount="journalCount" @close="showUserCenter = false" @toggleAppSpace="toggleAppSpace" @toggleDefaultSpace="toggleDefaultSpace" @exportData="handleExportData" />
    <ImportSyncModal :show="showImportModal" :isSyncing="isSyncing" :savedGithubUrl="savedGithubUrl" @close="showImportModal = false" @syncGithub="handleGithubSync" @syncMarkdown="handleMarkdownImport" @syncClipboard="handleClipboardImport" />

    <div v-if="showDeleteConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"><div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[24rem] flex flex-col"><h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">移入回收站</h3><p class="text-gray-500 dark:text-gray-400 mb-6">确定将 <span class="font-bold text-gray-700 dark:text-gray-200">"{{ itemToDelete?.title }}"</span> 移入回收站？</p><div class="flex justify-end space-x-3"><button @click="showDeleteConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200">取消</button><button @click="confirmDelete" class="px-5 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md">确定</button></div></div></div>
    <div v-if="showBulkDeleteConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"><div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[24rem] flex flex-col"><h3 class="text-xl font-bold dark:text-red-400 text-red-600 mb-2">批量移入回收站</h3><p class="text-gray-500 dark:text-gray-400 mb-6">确定要将选中的 <span class="font-bold text-red-500 text-lg mx-1">{{ pendingBulkIds.length }}</span> 项移入回收站吗？</p><div class="flex justify-end space-x-3"><button @click="showBulkDeleteConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200">取消</button><button @click="confirmBulkDelete" class="px-5 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md">全部移动</button></div></div></div>
    <div v-if="showEmptyTrashConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"><div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[26rem] flex flex-col border-t-8 border-red-500"><h3 class="text-xl font-bold text-red-600 dark:text-red-400 mb-2">⚠️ 危险操作：彻底清空</h3><p class="text-gray-600 dark:text-gray-400 mb-6">彻底清空回收站后，<span class="font-bold text-black dark:text-white">所有数据将永远无法找回</span>。确认清空吗？</p><div class="flex justify-end space-x-3"><button @click="showEmptyTrashConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200">保留数据</button><button @click="confirmEmptyTrash" class="px-5 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-md">确认彻底清空</button></div></div></div>
    <div v-if="showPermDeleteConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"><div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[24rem] flex flex-col"><h3 class="text-xl font-bold text-red-600 dark:text-red-400 mb-2">彻底删除</h3><p class="text-gray-500 dark:text-gray-400 mb-6">彻底删除 <span class="font-bold text-gray-700 dark:text-gray-200">"{{ pendingPermItem?.title }}"</span> 将无法找回，确认？</p><div class="flex justify-end space-x-3"><button @click="showPermDeleteConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200">取消</button><button @click="confirmPermDelete" class="px-5 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md">彻底删除</button></div></div></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Clipboard } from '@capacitor/clipboard';
import localforage from 'localforage';
import { renderMarkdown } from './utils/core';

// 【导入解耦引擎】
import { useSyncEngine } from './composables/useSyncEngine';

import HomeView from './components/HomeView.vue';
import AlgoView from './components/AlgoView.vue';
import InterviewView from './components/InterviewView.vue';
import DiaryView from './components/DiaryView.vue'; 
import FloatingNav from './components/FloatingNav.vue'; 
import TocPanel from './components/TocPanel.vue'; 

import ActionMenuModal from './components/ActionMenuModal.vue';
import TrashModal from './components/TrashModal.vue';
import UserCenterModal from './components/UserCenterModal.vue';
import ImportSyncModal from './components/ImportSyncModal.vue';

const homeViewRef = ref(null);
const algorithms = ref([]);
const trashList = ref([]); 
const activeCategory = ref('全部');

const appSpace = ref('tech'); 
const defaultAppSpace = ref('tech');
const activeTypeMode = ref('all'); 
const sortMode = ref('time'); 

const isDarkMode = ref(false); 
const isTocOpen = ref(false); 
const contentFontSize = ref(18); 

const increaseFontSize = async () => { if (contentFontSize.value < 32) contentFontSize.value += 2; await localforage.setItem('font-size', contentFontSize.value); };
const decreaseFontSize = async () => { if (contentFontSize.value > 12) contentFontSize.value -= 2; await localforage.setItem('font-size', contentFontSize.value); };

const selectedAlgo = ref(null);
const isEditing = ref(false);
const customCatOrder = ref([]); 
const customCatColors = ref({}); 
const editForm = ref({ id: '', title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {}, isPinned: false });

const showDeleteConfirm = ref(false);
const showTrashModal = ref(false);
const showUserCenter = ref(false); 
const showImportModal = ref(false);
const itemToDelete = ref(null);
const showActionMenu = ref(false);
const actionItem = ref(null);

const showBulkDeleteConfirm = ref(false);
const pendingBulkIds = ref([]);
const handleBulkDeleteRequest = (ids) => { pendingBulkIds.value = ids; showBulkDeleteConfirm.value = true; };
const confirmBulkDelete = async () => {
  const itemsToDelete = algorithms.value.filter(a => pendingBulkIds.value.includes(a.id));
  algorithms.value = algorithms.value.filter(a => !pendingBulkIds.value.includes(a.id));
  trashList.value.unshift(...itemsToDelete); extractAndSyncCategories(); await saveToDisk();
  showBulkDeleteConfirm.value = false; homeViewRef.value?.exitBulkMode();
};

const showEmptyTrashConfirm = ref(false);
const handleEmptyTrashRequest = () => { showEmptyTrashConfirm.value = true; };
const confirmEmptyTrash = async () => { trashList.value = []; await saveToDisk(); showEmptyTrashConfirm.value = false; };
const showPermDeleteConfirm = ref(false);
const pendingPermItem = ref(null);
const handlePermDeleteRequest = (item) => { pendingPermItem.value = item; showPermDeleteConfirm.value = true; };
const confirmPermDelete = async () => { trashList.value = trashList.value.filter(a => a.id !== pendingPermItem.value.id); await saveToDisk(); showPermDeleteConfirm.value = false; };

const getCategories = (catStr) => { if (!catStr) return ['未分类']; const cats = catStr.split(/[\s,，]+/).filter(Boolean); return cats.length > 0 ? cats : ['未分类']; };
const extractAndSyncCategories = () => { const allCats = new Set(algorithms.value.flatMap(a => getCategories(a.category))); const ordered = customCatOrder.value.filter(c => allCats.has(c)); const unordered = Array.from(allCats).filter(c => !ordered.includes(c)); customCatOrder.value = [...ordered, ...unordered]; };

const saveToDisk = async () => {
  try {
    const pureData = JSON.parse(JSON.stringify(algorithms.value));
    await localforage.setItem('algo-data', pureData); await localforage.setItem('algo-trash', JSON.parse(JSON.stringify(trashList.value))); await localforage.setItem('cat-order', JSON.parse(JSON.stringify(customCatOrder.value))); await localforage.setItem('cat-colors', JSON.parse(JSON.stringify(customCatColors.value)));
    if (!Capacitor.isNativePlatform()) { await fetch('/api/save', { method: 'POST', body: JSON.stringify(pureData) }).catch(() => {}); }
  } catch (e) { console.error(e); }
};

// 【挂载解耦逻辑】
const { isSyncing, savedGithubUrl, handleGithubSync, handleMarkdownImport, handleClipboardImport, handleExportData } = useSyncEngine({
  algorithms, trashList, extractAndSyncCategories, saveToDisk, appSpace, showImportModal
});

const loadData = async () => {
  try {
    const savedUrl = await localforage.getItem('github-sync-url'); if (savedUrl) savedGithubUrl.value = savedUrl;
    const savedOrder = await localforage.getItem('cat-order'); if (savedOrder) customCatOrder.value = savedOrder;
    const savedColors = await localforage.getItem('cat-colors'); if (savedColors) customCatColors.value = savedColors;
    const savedTrash = await localforage.getItem('algo-trash'); if (savedTrash) trashList.value = savedTrash;
    const savedSortMode = await localforage.getItem('sort-mode'); if (savedSortMode) sortMode.value = savedSortMode;
    const savedDefaultSpace = await localforage.getItem('default-app-space'); if (savedDefaultSpace) { defaultAppSpace.value = savedDefaultSpace; appSpace.value = savedDefaultSpace; }
    
    const savedDarkMode = await localforage.getItem('dark-mode'); 
    if (savedDarkMode) { isDarkMode.value = savedDarkMode; if(isDarkMode.value) document.documentElement.classList.add('dark'); }
    const savedTocOpen = await localforage.getItem('toc-open'); if (savedTocOpen !== null) isTocOpen.value = savedTocOpen;
    const savedFontSize = await localforage.getItem('font-size'); if (savedFontSize) contentFontSize.value = savedFontSize;

    let dataToUse = null; const isNative = Capacitor.isNativePlatform();
    if (isNative) { ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {}); const localData = await localforage.getItem('algo-data'); if (localData && localData.length > 0) dataToUse = localData; }
    if (!dataToUse || !isNative) { const res = await fetch('/data.json?t=' + Date.now()); if (res.ok) dataToUse = await res.json(); }
    if (dataToUse) { algorithms.value = dataToUse.map(item => ({ type: item.type || 'algorithm', isPinned: !!item.isPinned, ...item })); extractAndSyncCategories(); await localforage.setItem('algo-data', algorithms.value); }
  } catch (e) { console.error("数据加载失败", e); }
};

const updateCatColor = async (cat, color) => { customCatColors.value[cat] = color; await saveToDisk(); };

onMounted(() => {
  loadData();
  CapApp.addListener('backButton', () => {
    if (showImportModal.value) showImportModal.value = false;
    else if (showUserCenter.value) showUserCenter.value = false;
    else if (showActionMenu.value) showActionMenu.value = false;
    else if (showBulkDeleteConfirm.value) showBulkDeleteConfirm.value = false;
    else if (showEmptyTrashConfirm.value) showEmptyTrashConfirm.value = false;
    else if (showPermDeleteConfirm.value) showPermDeleteConfirm.value = false;
    else if (showDeleteConfirm.value) showDeleteConfirm.value = false;
    else if (showTrashModal.value) showTrashModal.value = false;
    else if (homeViewRef.value?.isBulkMode) homeViewRef.value?.exitBulkMode();
    else if (selectedAlgo.value || isEditing.value) goBack(); else CapApp.exitApp();
  });
});

const moveCategory = (index, direction) => { const targetIndex = index + direction; if (targetIndex < 0 || targetIndex >= customCatOrder.value.length) return; const temp = customCatOrder.value[index]; customCatOrder.value[index] = customCatOrder.value[targetIndex]; customCatOrder.value[targetIndex] = temp; };
const activeModeCategories = computed(() => { let listForCats = algorithms.value.filter(a => appSpace.value === 'tech' ? ['algorithm', 'interview'].includes(a.type) : ['diary', 'journal'].includes(a.type)); if (activeTypeMode.value !== 'all') listForCats = listForCats.filter(a => a.type === activeTypeMode.value); const currentModeCats = new Set(listForCats.flatMap(a => getCategories(a.category))); const displayCats = customCatOrder.value.filter(c => currentModeCats.has(c)); return ['全部', ...displayCats]; });
const sortedFilteredAlgorithms = computed(() => {
  let list = algorithms.value.filter(a => appSpace.value === 'tech' ? ['algorithm', 'interview'].includes(a.type) : ['diary', 'journal'].includes(a.type));
  if (activeTypeMode.value !== 'all') list = list.filter(a => a.type === activeTypeMode.value);
  if (activeCategory.value !== '全部') list = list.filter(a => getCategories(a.category).includes(activeCategory.value));
  return list.slice().sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1; if (!a.isPinned && b.isPinned) return 1;
    if (sortMode.value === 'time') return parseInt(b.id) - parseInt(a.id); 
    const numA = a.title.match(/^\d+/) ? parseInt(a.title.match(/^\d+/)[0], 10) : Number.MAX_SAFE_INTEGER;
    const numB = b.title.match(/^\d+/) ? parseInt(b.title.match(/^\d+/)[0], 10) : Number.MAX_SAFE_INTEGER;
    if (numA !== numB) return numA - numB; return a.title.localeCompare(b.title);
  });
});

const difficultyColor = (diff) => diff === '简单' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : diff === '中等' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
const currentIndex = computed(() => !selectedAlgo.value ? -1 : sortedFilteredAlgorithms.value.findIndex(a => a.id === selectedAlgo.value.id));
const hasPrev = computed(() => currentIndex.value > 0); const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < sortedFilteredAlgorithms.value.length - 1);
const goPrev = () => { if (hasPrev.value) selectedAlgo.value = sortedFilteredAlgorithms.value[currentIndex.value - 1]; }; const goNext = () => { if (hasNext.value) selectedAlgo.value = sortedFilteredAlgorithms.value[currentIndex.value + 1]; }; const goBack = () => { selectedAlgo.value = null; isEditing.value = false; }; const startView = (item) => { selectedAlgo.value = item; isEditing.value = false; };
const createNew = () => { editForm.value = { id: Date.now().toString(), title: '', category: '', type: appSpace.value === 'tech' ? 'algorithm' : 'diary', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {}, isPinned: false }; selectedAlgo.value = null; isEditing.value = true; };
const startEdit = () => { editForm.value = JSON.parse(JSON.stringify(selectedAlgo.value)); if (!editForm.value.images) editForm.value.images = {}; if (!editForm.value.type) editForm.value.type = appSpace.value === 'tech' ? 'algorithm' : 'diary'; isEditing.value = true; };

const saveAlgo = async () => {
  if (!editForm.value.title) return alert("标题不能为空！");
  const newItem = JSON.parse(JSON.stringify(editForm.value));
  const index = algorithms.value.findIndex(a => a.id === newItem.id);
  if (index >= 0) algorithms.value[index] = newItem; else algorithms.value.unshift(newItem);
  extractAndSyncCategories(); 
  selectedAlgo.value = algorithms.value.find(a => a.id === newItem.id);
  isEditing.value = false;
  await saveToDisk();
};

const openActionMenu = (item) => { actionItem.value = item; showActionMenu.value = true; };
const togglePin = async (item) => { const idx = algorithms.value.findIndex(a => a.id === item.id); if (idx !== -1) { algorithms.value[idx].isPinned = !algorithms.value[idx].isPinned; showActionMenu.value = false; await saveToDisk(); } };
const handleMenuEdit = (item) => { showActionMenu.value = false; selectedAlgo.value = item; startEdit(); };
const handleMenuDelete = (item) => { showActionMenu.value = false; triggerDelete(item); };
const toggleDarkMode = async () => { isDarkMode.value = !isDarkMode.value; if (isDarkMode.value) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); await localforage.setItem('dark-mode', isDarkMode.value); };
const toggleToc = async () => { isTocOpen.value = !isTocOpen.value; await localforage.setItem('toc-open', isTocOpen.value); };
const handleShareData = async (item) => { try { await Clipboard.write({ string: JSON.stringify({ lcp_version: "1.0", type: item.type || "algorithm", metadata: { id: item.id || Date.now().toString(), title: item.title, category: item.category, isPinned: !!item.isPinned }, payload: { difficulty: item.difficulty, language: item.language, problemText: item.problemText, solutionText: item.solutionText }, assets: item.images || {} }) }); showActionMenu.value = false; alert("📦 数据包已复制！可供其他设备一键导入。"); } catch (e) { console.error(e); } };
</script>