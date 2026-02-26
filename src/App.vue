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
                    :class="appSpace === 'tech' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600' : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'">保存更改</button>
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
        <DiaryView v-if="['diary', 'journal'].includes(isEditing ? editForm.type : selectedAlgo?.type)" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
        <InterviewView v-else-if="(isEditing ? editForm.type : selectedAlgo?.type) === 'interview'" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
        <AlgoView v-else :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
      </div>

      <button v-if="selectedAlgo || isEditing" @click="toggleDarkMode" class="fixed bottom-8 right-8 w-14 h-14 bg-gray-800 dark:bg-gray-100 text-yellow-300 dark:text-gray-800 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-[100] group border dark:border-transparent border-gray-700">
        {{ isDarkMode ? '☀️' : '🌙' }}
        <span class="absolute right-16 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none shadow-md">
          {{ isDarkMode ? '切换浅色模式' : '切换深色模式' }}
        </span>
      </button>
    </div>

    <ActionMenuModal :show="showActionMenu" :item="actionItem" @close="showActionMenu = false" @pin="togglePin" @edit="handleMenuEdit" @delete="handleMenuDelete" @shareData="handleShareData" />
    <TrashModal :show="showTrashModal" :trashList="trashList" @close="showTrashModal = false" @restore="restoreItem" @requestPermDelete="handlePermDeleteRequest" @requestEmpty="handleEmptyTrashRequest" />
    <UserCenterModal :show="showUserCenter" :appSpace="appSpace" :defaultAppSpace="defaultAppSpace" :algoCount="algoCount" :interviewCount="interviewCount" :diaryCount="diaryCount" :journalCount="journalCount" @close="showUserCenter = false" @toggleAppSpace="toggleAppSpace" @toggleDefaultSpace="toggleDefaultSpace" @exportData="handleExportData" />
    <ImportSyncModal :show="showImportModal" :isSyncing="isSyncing" :savedGithubUrl="savedGithubUrl" @close="showImportModal = false" @syncGithub="handleGithubSync" @syncMarkdown="handleMarkdownImport" @syncClipboard="handleClipboardImport" />

    <div v-if="showDeleteConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[24rem] flex flex-col">
        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">移入回收站</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">确定将 <span class="font-bold text-gray-700 dark:text-gray-200">"{{ itemToDelete?.title }}"</span> 移入回收站？</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">取消</button>
          <button @click="confirmDelete" class="px-5 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md">确定移动</button>
        </div>
      </div>
    </div>

    <div v-if="showBulkDeleteConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[24rem] flex flex-col">
        <h3 class="text-xl font-bold dark:text-red-400 text-red-600 mb-2">批量移入回收站</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">确定要将选中的 <span class="font-bold text-red-500 text-lg mx-1">{{ pendingBulkIds.length }}</span> 项移入回收站吗？</p>
        <div class="flex justify-end space-x-3">
          <button @click="showBulkDeleteConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">取消操作</button>
          <button @click="confirmBulkDelete" class="px-5 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md">全部移动</button>
        </div>
      </div>
    </div>

    <div v-if="showEmptyTrashConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[26rem] flex flex-col border-t-8 border-red-500">
        <h3 class="text-xl font-bold text-red-600 dark:text-red-400 mb-2">⚠️ 危险操作：彻底清空</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">彻底清空回收站后，<span class="font-bold text-black dark:text-white">所有数据将永远无法找回</span>。确认清空吗？</p>
        <div class="flex justify-end space-x-3">
          <button @click="showEmptyTrashConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">保留数据</button>
          <button @click="confirmEmptyTrash" class="px-5 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-md">确认彻底清空</button>
        </div>
      </div>
    </div>

    <div v-if="showPermDeleteConfirm" class="absolute inset-0 z-max flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-[24rem] flex flex-col">
        <h3 class="text-xl font-bold text-red-600 dark:text-red-400 mb-2">彻底删除</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">彻底删除 <span class="font-bold text-gray-700 dark:text-gray-200">"{{ pendingPermItem?.title }}"</span> 将无法找回，确认？</p>
        <div class="flex justify-end space-x-3">
          <button @click="showPermDeleteConfirm = false" class="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">取消</button>
          <button @click="confirmPermDelete" class="px-5 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md">彻底删除</button>
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
import { Clipboard } from '@capacitor/clipboard';
import localforage from 'localforage';
import { renderMarkdown } from './utils/core';

