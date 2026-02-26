# Let Code in Pad 🚀

A lightweight, purely offline, tablet-optimized cross-platform personal knowledge base.

**Let Code in Pad (LCP)** is tailored specifically for the workflow of **"Immersive input on PC, fragmented review and management on Tablets."** Utilizing frontend magic and a hybrid storage architecture, it allows you to elegantly manage algorithmic problems, interview notes, technical articles, and even parallel private diaries—all without setting up complex backend servers or databases.

## ✨ Core Features

### 🌌 Fully Isolated "Parallel Spaces"
- **Tech Space**: Focused on algorithm training and interview preparation.
- **Life Space**: A private area for daily journals and diaries.
- Switch instantly by double-clicking your avatar. The **Tag Pool** and **Trash Bin** of the two spaces are strictly isolated at the physical level to protect your focus and privacy.

### 📝 Geek-Level Rich-Text/Markdown Hybrid Engine
- **Smart Paste**: Directly copy rich-text/images from browsers or IDEs. It automatically converts them to standard Markdown and local Base64 images while preserving code indentation.
- **Typography & Rendering**: Built-in modern `KaTeX` engine supports rendering extremely complex LaTeX mathematical formulas.
- **Independent Code Blocks**: macOS-styled code blocks that support **independent 1-click copying** and **independent zooming (A+/A-)**.

### 💾 Hybrid Storage Magic & GitHub Sync
- **PC Input Mode**: Utilizes a custom Vite interceptor middleware. When you save, it bypasses the browser sandbox and writes data directly to your local hard drive (`data.json` and physical image folders).
- **Tablet Consumption Mode**: Powered by `localforage` (IndexedDB) for silky-smooth offline CRUD operations.
- **1-Click GitHub Sync**: Enter a GitHub Raw link, and the engine will concurrently fetch data and **automatically download/transcode cloud images into local offline Base64 cache**. Works perfectly even without the internet!

### 🎨 Native-Level UX & Customization
- **Dynamic Typography**: Global responsive `A+ / A-` font size controls.
- **Floating TOC (Table of Contents)**: Automatically extracts headings (H1-H4) from long articles to generate a glassmorphism floating sidebar and a top horizontal quick-nav bar, utilizing a precise calculation engine for smooth scrolling without breaking the layout.
- **Drag & Drop Tag Management**: Powered by `SortableJS`. Long-press to smoothly drag and reorder tags. Includes a global color picker.
- **Global Dark Mode**: Driven by Tailwind's native `dark:` variant, perfectly inverting colors while protecting highlighted code and images.

### 📤 Pure Frontend Offline Export
- 1-click export of an entire category or single note to **Markdown** or **High-Def PDF**.
- The underlying async inlining engine automatically transcodes and hardcodes all local images into the exported file instantly, ensuring no "broken images" when sharing with others.

---

## 📂 Folder Structure & File Meanings

```text
let-code-in-pad/
├── android/                 # Capacitor-generated native Android project
├── public/                  
│   ├── data.json            # [Core] Persistent data source for local development
│   └── images/              # [Core] Physical image directory written by Vite plugin
├── src/
│   ├── components/          # Vue Component Library
│   │   ├── ActionMenuModal.vue   # Long-press context menu (Pin/Share/Delete)
│   │   ├── AlgoView.vue          # Split-pane view for algorithms (draggable resizer)
│   │   ├── DiaryView.vue         # Immersive single-column view for diaries
│   │   ├── InterviewView.vue     # Interview notes view (with top H2 quick nav)
│   │   ├── FloatingNav.vue       # Edge-floating anti-touch navigation buttons
│   │   ├── ImportSyncModal.vue   # Powerful Sync Center (GitHub/MD/Clipboard)
│   │   ├── TocPanel.vue          # Glassmorphism right sidebar TOC
│   │   ├── TrashModal.vue        # Space-isolated Recycle Bin
│   │   └── UserCenterModal.vue   # Profile & Export Hub
│   ├── composables/         # Composable Functions (Logic Decoupling)
│   │   └── useSyncEngine.js      # Extracted sync, import, and data transformation engine
│   ├── utils/
│   │   └── core.js               # [Core Engine] Markdown-it setup, Turndown HTML interceptor, Smart Paste
│   ├── App.vue              # [Main Hub] State scheduling, routing, layout framework
│   ├── main.js              # Vue entry point, Tailwind global import
│   └── style.css            # Global styles (Dark mode variants & MD customization)
├── capacitor.config.json    # Native build configuration
├── package.json             # Dependencies
└── vite.config.js           # [Magic] Custom Vite config containing `local-file-manager` for physical disk writing and build-time payload cleaning
```

------

## 🛠️ Development & Deployment Guide

### 1. Prerequisites

- Install **Node.js** (LTS version recommended).
- To build the Android APK, ensure **Android Studio** and Java environments are configured.

### 2. Initialization


```Bash
git clone git@github.com:h0ll0w-AkuZr0guY/let-code-in-pad.git
cd let-code-in-pad
npm install
```

### 3. PC Workflow (Data Production)

This is your **content creation environment**. When running locally, saving an item writes directly to your computer's hard drive.


```Bash
npm run dev
```

- Open `http://localhost:5173` in your browser.
- Paste images directly, write Markdown, and hit save. Data is physically saved to `public/data.json` and `public/images`.
- **Pro Tip**: Push the generated files to GitHub and use the App's GitHub Sync feature to distribute the data to all your mobile devices!

### 4. Tablet Workflow (Build Offline App)

When you are ready to install the App on your tablet or phone:


```Bash
# 1. Production Build (Note: vite.config.js automatically empties data.json and images to output a "clean shell" APK)
npm run build

# 2. Sync Web assets to Capacitor Android project
npx cap sync

# 3. Open Android Studio to compile the APK
npx cap open android
```

*After installing it on your tablet, go to the "Sync Center" and pull your repo to instantly populate a blazing-fast offline knowledge base!*

------

## 🔮 Future Roadmap

- [ ] **Multi-Level Tag Filtering**: Upgrade from single-tag clicking to cross-filtering multiple tags (AND / OR logic).
- [ ] **WebDAV Cloud Sync**: Add bi-directional silent background sync via WebDAV (e.g., Nextcloud), complementing the current GitHub Raw one-way pull.
- [ ] **Contribution Heatmap**: Generate GitHub-style annual contribution heatmaps and statistical charts based on entry creation times.