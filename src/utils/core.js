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

// 4. 智能粘贴核心逻辑 (支持图片 Base64 提取与富文本解析)
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

  // 优先处理图片
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

  // 处理富文本转 Markdown (仅当未复制纯代码时)
  const htmlData = clipboardData.getData('text/html');
  const plainText = clipboardData.getData('text/plain');
  if (htmlData && !plainText.match(/(```|##|\[.*\]\(.*\))/)) {
    event.preventDefault();
    let markdown = turndownService.turndown(htmlData).replace(/\n{3,}/g, '\n\n');
    insertTextAtCursor(event.target, markdown);
  }
};