import HomeView from './components/HomeView.vue';
import AlgoView from './components/AlgoView.vue';
import InterviewView from './components/InterviewView.vue';
import DiaryView from './components/DiaryView.vue'; 
import FloatingNav from './components/FloatingNav.vue'; 

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

const selectedAlgo = ref(null);
const isEditing = ref(false);
const customCatOrder = ref([]); 
const customCatColors = ref({}); 
const editForm = ref({ id: '', title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {}, isPinned: false });

const showDeleteConfirm = ref(false);
const showTrashModal = ref(false);
const showUserCenter = ref(false); 
const showImportModal = ref(false);
const isSyncing = ref(false);
const savedGithubUrl = ref('');

const itemToDelete = ref(null);
const showActionMenu = ref(false);
const actionItem = ref(null);

const showBulkDeleteConfirm = ref(false);
const pendingBulkIds = ref([]);
const handleBulkDeleteRequest = (ids) => { pendingBulkIds.value = ids; showBulkDeleteConfirm.value = true; };
const confirmBulkDelete = async () => {
  const itemsToDelete = algorithms.value.filter(a => pendingBulkIds.value.includes(a.id));
  algorithms.value = algorithms.value.filter(a => !pendingBulkIds.value.includes(a.id));
  trashList.value.unshift(...itemsToDelete);
  extractAndSyncCategories(); await saveToDisk();
  showBulkDeleteConfirm.value = false; homeViewRef.value?.exitBulkMode();
};

const showEmptyTrashConfirm = ref(false);
const handleEmptyTrashRequest = () => { showEmptyTrashConfirm.value = true; };
const confirmEmptyTrash = async () => { trashList.value = []; await saveToDisk(); showEmptyTrashConfirm.value = false; };

const showPermDeleteConfirm = ref(false);
const pendingPermItem = ref(null);
const handlePermDeleteRequest = (item) => { pendingPermItem.value = item; showPermDeleteConfirm.value = true; };
const confirmPermDelete = async () => { trashList.value = trashList.value.filter(a => a.id !== pendingPermItem.value.id); await saveToDisk(); showPermDeleteConfirm.value = false; };

const upsertItem = (newItem) => {
  const existingIdx = algorithms.value.findIndex(a => a.title === newItem.title);
  if (existingIdx >= 0) { algorithms.value[existingIdx] = { ...algorithms.value[existingIdx], ...newItem, id: algorithms.value[existingIdx].id }; return 'updated'; } 
  else { algorithms.value.unshift(newItem); return 'inserted'; }
};

