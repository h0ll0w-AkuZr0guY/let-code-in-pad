<template>
  <div v-if="show" class="absolute inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-[36rem] max-h-[90%] flex flex-col transform transition-transform">
      
      <div class="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">📥 同步与导入中心</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
      </div>

      <div class="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6 shadow-inner">
        <button @click="activeTab = 'github'" :class="activeTab === 'github' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'" class="flex-1 py-2 rounded-lg font-bold transition">🐙 GitHub 同步</button>
        <button @click="activeTab = 'markdown'" :class="activeTab === 'markdown' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'" class="flex-1 py-2 rounded-lg font-bold transition">📝 Markdown</button>
        <button @click="activeTab = 'clipboard'" :class="activeTab === 'clipboard' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'" class="flex-1 py-2 rounded-lg font-bold transition">📋 剪贴板</button>
      </div>

      <div class="flex-1 overflow-y-auto pr-2">
        
        <div v-if="activeTab === 'github'" class="space-y-5">
          
          <div class="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl shadow-lg">
            <div class="bg-white dark:bg-gray-800 rounded-[14px] p-5 flex flex-col items-center justify-center text-center space-y-3">
              <span class="text-3xl drop-shadow-md">🌟</span>
              <h4 class="font-black text-gray-800 dark:text-gray-100 text-lg">Let Code in Pad 官方题库</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                初次使用？一键拉取作者精心整理的算法题与面经数据，体验开箱即用的图文秒传快感！
              </p>
              <button @click="fillAuthorData" :disabled="isSyncing" class="px-8 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-bold rounded-full hover:scale-105 active:scale-95 transition-transform shadow-md disabled:opacity-50">
                {{ isSyncing ? '🔄 正在拉取...' : '一键获取初始资源' }}
              </button>
            </div>
          </div>

          <div class="relative flex items-center py-2">
            <div class="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span class="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">OR</span>
            <div class="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">输入自定义 GitHub Raw 目录地址：</label>
            <input v-model="githubUrl" placeholder="例如: https://raw.githubusercontent.com/user/repo/main/public" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition" />
            <p class="text-xs text-gray-400 mt-2">引擎会自动将远端图片下载并转换为本地离线数据，标题相同的记录会被自动更新覆盖。</p>
          </div>
          
          <button @click="$emit('syncGithub', githubUrl)" :disabled="isSyncing" class="w-full py-3 mt-2 rounded-xl font-bold text-white transition flex justify-center items-center" :class="isSyncing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'">
            {{ isSyncing ? '🔄 疯狂拉取图文数据中...' : '🚀 开始同步' }}
          </button>
        </div>

        <div v-if="activeTab === 'markdown'" class="space-y-4 flex flex-col items-center justify-center py-6">
          <div class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl text-sm text-purple-700 dark:text-purple-300 font-medium w-full mb-4">
            支持选择本应用导出的 <code>.md</code> 文件，自动切割多篇记录并还原。
          </div>
          <label class="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 bg-gray-50 dark:bg-gray-700 w-full h-32 rounded-2xl flex flex-col items-center justify-center transition">
            <span class="text-3xl mb-2">📄</span>
            <span class="font-bold text-gray-600 dark:text-gray-300">点击选择 Markdown 文件</span>
            <input type="file" accept=".md" class="hidden" @change="handleFileChange" />
          </label>
        </div>

        <div v-if="activeTab === 'clipboard'" class="space-y-4 flex flex-col items-center justify-center py-6">
          <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">📋</div>
          <p class="text-gray-500 dark:text-gray-400 text-center text-sm px-4">读取剪贴板中的 LCP 协议数据。<br>适用于从另一台设备复制单道题目并秒传过来。</p>
          <button @click="$emit('syncClipboard')" class="px-8 py-3 mt-6 bg-gray-800 dark:bg-gray-600 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-gray-500 transition shadow-md">
            立即读取并导入
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['show', 'isSyncing', 'savedGithubUrl']);
const emit = defineEmits(['close', 'syncGithub', 'syncMarkdown', 'syncClipboard']);

const activeTab = ref('github');
const githubUrl = ref('');

// 初始化时填入历史保存的 URL
watch(() => props.show, (newVal) => {
  if (newVal && props.savedGithubUrl) githubUrl.value = props.savedGithubUrl;
});

// 【核心引流】：一键填充你的 GitHub Raw 地址并触发下载
const fillAuthorData = () => {
  githubUrl.value = 'https://raw.githubusercontent.com/h0ll0w-AkuZr0guY/let-code-in-pad/main/public';
  emit('syncGithub', githubUrl.value);
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    emit('syncMarkdown', file);
    e.target.value = ''; 
  }
};
</script>