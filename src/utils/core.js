import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import TurndownService from 'turndown';

// 1. Markdown 配置
export const md = new MarkdownIt({
  html: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try { return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + '</code></pre>'; } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// 2. Turndown 配置 (富文本转 Markdown)
export const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});

// 【核心修复 1】：彻底禁用 Turndown 的自动转义机制
// 防止 > 和 [ ] 等符号前面被强行加上丑陋的反斜杠 \
turndownService.escape = function (string) {
  return string;
};

// 3. 渲染 Markdown (含本地图片解析)
export const renderMarkdown = (text, images = {}) => {
  if (!text) return '';
  let processText = text.replace(/\]\(local:([^)]+)\)/g, (match, imgId) => `](${images[imgId] || ''})`);
  return md.render(processText);
};

export const renderSolution = (text, lang, images) => {
  if (!text) return '';
  let processText = text;
  if (!processText.includes('```') && processText.trim().length > 0) {
    processText = `\`\`\`${lang || 'python'}\n${processText}\n\`\`\``;
  }
  return renderMarkdown(processText, images);
};

// 4. 智能粘贴核心逻辑
export const handleSmartPaste = (event, reactiveObj, targetField) => {
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  const insertTextAtCursor = (textarea, textToInsert) => {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = reactiveObj[targetField] || '';
    reactiveObj[targetField] = text.substring(0, startPos) + textToInsert + text.substring(endPos);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = startPos + textToInsert.length;
    }, 10);
  };

  // 优先处理图片提取
  const items = clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      event.preventDefault();
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Str = e.target.result;
        const imgId = 'img_' + Date.now() + Math.floor(Math.random() * 100);
        if (!reactiveObj.images) reactiveObj.images = {};
        reactiveObj.images[imgId] = base64Str;
        insertTextAtCursor(event.target, `\n![图片](local:${imgId})\n`);
      };
      reader.readAsDataURL(blob);
      return;
    }
  }

  // 获取剪贴板中的 HTML 和纯文本
  const htmlData = clipboardData.getData('text/html');
  const plainText = clipboardData.getData('text/plain');
  
  if (htmlData) {
    // 【核心修复 2】：更聪明的代码环境侦测
    // 判断是否是从 VS Code、LeetCode IDE 等代码编辑器复制的代码
    const isFromIDE = htmlData.includes('vscode') || 
                      htmlData.includes('monaco') || 
                      htmlData.includes('CodeMirror') || 
                      htmlData.includes('font-family: Consolas');
    
    // 判断是否真正包含具有排版意义的富文本标签
    const isRichText = /<(h[1-6]|b|strong|em|i|a|p|ul|li|table|blockquote)[^>]*>/i.test(htmlData);

    // 【判断逻辑】：只有在确认为“富文本”且“非代码片段”时，才进行 Markdown 转换。
    // 如果是纯代码，直接 let it go，让浏览器原封不动地粘贴纯文本（完美保留你的缩进和单行换行）
    if (isRichText && !isFromIDE && !plainText.match(/^```/)) {
      event.preventDefault();
      let markdown = turndownService.turndown(htmlData);
      
      // 【核心修复 3】：去除加粗标记内部的多余空格（修复冒号共存时的解析失败）
      // 将 "**输入: **" 自动修正为 "**输入:**"
      markdown = markdown.replace(/\*\*([\s\S]*?)\*\*/g, (match, p1) => `**${p1.trim()}**`);
      
      // 剔除过多连续的冗余换行符
      markdown = markdown.replace(/\n{3,}/g, '\n\n');
      
      insertTextAtCursor(event.target, markdown);
    }
  }
};