const handleGithubSync = async (baseUrl) => {
  if (!baseUrl) return alert("请输入 GitHub 地址！");
  isSyncing.value = true; savedGithubUrl.value = baseUrl; await localforage.setItem('github-sync-url', baseUrl);
  try {
    let cleanBase = baseUrl.trim(); if (cleanBase.endsWith('/')) cleanBase = cleanBase.slice(0, -1);
    if (cleanBase.includes('github.com') && cleanBase.includes('/tree/')) cleanBase = cleanBase.replace('github.com', 'raw.githubusercontent.com').replace('/tree/', '/');
    const res = await fetch(`${cleanBase}/data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("无法读取 data.json");
    const remoteData = await res.json();
    let importedCount = 0; let updatedCount = 0;
    const localizeImages = async (text, imagesObj) => {
      if (!text) return text; let newText = text;
      const regex = /\/images\/(img_[A-Za-z0-9_.-]+)/g; const matches = [...newText.matchAll(regex)];
      for (const m of matches) {
        const fullPath = m[0]; const imgIdWithExt = m[1]; const imgId = imgIdWithExt.split('.')[0]; 
        if (!imagesObj[imgId]) {
          try {
            const imgRes = await fetch(`${cleanBase}${fullPath}`); const blob = await imgRes.blob();
            const base64 = await new Promise(resolve => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(blob); });
            imagesObj[imgId] = base64; 
          } catch(e) { console.error('图片下载失败', fullPath); }
        }
        newText = newText.replace(fullPath, `local:${imgId}`);
      } return newText;
    };
    for (const item of remoteData) {
      if (!item.images) item.images = {};
      item.problemText = await localizeImages(item.problemText, item.images);
      item.solutionText = await localizeImages(item.solutionText, item.images);
      const status = upsertItem(item);
      if (status === 'inserted') importedCount++; if (status === 'updated') updatedCount++;
    }
    extractAndSyncCategories(); await saveToDisk();
    alert(`🐙 GitHub 同步成功！\n新增: ${importedCount} 条\n更新: ${updatedCount} 条\n图文已转为离线缓存。`); showImportModal.value = false;
  } catch (e) { alert(`拉取失败！\n原因: ${e.message}`); } finally { isSyncing.value = false; }
};

const handleMarkdownImport = async (file) => {
  try {
    const text = await file.text(); const blocks = text.split('\n---').filter(i => i.trim().length > 0);
    let importedCount = 0; let updatedCount = 0;
    blocks.forEach(block => {
      const titleMatch = block.match(/##\s+(.*)/); if (!titleMatch) return;
      const title = titleMatch[1].trim(); const metaMatch = block.match(/>\s+标签:\s+(.*?)\s+\|\s+类型:\s+(.*)/);
      const category = metaMatch ? metaMatch[1].trim() : '未分类'; const type = metaMatch ? metaMatch[2].trim() : 'algorithm';
      let problemText = ''; let solutionText = ''; let language = 'python';
      const descMatch = block.match(/### 描述\/内容\n([\s\S]*?)(?=### 代码\/解析|$)/); if (descMatch) problemText = descMatch[1].trim();
      const codeBlockMatch = block.match(/### 代码\/解析\n```([\w]*)\n([\s\S]*?)```/);
      if (codeBlockMatch) { language = codeBlockMatch[1] || 'python'; solutionText = codeBlockMatch[2].trim(); }
      const newItem = { id: Date.now().toString() + Math.floor(Math.random()*100), type, title, category, difficulty: '中等', language, problemText, solutionText, images: {}, isPinned: false };
      const status = upsertItem(newItem); if (status === 'inserted') importedCount++; if (status === 'updated') updatedCount++;
    });
    extractAndSyncCategories(); await saveToDisk(); alert(`📝 解析完成！新增: ${importedCount} 篇，更新: ${updatedCount} 篇`); showImportModal.value = false;
  } catch (e) { alert("文件读取失败！"); }
};

const handleClipboardImport = async () => {
  try {
    const { value } = await Clipboard.read(); if (!value) return alert("剪贴板为空！");
    let lcpObj; try { lcpObj = JSON.parse(value); } catch (e) { return alert("剪贴板内容非有效 LCP 格式。"); }
    if (!lcpObj.lcp_version) return alert("无法识别的版本或数据损坏。");
    const newItem = {
      id: Date.now().toString(), type: lcpObj.type || 'algorithm', title: lcpObj.metadata?.title || '未命名导入', category: lcpObj.metadata?.category || '默认分类',
      isPinned: false, difficulty: lcpObj.payload?.difficulty || '中等', language: lcpObj.payload?.language || 'python',
      problemText: lcpObj.payload?.problemText || '', solutionText: lcpObj.payload?.solutionText || '', images: lcpObj.assets || {}
    };
    const status = upsertItem(newItem); extractAndSyncCategories(); await saveToDisk();
    alert(`🎉 成功导入: ${newItem.title}`); showImportModal.value = false;
  } catch (e) { alert("导入失败，请检查权限。"); }
};

const algoCount = computed(() => algorithms.value.filter(a => a.type === 'algorithm').length);
const interviewCount = computed(() => algorithms.value.filter(a => a.type === 'interview').length);
const diaryCount = computed(() => algorithms.value.filter(a => a.type === 'diary').length);
const journalCount = computed(() => algorithms.value.filter(a => a.type === 'journal').length);

const handleModeChange = (mode) => { activeTypeMode.value = mode; activeCategory.value = '全部'; };
const toggleAppSpace = () => { appSpace.value = appSpace.value === 'tech' ? 'life' : 'tech'; activeTypeMode.value = 'all'; activeCategory.value = '全部'; showUserCenter.value = false; };
const toggleDefaultSpace = async () => { defaultAppSpace.value = defaultAppSpace.value === 'tech' ? 'life' : 'tech'; await localforage.setItem('default-app-space', defaultAppSpace.value); };
const toggleSort = async () => { sortMode.value = sortMode.value === 'time' ? 'title' : 'time'; await localforage.setItem('sort-mode', sortMode.value); };

const toggleDarkMode = async () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  await localforage.setItem('dark-mode', isDarkMode.value);
};

const resolveImagesForExport = (text, images = {}) => { if (!text) return ''; return text.replace(/\]\(local:([^)]+)\)/g, (match, imgId) => `](${images[imgId] || ''})`); };
const inlineImagesForExport = async (text, images = {}) => {
  if (!text) return ''; let processedText = text; processedText = processedText.replace(/\]\(local:([^)]+)\)/g, (match, imgId) => `](${images[imgId] || ''})`);
  const regex = /\/images\/img_[A-Za-z0-9_.-]+/g; const matches = processedText.match(regex);
  if (matches) {
    const uniqueUrls = [...new Set(matches)];
    for (const url of uniqueUrls) {
      try { const response = await fetch(url); const blob = await response.blob(); const base64 = await new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(blob); }); processedText = processedText.split(url).join(base64); } catch (e) { processedText = processedText.split(url).join(window.location.origin + url); }
    }
  } return processedText;
};

const handleExportData = async (format, scope) => {
  let listToExport = algorithms.value.filter(a => appSpace.value === 'tech' ? ['algorithm', 'interview'].includes(a.type) : ['diary', 'journal'].includes(a.type));
  if (scope !== 'all') listToExport = listToExport.filter(a => a.type === scope);
  if (listToExport.length === 0) return alert("当前选择范围内没有可导出的数据！");
  const loadingToast = document.createElement('div');
  loadingToast.innerHTML = '<div style="position:fixed;top:40px;left:50%;transform:translateX(-50%);background:#3b82f6;color:white;padding:12px 24px;border-radius:30px;z-index:99999;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);font-weight:bold;animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">📦 正在打包图文资源...</div>';
  document.body.appendChild(loadingToast);
  try {
    if (format === 'md') {
      let mdContent = `# Let Code in Pad - 导出归档\n\n`;
      for (const item of listToExport) {
        mdContent += `## ${item.title}\n> 标签: ${item.category} | 类型: ${item.type}\n\n`;
        let pText = await inlineImagesForExport(item.problemText, item.images); let sText = await inlineImagesForExport(item.solutionText, item.images);
        if (pText) mdContent += `### 描述/内容\n${pText}\n\n`; if (sText) mdContent += `### 代码/解析\n\`\`\`${item.language || ''}\n${sText}\n\`\`\`\n\n`;
        mdContent += `---\n\n`;
      }
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `LCP_Export_${appSpace.value}_${Date.now()}.md`; a.click(); URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>导出 PDF - Let Code in Pad</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body { font-family: -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #333; max-width: 900px; margin: 0 auto;} 
          h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 50px; page-break-after: avoid; } 
          .meta { color: #888; font-size: 0.9em; margin-bottom: 20px; } 
          pre { background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-break: break-all; font-family: monospace; } 
          img { max-width: 100%; border-radius: 8px; margin: 15px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } 
          hr { border: none; border-top: 4px dashed #ddd; margin: 60px 0; } 
          @media print { hr { page-break-after: always; border: none; margin: 0; } }
          .katex-display { overflow-x: auto; overflow-y: hidden; padding-bottom: 0.5rem; }
        </style></head><body>`;
      for (const item of listToExport) {
        htmlContent += `<h1>${item.title}</h1><div class="meta">标签: ${item.category} | 类型: ${item.type}</div>`;
        let pText = await inlineImagesForExport(item.problemText, item.images); let sText = await inlineImagesForExport(item.solutionText, item.images);
        htmlContent += `<div>${renderMarkdown(pText)}</div>`;
        if (sText) { let formattedSolution = sText.includes('```') ? sText : `\`\`\`${item.language || ''}\n${sText}\n\`\`\``; htmlContent += `<div>${renderMarkdown(formattedSolution)}</div>`; }
        htmlContent += `<hr/>`;
      }
      htmlContent += "\x3Cscript\x3Ewindow.onload = () => { setTimeout(()=>window.print(), 800); }\x3C/script\x3E</body></html>";
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); window.open(url, '_blank');
    }
  } catch (err) { alert("导出时发生错误。"); } finally { if (document.body.contains(loadingToast)) document.body.removeChild(loadingToast); }
};

