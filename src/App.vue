<template>
  <div class="h-screen w-screen bg-gray-100 font-sans flex flex-col overflow-hidden relative">
    
    <HomeView 
      v-if="!selectedAlgo && !isEditing"
      :appSpace="appSpace"
      :activeTypeMode="activeTypeMode" @update:activeTypeMode="handleModeChange"
      :categories="activeModeCategories" :globalCategories="customCatOrder" 
      :activeCategory="activeCategory" :sortedList="sortedFilteredAlgorithms"
      :getCategories="getCategories" :difficultyColor="difficultyColor" :customCatColors="customCatColors"
      @update:activeCategory="activeCategory = $event"
      @select="startView" @create="createNew" @openMenu="openActionMenu"
      @moveCat="moveCategory" @saveOrder="saveToDisk" @updateCatColor="updateCatColor"
      @openTrash="showTrashModal = true" @openUserCenter="showUserCenter = true"
      @importData="handleImportData"
    />

    <div v-else class="h-full flex flex-col bg-white">
      <div class="pt-safe pb-4 border-b border-gray-200 shadow-sm flex justify-between items-center px-8 bg-gray-50 shrink-0 z-20">
        <div class="flex items-center space-x-4 w-full mt-2">
          <button @click="goBack" class="text-gray-600 font-bold hover:text-blue-600 text-lg shrink-0">← 返回列表</button>
          
          <template v-if="isEditing">
            <div class="flex-1 flex space-x-3 border-l-2 border-gray-300 pl-4 items-center">
              <select v-model="editForm.type" class="bg-white border px-3 py-1 rounded outline-none font-bold"
                      :class="appSpace === 'tech' ? 'text-blue-700 focus:border-blue-500' : 'text-green-700 focus:border-green-500'">
                <template v-if="appSpace === 'tech'">
                  <option value="algorithm">算法题</option><option value="interview">面经/笔记</option>
                </template>
                <template v-else>
                  <option value="diary">我的日记</option><option value="journal">个人手账</option>
                </template>
              </select>
              <input v-model="editForm.title" placeholder="标题(支持数字前缀排序)" class="font-bold text-lg bg-white border px-3 py-1 rounded w-1/4 outline-none focus:border-blue-500" />
              <input v-model="editForm.category" placeholder="分类(空格或逗号分隔)" class="bg-white border px-3 py-1 rounded w-40 outline-none focus:border-blue-500" />
              <template v-if="editForm.type === 'algorithm'">
                <select v-model="editForm.difficulty" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500">
                  <option value="简单">简单</option><option value="中等">中等</option><option value="困难">困难</option>
                </select>
                <select v-model="editForm.language" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500">
                  <option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option>
                  <option value="javascript">JS</option><option value="go">Go</option>
                </select>
              </template>
            </div>
            <button @click="saveAlgo" class="text-white px-6 py-2 rounded-lg font-bold ml-4 shrink-0"
                    :class="appSpace === 'tech' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'">保存</button>
          </template>

          <template v-else>
            <div class="flex-1 flex items-center px-4 space-x-6 border-l-2 border-gray-300 ml-4 overflow-hidden">
              <h1 class="text-2xl font-bold truncate">{{ selectedAlgo.title }}</h1>
            </div>
            <div class="flex space-x-4 shrink-0 z-50">
              <button @click="startEdit" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300">编辑</button>
              <button @click="triggerDelete(selectedAlgo)" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200">删除</button>
            </div>
          </template>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden relative">
        <FloatingNav v-if="!isEditing" :hasPrev="hasPrev" :hasNext="hasNext" @prev="goPrev" @next="goNext" />

        <DiaryView v-if="['diary', 'journal'].includes(isEditing ? editForm.type : selectedAlgo.type)" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
        <InterviewView v-else-if="(isEditing ? editForm.type : selectedAlgo.type) === 'interview'" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
        <AlgoView v-else :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
      </div>
    </div>

    <ActionMenuModal :show="showActionMenu" :item="actionItem" @close="showActionMenu = false" @pin="togglePin" @edit="handleMenuEdit" @delete="handleMenuDelete" @shareData="handleShareData" />
    <TrashModal :show="showTrashModal" :trashList="trashList" @close="showTrashModal = false" @restore="restoreItem" @delete="permanentlyDelete" />
    
    <UserCenterModal 
      :show="showUserCenter" 
      :appSpace="appSpace"
      :defaultAppSpace="defaultAppSpace"
      :algoCount="algoCount" :interviewCount="interviewCount" 
      :diaryCount="diaryCount" :journalCount="journalCount" 
      @close="showUserCenter = false" 
      @toggleAppSpace="toggleAppSpace"
      @toggleDefaultSpace="toggleDefaultSpace"
      @exportData="handleExportData"
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
import { Clipboard } from '@capacitor/clipboard';
import localforage from 'localforage';
import { renderMarkdown } from './utils/core'; // 用于解析PDF导出时的内容

