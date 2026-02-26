import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import TurndownService from 'turndown';
import markdownItKatex from '@iktakahiro/markdown-it-katex';
import 'katex/dist/katex.min.css';

// ================== 全局独立代码块操控引擎 ==================
window.copyCodeBlock = function(btn) {
  const pre = btn.closest('.code-wrapper').querySelector('pre');
  navigator.clipboard.writeText(pre.textContent).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ 成功';
    setTimeout(() => btn.innerHTML = orig, 2000);
  });
};

window.zoomCodeBlock = function(btn, dir) {
  const pre = btn.closest('.code-wrapper').querySelector('pre');
  let size = parseInt(pre.style.fontSize) || 15;
  size += dir * 2;
  // 独立界限：最小10px，最大32px
  if (size >= 10 && size <= 32) pre.style.fontSize = size + 'px';
};

// ================== Markdown 引擎配置 ==================
export const md = new MarkdownIt({ html: true, breaks: true });

// 【核心魔改】：接管代码块渲染，注入 MacOS 风格顶栏和独立缩放按钮
md.renderer.rules.fence = function (tokens, idx) {
  const token = tokens[idx];
  const code = token.content;
  const lang = token.info.trim();
  
  let highlighted = '';
  if (lang && hljs.getLanguage(lang)) {
    try { highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value; } catch (__) {}
  } else {
    highlighted = md.utils.escapeHtml(code);
  }
  
  return `
    <div class="code-wrapper relative group my-6 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-lg border border-gray-700/50">
      <div class="code-header flex justify-between items-center px-4 py-2.5 bg-[#2d2d2d] border-b border-gray-700/50 select-none">
        <div class="flex space-x-2">
          <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <div class="flex space-x-4 text-gray-400 text-xs font-bold items-center">
          <span class="text-gray-500 uppercase tracking-wider">${lang || 'TEXT'}</span>
          <button class="hover:text-blue-400 transition-colors cursor-pointer" onclick="zoomCodeBlock(this, 1)" title="放大代码">A+</button>
          <button class="hover:text-blue-400 transition-colors cursor-pointer" onclick="zoomCodeBlock(this, -1)" title="缩小代码">A-</button>
          <button class="hover:text-white transition-colors flex items-center cursor-pointer" onclick="copyCodeBlock(this)">📋 复制</button>
        </div>
      </div>
      <pre class="hljs !m-0 !p-5 !bg-transparent text-[15px] transition-all overflow-x-auto" style="font-size: 15px;"><code>${highlighted}</code></pre>
    </div>
  `;
};

md.renderer.rules.heading_open = function(tokens, idx) {
  const token = tokens[idx]; let title = '';
  if (tokens[idx + 1] && tokens[idx + 1].type === 'inline') title = tokens[idx + 1].content;
  const slug = 'toc-' + encodeURIComponent(title.replace(/[*`_]/g, '').trim().toLowerCase().replace(/\s+/g, '-').substring(0, 30)).replace(/%/g, '');
  return `<${token.tag} id="${slug}">`;
};

md.use(markdownItKatex, { throwOnError: false, errorColor: '#cc0000' });

export const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', emDelimiter: '*' });
turndownService.escape = (string) => string;

export const renderMarkdown = (text, images = {}) => {
  if (!text) return '';
  return md.render(text.replace(/\]\(local:([^)]+)\)/g, (match, imgId) => `](${images[imgId] || ''})`));
};

export const renderSolution = (text, lang, images) => {
  if (!text) return '';
  let processText = text;
  if (!processText.includes('```') && processText.trim().length > 0) processText = `\`\`\`${lang || 'python'}\n${processText}\n\`\`\``;
  return renderMarkdown(processText, images);
};

export const handleSmartPaste = (event, reactiveObj, targetField) => {
  // 保持原有智能粘贴逻辑完全不变...
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) return;
  const insertTextAtCursor = (textarea, textToInsert) => {
    const startPos = textarea.selectionStart; const endPos = textarea.selectionEnd; const text = reactiveObj[targetField] || '';
    reactiveObj[targetField] = text.substring(0, startPos) + textToInsert + text.substring(endPos);
    setTimeout(() => { textarea.focus(); textarea.selectionStart = textarea.selectionEnd = startPos + textToInsert.length; }, 10);
  };
  const items = clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      event.preventDefault(); const blob = items[i].getAsFile(); const reader = new FileReader();
      reader.onload = (e) => {
        const imgId = 'img_' + Date.now() + Math.floor(Math.random() * 100);
        if (!reactiveObj.images) reactiveObj.images = {};
        reactiveObj.images[imgId] = e.target.result; insertTextAtCursor(event.target, `\n![图片](local:${imgId})\n`);
      };
      reader.readAsDataURL(blob); return;
    }
  }
  const htmlData = clipboardData.getData('text/html'); const plainText = clipboardData.getData('text/plain');
  if (htmlData) {
    const isFromIDE = htmlData.includes('vscode') || htmlData.includes('monaco') || htmlData.includes('CodeMirror') || htmlData.includes('font-family: Consolas');
    const isRichText = /<(h[1-6]|b|strong|em|i|a|p|ul|li|table|blockquote)[^>]*>/i.test(htmlData);
    if (isRichText && !isFromIDE && !plainText.match(/^```/)) {
      event.preventDefault(); let markdown = turndownService.turndown(htmlData);
      markdown = markdown.replace(/(\*\*|\*)([\s\S]*?)\1([a-zA-Z0-9\u4e00-\u9fa5_])/g, (m, s, p1, p2) => `${s}${p1.replace(/\n+/g, ' ').trim()}${s} ${p2}`);
      markdown = markdown.replace(/(\*\*|\*)([\s\S]*?)\1/g, (m, s, p1) => `${s}${p1.replace(/\n+/g, ' ').trim()}${s}`);
      insertTextAtCursor(event.target, markdown.replace(/\n{3,}/g, '\n\n'));
    }
  }
};