const packageToLCP = (item) => { return JSON.stringify({ lcp_version: "1.0", type: item.type || "algorithm", metadata: { id: item.id || Date.now().toString(), title: item.title, category: item.category, isPinned: !!item.isPinned }, payload: { difficulty: item.difficulty, language: item.language, problemText: item.problemText, solutionText: item.solutionText }, assets: item.images || {} }); };
const handleShareData = async (item) => { try { await Clipboard.write({ string: packageToLCP(item) }); showActionMenu.value = false; alert("📦 数据包已复制！可供其他设备一键导入。"); } catch (e) { console.error(e); } };

const openActionMenu = (item) => { actionItem.value = item; showActionMenu.value = true; };
const togglePin = async (item) => { const idx = algorithms.value.findIndex(a => a.id === item.id); if (idx !== -1) { algorithms.value[idx].isPinned = !algorithms.value[idx].isPinned; showActionMenu.value = false; await saveToDisk(); } };
const handleMenuEdit = (item) => { showActionMenu.value = false; selectedAlgo.value = item; startEdit(); };
const handleMenuDelete = (item) => { showActionMenu.value = false; triggerDelete(item); };
const triggerDelete = (item) => { itemToDelete.value = item; showDeleteConfirm.value = true; };
const confirmDelete = async () => { const item = itemToDelete.value; algorithms.value = algorithms.value.filter(a => a.id !== item.id); trashList.value.unshift(item); showDeleteConfirm.value = false; extractAndSyncCategories(); await saveToDisk(); if (selectedAlgo.value?.id === item.id) goBack(); };
const restoreItem = async (item) => { trashList.value = trashList.value.filter(a => a.id !== item.id); algorithms.value.unshift(item); extractAndSyncCategories(); await saveToDisk(); };

