# Let Code in Pad 🚀

一个轻量级、完全离线、专为平板优化的个人算法知识库。

**Let Code in Pad** 专为 **“电脑端录入，平板端复习”** 的工作流量身定制。它让你无需配置任何复杂的后端服务器和数据库，就能优雅、高效地管理算法题、代码片段和学习笔记。

## ✨ 核心特性

- 📱 **平板专属横屏布局**：首页采用网格卡片分类，详情页采用极简的左右分栏设计（左侧题目，右侧题解），最大化利用平板屏幕宽度。
- 🗂️ **智能排序与快捷翻页**：系统会自动提取标题前的数字序号（如 "01."）进行正序排列；内置 **“上一题 / 下一题”** 按钮，可在同分类下丝滑切题。
- 📝 **Markdown 与代码高亮**：全面支持 Markdown 语法排版，并内置多种语言（Python, C++, Java, JS, Go, C）的深色代码高亮方案。
- 🖼️ **神级截图粘贴体验**：在编辑框直接 `Ctrl+V` 粘贴截图！底层的 Vite 插件会自动提取 Base64 数据，将其保存为本地物理 `.png` 图片，并自动在文本中替换为相对路径。
- 💾 **零后端，纯本地存储**：告别繁琐的数据库配置。所有题目数据均保存为直观的 `data.json`，图片实体化存储在本地文件夹，随时可以打包带走。
- 📦 **一键打包安卓 App**：借助 Capacitor 的跨平台能力，只需几行命令即可将网页原封不动地打包成独立的 `.apk` 安装包，丢进平板实现纯离线的随身知识库。

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API) + Vite
- **样式排版**：Tailwind CSS + `@tailwindcss/typography`
- **Markdown 渲染**：`markdown-it` + `highlight.js`
- **打包工具**：Capacitor
- **本地黑科技**：自定义 Vite 中间件（接管保存请求，实现浏览器向本地硬盘直接写入）

## 🚀 快速开始

### 1. 环境准备
- 电脑已安装 Node.js。
- 若需打包 APK，请提前安装 Android Studio。

### 2. 安装项目
克隆项目并安装全部依赖：
```bash
git clone https://github.com/h0ll0w-AkuZr0guY/let-code-in-pad
cd let-code-in-pad
npm install
```

### 3. 本地创作 (电脑端录入工作流)

启动带有文件写入权限的本地开发服务器：

```bash
npm run dev
```

* 在浏览器打开 `http://localhost:5173`。
* 点击右上角 **“+ 新建算法”** 开始录入题目。
* 尽情地截取题目描述和图片，直接粘贴进输入框。
* 点击 **“保存至本地”**。你的数据直接保存到 `public/data.json` 中，图片也会自动存储到 `public/images/` 目录下。

### 4. 打包为平板 App (生成 APK)

当你录入完一批题目后，就可以将它们连同所有图片一起打包，发送给你的平板：

```bash
# 1. 编译前端静态页面（数据和图片会被打包进 dist 目录）
npm run build

# 2. 将编译好的网页同步进 Capacitor 的安卓工程中
npx cap sync

# 3. 手动打开 Android Studio 或者使用命令行唤起
npx cap open android

```

在 Android Studio 中打开 `android` 文件夹后，等待右下角 Gradle 同步完成，接着点击顶部菜单栏 `Build > Build Bundle(s) / APK(s) > Build APK(s)` 即可生成属于你的离线平板 App！

## 📂 核心目录结构

* `public/data.json`: 你的算法数据库（纯文本 JSON，方便备份）。
* `public/images/`: 存放所有你粘贴进来的截图物理文件。
* `src/App.vue`: 承载了所有核心视图、状态管理和交互逻辑的集大成者。
* `vite.config.js`: 包含了 `local-file-saver` 这个拦截保存请求并物理写盘的黑科技插件。
