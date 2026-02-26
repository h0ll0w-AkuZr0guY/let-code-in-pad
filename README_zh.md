# Let Code in Pad 🚀

一个轻量级、完全离线、专为平板优化的跨端个人生产力知识库。

**Let Code in Pad (LCP)** 专为 **“电脑端沉浸式录入，平板端碎片化复习与管理”** 的工作流量身定制。它利用纯前端黑科技与混合存储方案，让你无需配置任何复杂的后端服务器和数据库，就能极其优雅地管理算法题、面经笔记、技术沉淀，甚至平行的私人日记与手账。

## ✨ 核心特性 (Features)

### 🌌 彻底隔离的“平行空间”
- **技术区 (Tech Space)**：专注算法特训与面经笔记。
- **生活区 (Life Space)**：记录个人日记与手账记录。
- 双击头像瞬间无缝切换。两个空间的**标签池**和**回收站**在底层实现了绝对的物理隔离，保护你的专注与隐私。

### 📝 极客级富文本/Markdown 混合引擎
- **智能粘贴 (Smart Paste)**：直接从浏览器或 IDE 复制富文本/图片，自动转化为标准的 Markdown 与本地 Base64 图片，完美保留代码缩进。
- **排版与渲染**：内置现代版 `KaTeX` 引擎，支持极其复杂的 LaTeX 高等数学公式渲染。
- **独立代码块**：仿 macOS 风格的代码块 UI，支持**独立的一键复制**与**独立放大/缩小**。

### 💾 混合存储黑科技 & Github 同步
- **PC 录入模式**：利用自定义化 Vite 拦截器中间件，保存瞬间直接穿	理覆写到本地 `data.json` 和物理图片文件夹。
- **平板消费模式**：基于 `localforage` (IndexedDB) 提供丝滑的离线增删改查。
- **一键 Github 同步**：只需填入 Github Raw 链接，引擎会自动并发拉取数据，并**自动把云端图片下载转码为本地离线 Base64 缓存**，断网依然图文并茂！

### 🎨 原生级交互与自定义体验
- **动态字号与排版**：全局响应式 `A+ / A-` 字号控制，随心调整阅读舒适度。
- **悬浮目录导航 (TOC)**：长篇面经自动提取 1~4 级标题，生成带毛玻璃效果的悬浮侧边栏与顶部横向滑动快捷栏，基于精密算法实现防布局错位的平滑滚动。
- **拖拽式标签管理**：引入 `SortableJS`，支持鼠标/手指长按丝滑拖拽给标签排序，内置全局拾色器。
- **全局深色模式**：Tailwind 原生级 `dark:` 变量驱动，完美反转保护高亮代码与图片。

### 📤 纯前端离线导出
- 一键将整个分类或单篇笔记导出为 **Markdown** 或 **高清 PDF**。
- 底层的异步内联引擎会在导出瞬间将所有本地图片转码焊死在文件里，确保发送给任何人都不“图裂”。

---

## 📂 文件夹结构与源码释义

```text
let-code-in-pad/
├── android/                 # Capacitor 生成的 Android 原生工程目录
├── public/                  
│   ├── data.json            # [核心] 本地开发时的持久化数据源
│   └── images/              # [核心] 本地开发时由 Vite 插件物理保存的图片目录
├── src/
│   ├── components/          # Vue 组件库
│   │   ├── ActionMenuModal.vue   # 长按呼出的底部菜单 (置顶/分享/删除)
│   │   ├── AlgoView.vue          # 算法题双栏刷题视图 (可拖拽侧边栏)
│   │   ├── DiaryView.vue         # 日记/手账沉浸式单栏视图
│   │   ├── InterviewView.vue     # 面经视图 (带顶部快捷 H2 导航条)
│   │   ├── FloatingNav.vue       # 移动端边缘悬浮防误触翻页按钮
│   │   ├── ImportSyncModal.vue   # 强大的同步中心 (Github/MD/剪贴板)
│   │   ├── TocPanel.vue          # 右侧毛玻璃悬浮目录 (防特殊字符正则引擎)
│   │   ├── TrashModal.vue        # 空间隔离的回收站
│   │   └── UserCenterModal.vue   # 个人中心与导出枢纽
│   ├── composables/         # 组合式函数 (逻辑解耦)
│   │   └── useSyncEngine.js      # 抽离的核心同步、导入、数据转换引擎
│   ├── utils/
│   │   └── core.js               # [核心引擎] Markdown-it 挂载、Turndown 富文本解析拦截、粘贴劫持
│   ├── App.vue              # [应用中枢] 状态调度、路由分发、布局框架
│   ├── main.js              # Vue 应用入口，Tailwind 全局引入
│   └── style.css            # 全局样式 (含深色模式变量与 Markdown 定制)
├── capacitor.config.json    # 原生打包配置文件
├── package.json             # 依赖管理
└── vite.config.js           # [黑科技] 包含 `local-file-manager` 物理写盘与打包清洗逻辑的自定义配置
```

------

## 🛠️ 开发与部署指引

### 1. 环境准备

- 安装 **Node.js** (推荐 LTS 版本)。
- 如果需要打包安卓 APK，请配置好 **Android Studio** 与 Java 环境。

### 2. 初始化项目

```Bash
git clone git@github.com:h0ll0w-AkuZr0guY/let-code-in-pad.git
cd let-code-in-pad
npm install
```

### 3. PC 端工作流 (数据生产与录入)

这是你的**内容生产环节**。启动项目后，保存操作会直接修改电脑上的硬盘文件。

```Bash
npm run dev
```

- 在浏览器打开 `http://localhost:5173`。
- 直接截图粘贴图片、编写 Markdown、保存。所有数据会物理落地到 `public/data.json` 和 `public/images`。
- **推荐**：将生成的代码推送到 Github，利用本应用的 Github 同步功能分发到你的所有移动设备！

### 4. 平板端工作流 (打包为离线 App)

当你要把 App 安装到平板或手机时：



```Bash
# 1. 生产环境构建 (注意：vite.config.js 会在此时自动清空打包产物里的 data.json 和图片，实现“空壳化”安装包)
npm run build

# 2. 将 Web 产物同步给 Capacitor Android 工程
npx cap sync

# 3. 打开 Android Studio 进行 APK 编译打包
npx cap open android
```

*安装到平板后，前往“同步中心”点击拉取，即可拥有一个满血版的极速离线知识库！*

------

## 🔮 后续开发计划 (Roadmap)

- [ ] **多层级标签过滤系统**：目前支持单分类点击，未来将支持多标签的交叉筛选 (AND / OR 逻辑)。
- [ ] **WebDAV / 坚果云 同步**：除了现有的 Github Raw 单向拉取，增加基于 WebDAV 的双向云端静默同步备份。
- [ ] **学习热力图看板**：基于日记与算法题的录入时间，生成类似 GitHub 的年度贡献热力图 (Heatmap) 与统计图表。