import HomeView from './components/HomeView.vue';
import AlgoView from './components/AlgoView.vue';
import InterviewView from './components/InterviewView.vue';
import DiaryView from './components/DiaryView.vue'; 
import FloatingNav from './components/FloatingNav.vue'; 

import ActionMenuModal from './components/ActionMenuModal.vue';
import TrashModal from './components/TrashModal.vue';
import UserCenterModal from './components/UserCenterModal.vue';

const algorithms = ref([]);
const trashList = ref([]); 
const activeCategory = ref('全部');

const appSpace = ref('tech'); 
const defaultAppSpace = ref('tech'); // 【新增】默认启动空间
const activeTypeMode = ref('all'); 

const selectedAlgo = ref(null);
const isEditing = ref(false);
const customCatOrder = ref([]); 
const customCatColors = ref({}); 
const editForm = ref({ id: '', title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {}, isPinned: false });

const showDeleteConfirm = ref(false);
const showTrashModal = ref(false);
const showUserCenter = ref(false); 
const itemToDelete = ref(null);
const showActionMenu = ref(false);
const actionItem = ref(null);

// ================== 数据统计与空间切换 ==================
const algoCount = computed(() => algorithms.value.filter(a => a.type === 'algorithm').length);
const interviewCount = computed(() => algorithms.value.filter(a => a.type === 'interview').length);
const diaryCount = computed(() => algorithms.value.filter(a => a.type === 'diary').length);
const journalCount = computed(() => algorithms.value.filter(a => a.type === 'journal').length);

const handleModeChange = (mode) => {
  activeTypeMode.value = mode; activeCategory.value = '全部'; 
};

const toggleAppSpace = () => {
  appSpace.value = appSpace.value === 'tech' ? 'life' : 'tech';
  activeTypeMode.value = 'all'; activeCategory.value = '全部';
  showUserCenter.value = false;
};

// 【新增】切换默认启动空间
const toggleDefaultSpace = async () => {
  defaultAppSpace.value = defaultAppSpace.value === 'tech' ? 'life' : 'tech';
  await localforage.setItem('default-app-space', defaultAppSpace.value);
};

// ================== 一键导出归档逻辑 (PDF / MD) ==================
const resolveImagesForExport = (text, images = {}) => {
  if (!text) return '';
  return text.replace(/\]\(local:([^)]+)\)/g, (match, imgId) => `](${images[imgId] || ''})`);
};

// ================== 一键导出归档逻辑 (PDF / MD) 完美图片修复版 ==================