const getCategories = (catStr) => { if (!catStr) return ['未分类']; const cats = catStr.split(/[\s,，]+/).filter(Boolean); return cats.length > 0 ? cats : ['未分类']; };
const extractAndSyncCategories = () => { const allCats = new Set(algorithms.value.flatMap(a => getCategories(a.category))); const ordered = customCatOrder.value.filter(c => allCats.has(c)); const unordered = Array.from(allCats).filter(c => !ordered.includes(c)); customCatOrder.value = [...ordered, ...unordered]; };

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

    let dataToUse = null; const isNative = Capacitor.isNativePlatform();
    if (isNative) { ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {}); const localData = await localforage.getItem('algo-data'); if (localData && localData.length > 0) dataToUse = localData; }
    if (!dataToUse || !isNative) { const res = await fetch('/data.json?t=' + Date.now()); if (res.ok) dataToUse = await res.json(); }
    if (dataToUse) { algorithms.value = dataToUse.map(item => ({ type: item.type || 'algorithm', isPinned: !!item.isPinned, ...item })); extractAndSyncCategories(); await localforage.setItem('algo-data', algorithms.value); }
  } catch (e) { console.error("数据加载失败", e); }
};

const saveToDisk = async () => {
  try {
    const pureData = JSON.parse(JSON.stringify(algorithms.value));
    await localforage.setItem('algo-data', pureData); await localforage.setItem('algo-trash', JSON.parse(JSON.stringify(trashList.value))); await localforage.setItem('cat-order', JSON.parse(JSON.stringify(customCatOrder.value))); await localforage.setItem('cat-colors', JSON.parse(JSON.stringify(customCatColors.value)));
    if (!Capacitor.isNativePlatform()) { await fetch('/api/save', { method: 'POST', body: JSON.stringify(pureData) }).catch(() => {}); }
  } catch (e) { console.error(e); }
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
</script>