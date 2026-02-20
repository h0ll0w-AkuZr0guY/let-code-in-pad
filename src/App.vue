<template>
  <div class="h-screen w-screen bg-gray-100 font-sans flex flex-col overflow-hidden">
    
    <HomeView 
      v-if="!selectedAlgo && !isEditing"
      :categories="categories"
      :activeCategory="activeCategory"
      :sortedList="sortedFilteredAlgorithms"
      :getCategories="getCategories"
      :difficultyColor="difficultyColor"
      @update:activeCategory="activeCategory = $event"
      @select="startView"
      @create="createNew"
      @delete="deleteAlgo"
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
                  <option value="简单">简单</option>
                  <option value="中等">中等</option>
                  <option value="困难">困难</option>
                </select>
                <select v-model="editForm.language" class="bg-white border px-3 py-1 rounded outline-none focus:border-blue-500">
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JS</option>
                  <option value="go">Go</option>
                </select>
              </template>
            </div>
            <button @click="saveAlgo" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 ml-4 shrink-0">保存至本地</button>
          </template>

          <template v-else>
            <div class="flex-1 flex items-center px-4 space-x-6 border-l-2 border-gray-300 ml-4 overflow-hidden">
              <span :class="selectedAlgo.type === 'interview' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="text-xs px-2 py-1 rounded shrink-0">
                {{ selectedAlgo.type === 'interview' ? '面经' : '算法' }}
              </span>
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

      <InterviewView v-if="(isEditing ? editForm.type : selectedAlgo.type) === 'interview'" :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
      <AlgoView v-else :form="isEditing ? editForm : selectedAlgo" :isEditing="isEditing" />
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { App as CapApp } from '@capacitor/app';
import HomeView from './components/HomeView.vue';
import AlgoView from './components/AlgoView.vue';
import InterviewView from './components/InterviewView.vue';

// 状态
const algorithms = ref([]);
const activeCategory = ref('全部');
const selectedAlgo = ref(null);
const isEditing = ref(false);
const editForm = ref({ id: '', title: '', category: '', type: 'algorithm', difficulty: '中等', language: 'python', problemText: '', solutionText: '', images: {} });

// 数据持久化
const loadData = async () => {
  try {
    const res = await fetch('/data.json?t=' + Date.now());
    if (res.ok) {
      let data = await res.json();
      // 兼容老数据：如果没有 type 属性，默认为 'algorithm'
      algorithms.value = data.map(item => ({ type: 'algorithm', ...item }));
    }
  } catch (e) { console.log("等待创建初始数据..."); }
};

onMounted(() => {
  loadData();
  CapApp.addListener('backButton', () => {
    if (selectedAlgo.value || isEditing.value) goBack();
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

// 业务逻辑提取
const getCategories = (catStr) => {
  if (!catStr) return ['未分类'];
  const cats = catStr.split(/[\s,，]+/).filter(Boolean);
  return cats.length > 0 ? cats : ['未分类'];
};

const categories = computed(() => ['全部', ...new Set(algorithms.value.flatMap(a => getCategories(a.category)))]);
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
  await saveToDisk();
};
const deleteAlgo = async (id) => {
  if (!confirm("确定删除？")) return;
  algorithms.value = algorithms.value.filter(a => a.id !== id);
  await saveToDisk();
  if (selectedAlgo.value?.id === id) goBack();
};
</script>

<style>
/* CSS 现已极其精简，特定样式只保留基础安全区和行内代码黑科技 */
.pt-safe { padding-top: calc(env(safe-area-inset-top, 0px) + 2rem); }
img { max-width: 100%; border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem; }
.hljs { border-radius: 8px; padding: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; font-size: 1.1rem;}

.prose code::before, .prose code::after { content: none !important; }
.prose code:not(pre code) {
  background-color: #f1f5f9 !important; color: #ef4444 !important;
  padding: 0.15rem 0.4rem !important; border-radius: 0.3rem !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-weight: 600 !important; font-size: 0.85em !important; word-break: break-word !important;
}
.prose-invert code:not(pre code) { background-color: #3f3f46 !important; color: #fca5a5 !important; }
</style>