// 【核心新增】异步图片内联器：自动扫描路径，把物理图片重新转为 Base64 焊死在文件里
const inlineImagesForExport = async (text, images = {}) => {
  if (!text) return '';
  let processedText = text;

  // 1. 先兼容那些刚刚粘贴、还在内存里没保存落盘的图片
  processedText = processedText.replace(/\]\(local:([^)]+)\)/g, (match, imgId) => `](${images[imgId] || ''})`);
  
  // 2. 匹配已经物理落盘的相对路径图片
  const regex = /\/images\/img_[A-Za-z0-9_.-]+/g;
  const matches = processedText.match(regex);
  
  if (matches) {
    const uniqueUrls = [...new Set(matches)];
    for (const url of uniqueUrls) {
      try {
        // 请求本地图片资源并转码
        const response = await fetch(url);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        // 将相对路径全局替换为超级长的 Base64 数据
        processedText = processedText.split(url).join(base64);
      } catch (e) {
        console.error("图片打包失败:", url, e);
        // 如果转码失败，至少给它补全绝对路径，让 PDF 有几率能读到
        processedText = processedText.split(url).join(window.location.origin + url);
      }
    }
  }
  return processedText;
};

// 【修改】将函数改为 async 异步执行
const handleExportData = async (format, scope) => {
  let listToExport = algorithms.value.filter(a => appSpace.value === 'tech' ? ['algorithm', 'interview'].includes(a.type) : ['diary', 'journal'].includes(a.type));
  if (scope !== 'all') listToExport = listToExport.filter(a => a.type === scope);

  if (listToExport.length === 0) return alert("当前选择范围内没有可导出的数据！");

  // 【新增】因为转码图片需要一丢丢时间，增加一个友好的全局提示
  const loadingToast = document.createElement('div');
  loadingToast.innerHTML = '<div style="position:fixed;top:40px;left:50%;transform:translateX(-50%);background:#3b82f6;color:white;padding:12px 24px;border-radius:30px;z-index:99999;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);font-weight:bold;animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">📦 正在打包图文资源，请稍候...</div>';
  document.body.appendChild(loadingToast);

  try {
    if (format === 'md') {
      let mdContent = `# Let Code in Pad - 导出归档\n\n`;
      for (const item of listToExport) { // 必须使用 for...of 来阻塞等待 async
        mdContent += `## ${item.title}\n> 标签: ${item.category} | 类型: ${item.type}\n\n`;
        let pText = await inlineImagesForExport(item.problemText, item.images);
        let sText = await inlineImagesForExport(item.solutionText, item.images);
        if (pText) mdContent += `### 描述/内容\n${pText}\n\n`;
        if (sText) mdContent += `### 代码/解析\n\`\`\`${item.language || ''}\n${sText}\n\`\`\`\n\n`;
        mdContent += `---\n\n`;
      }
      
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `LCP_Export_${appSpace.value}_${Date.now()}.md`;
      a.click(); URL.revokeObjectURL(url);

    } else if (format === 'pdf') {
      let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>导出 PDF - Let Code in Pad</title>
        <style>
          body { font-family: -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #333; max-width: 900px; margin: 0 auto;}
          h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 50px; page-break-after: avoid; }
          .meta { color: #888; font-size: 0.9em; margin-bottom: 20px; }
          pre { background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-break: break-all; font-family: monospace; }
          img { max-width: 100%; border-radius: 8px; margin: 15px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          hr { border: none; border-top: 4px dashed #ddd; margin: 60px 0; }
          @media print { hr { page-break-after: always; border: none; margin: 0; } }
        </style></head><body>`;
      
      for (const item of listToExport) {
        htmlContent += `<h1>${item.title}</h1><div class="meta">标签: ${item.category} | 类型: ${item.type}</div>`;
        let pText = await inlineImagesForExport(item.problemText, item.images);
        let sText = await inlineImagesForExport(item.solutionText, item.images);
        
        htmlContent += `<div>${renderMarkdown(pText)}</div>`;
        if (sText) {
          let formattedSolution = sText.includes('```') ? sText : `\`\`\`${item.language || ''}\n${sText}\n\`\`\``;
          htmlContent += `<div>${renderMarkdown(formattedSolution)}</div>`;
        }
        htmlContent += `<hr/>`;
      }
      
      // 防止 Vue 编译器崩溃的极客写法
      htmlContent += "\x3Cscript\x3Ewindow.onload = () => { setTimeout(()=>window.print(), 800); }\x3C/script\x3E</body></html>";
      
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  } catch (err) {
    console.error("导出出错:", err);
    alert("导出时发生错误，请检查控制台。");
  } finally {
    // 成功或失败都会移除加载提示
    if (document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast);
    }
  }
};

// ================== 长按与分享逻辑 ==================
const packageToLCP = (item) => {
  return JSON.stringify({
    lcp_version: "1.0", type: item.type || "algorithm",
    metadata: { id: item.id || Date.now().toString(), title: item.title, category: item.category, isPinned: !!item.isPinned },
    payload: { difficulty: item.difficulty, language: item.language, problemText: item.problemText, solutionText: item.solutionText },
    assets: item.images || {}
  });
};

const parseLCPToItem = (lcpObj) => {
  return {
    id: Date.now().toString(), type: lcpObj.type || 'algorithm',
    title: lcpObj.metadata?.title || '未命名导入', category: lcpObj.metadata?.category || '默认分类',
    isPinned: false, difficulty: lcpObj.payload?.difficulty || '中等', language: lcpObj.payload?.language || 'python',
    problemText: lcpObj.payload?.problemText || '', solutionText: lcpObj.payload?.solutionText || '', images: lcpObj.assets || {}
  };
};

const handleShareData = async (item) => {
  try {
    await Clipboard.write({ string: packageToLCP(item) }); showActionMenu.value = false;
    alert("📦 数据包已复制！可供其他设备一键导入。");
  } catch (e) { console.error("复制失败", e); }
};

const handleImportData = async () => {
  try {
    const { value } = await Clipboard.read();
    if (!value) return alert("剪贴板为空！");
    let lcpObj; try { lcpObj = JSON.parse(value); } catch (e) { return alert("剪贴板内容非有效 LCP 格式。"); }
    if (!lcpObj.lcp_version) return alert("无法识别的版本或数据损坏。");
    const newItem = parseLCPToItem(lcpObj);
    algorithms.value.unshift(newItem); extractAndSyncCategories(); await saveToDisk();
    alert(`🎉 成功导入: ${newItem.title}`);
  } catch (e) { alert("导入失败，请检查剪贴板权限。"); }
};

const openActionMenu = (item) => { actionItem.value = item; showActionMenu.value = true; };
const togglePin = async (item) => {
  const idx = algorithms.value.findIndex(a => a.id === item.id);
  if (idx !== -1) { algorithms.value[idx].isPinned = !algorithms.value[idx].isPinned; showActionMenu.value = false; await saveToDisk(); }
};
const handleMenuEdit = (item) => { showActionMenu.value = false; selectedAlgo.value = item; startEdit(); };
const handleMenuDelete = (item) => { showActionMenu.value = false; triggerDelete(item); };

const triggerDelete = (item) => { itemToDelete.value = item; showDeleteConfirm.value = true; };
const confirmDelete = async () => {
  const item = itemToDelete.value; algorithms.value = algorithms.value.filter(a => a.id !== item.id);
  trashList.value.unshift(item); showDeleteConfirm.value = false; extractAndSyncCategories(); await saveToDisk();
  if (selectedAlgo.value?.id === item.id) goBack();
};
const restoreItem = async (item) => {
  trashList.value = trashList.value.filter(a => a.id !== item.id); algorithms.value.unshift(item); extractAndSyncCategories(); await saveToDisk();
};
const permanentlyDelete = async (item) => {
  if (confirm(`彻底删除 "${item.title}" 将无法找回，确认删除？`)) { trashList.value = trashList.value.filter(a => a.id !== item.id); await saveToDisk(); }
};

const getCategories = (catStr) => {
  if (!catStr) return ['未分类'];
  const cats = catStr.split(/[\s,，]+/).filter(Boolean);
  return cats.length > 0 ? cats : ['未分类'];
};
const extractAndSyncCategories = () => {
  const allCats = new Set(algorithms.value.flatMap(a => getCategories(a.category)));
  const ordered = customCatOrder.value.filter(c => allCats.has(c));
  const unordered = Array.from(allCats).filter(c => !ordered.includes(c));
  customCatOrder.value = [...ordered, ...unordered];
};

const loadData = async () => {
  try {
    const savedOrder = await localforage.getItem('cat-order'); if (savedOrder) customCatOrder.value = savedOrder;
    const savedColors = await localforage.getItem('cat-colors'); if (savedColors) customCatColors.value = savedColors;
    const savedTrash = await localforage.getItem('algo-trash'); if (savedTrash) trashList.value = savedTrash;
    
    // 【核心】加载默认空间配置
    const savedDefaultSpace = await localforage.getItem('default-app-space'); 
    if (savedDefaultSpace) {
      defaultAppSpace.value = savedDefaultSpace;
      appSpace.value = savedDefaultSpace; // 启动时直接进入设定的空间
    }

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
      extractAndSyncCategories(); await localforage.setItem('algo-data', algorithms.value); 
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

    if (!Capacitor.isNativePlatform()) { await fetch('/api/save', { method: 'POST', body: JSON.stringify(pureData) }).catch(() => {}); }
    if (isEditing.value) { selectedAlgo.value = algorithms.value.find(a => a.id === editForm.value.id); isEditing.value = false; }
  } catch (e) { console.error(e); }
};

const updateCatColor = async (cat, color) => { customCatColors.value[cat] = color; await saveToDisk(); };

onMounted(() => {
  loadData();
  CapApp.addListener('backButton', () => {
    if (showUserCenter.value) showUserCenter.value = false;
    else if (showActionMenu.value) showActionMenu.value = false;
    else if (showDeleteConfirm.value) showDeleteConfirm.value = false;
    else if (showTrashModal.value) showTrashModal.value = false;
    else if (selectedAlgo.value || isEditing.value) goBack(); 
    else CapApp.exitApp();
  });
});

const moveCategory = (index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= customCatOrder.value.length) return;
  const temp = customCatOrder.value[index]; customCatOrder.value[index] = customCatOrder.value[targetIndex]; customCatOrder.value[targetIndex] = temp;
};

