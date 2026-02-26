import { ref } from 'vue';
import { Clipboard } from '@capacitor/clipboard';
import localforage from 'localforage';
import { renderMarkdown } from '../utils/core';

export function useSyncEngine({ algorithms, trashList, extractAndSyncCategories, saveToDisk, appSpace, showImportModal }) {
  const isSyncing = ref(false);
  const savedGithubUrl = ref('');

  const upsertItem = (newItem) => {
    const existingIdx = algorithms.value.findIndex(a => a.title === newItem.title);
    if (existingIdx >= 0) {
      algorithms.value[existingIdx] = { ...algorithms.value[existingIdx], ...newItem, id: algorithms.value[existingIdx].id }; 
      return 'updated';
    } else {
      algorithms.value.unshift(newItem); return 'inserted';
    }
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
    if (listToExport.length === 0) return alert("没有可导出的数据！");
    const loadingToast = document.createElement('div');
    loadingToast.innerHTML = '<div style="position:fixed;top:40px;left:50%;transform:translateX(-50%);background:#3b82f6;color:white;padding:12px 24px;border-radius:30px;z-index:99999;font-weight:bold;animation:pulse 2s infinite;">📦 正在打包图文资源...</div>';
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
        let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>导出 PDF - Let Code in Pad</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"><style>body { font-family: -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #333; max-width: 900px; margin: 0 auto;} h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 50px; page-break-after: avoid; } .meta { color: #888; font-size: 0.9em; margin-bottom: 20px; } pre { background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-break: break-all; font-family: monospace; } img { max-width: 100%; border-radius: 8px; margin: 15px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } hr { border: none; border-top: 4px dashed #ddd; margin: 60px 0; } @media print { hr { page-break-after: always; border: none; margin: 0; } } .katex-display { overflow-x: auto; overflow-y: hidden; padding-bottom: 0.5rem; }</style></head><body>`;
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

  return { isSyncing, savedGithubUrl, handleGithubSync, handleMarkdownImport, handleClipboardImport, handleExportData };
}