const activeModeCategories = computed(() => {
  let listForCats = algorithms.value.filter(a => appSpace.value === 'tech' ? ['algorithm', 'interview'].includes(a.type) : ['diary', 'journal'].includes(a.type));
  if (activeTypeMode.value !== 'all') listForCats = listForCats.filter(a => a.type === activeTypeMode.value);
  const currentModeCats = new Set(listForCats.flatMap(a => getCategories(a.category)));
  const displayCats = customCatOrder.value.filter(c => currentModeCats.has(c));
  return ['全部', ...displayCats];
});

const sortedFilteredAlgorithms = computed(() => {
  let list = algorithms.value.filter(a => appSpace.value === 'tech' ? ['algorithm', 'interview'].includes(a.type) : ['diary', 'journal'].includes(a.type));
  if (activeTypeMode.value !== 'all') list = list.filter(a => a.type === activeTypeMode.value);
  if (activeCategory.value !== '全部') list = list.filter(a => getCategories(a.category).includes(activeCategory.value));
  
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
  editForm.value = { id: Date.now().toString(), title: '', category: '', type: appSpace.value === 'tech' ? 'algorithm' : 'diary', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {}, isPinned: false };
  selectedAlgo.value = null; isEditing.value = true;
};
const startEdit = () => {
  editForm.value = JSON.parse(JSON.stringify(selectedAlgo.value));
  if (!editForm.value.images) editForm.value.images = {};
  if (!editForm.value.type) editForm.value.type = appSpace.value === 'tech' ? 'algorithm' : 'diary';
  isEditing.value = true;
};
const saveAlgo = async () => {
  if (!editForm.value.title) return alert("标题不能为空！");
  const index = algorithms.value.findIndex(a => a.id === editForm.value.id);
  if (index >= 0) algorithms.value[index] = editForm.value; else algorithms.value.unshift(editForm.value);
  extractAndSyncCategories(); await saveToDisk();
};
</script>