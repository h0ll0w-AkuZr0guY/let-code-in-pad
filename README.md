# Let Code in Pad 🚀

A lightweight, fully offline, and tablet-optimized personal knowledge base.

**Let Code in Pad (LCP)** is designed with a specific workflow in mind: **Write on PC, Review & Manage on Tablet**. It allows you to seamlessly manage your algorithm questions, interview notes, and even personal diaries using a local-first approach without any complex backend databases.

## ✨ Key Features

- 🌌 **Parallel App Spaces**: Double-click your avatar in the User Center to toggle between the **Tech Space** (Algorithms & Interview Notes) and the **Life Space** (Diary & Journal). Keep your work and private life elegantly separated.
- 💾 **Hybrid Local Storage**: Zero backend required! On PC, a custom Vite middleware writes data directly to `data.json` and physical image files. On tablets, it utilizes IndexedDB for lightning-fast offline persistence.
- 📤 **Export & Archive**: Pure frontend magic! Export your notes or entire categories to **Markdown** or **High-Definition PDFs**. It asynchronously inlines all local physical images into Base64 to ensure no missing assets during sharing.
- 📦 **LCP Data Protocol**: Share single items across devices instantly using the standardized LCP JSON format via the system clipboard. Copy on PC, tap "Import" on the tablet!
- 📱 **Native Tablet UI/UX**:
  - **Action Menu**: Long-press any card (0.6s) to trigger a beautiful contextual menu (Pin, Edit, Share, Delete).
  - **Floating Navigation**: Subtle, semi-transparent edge buttons for effortless thumb swiping without interfering with content scrolling.
  - **Landscape Lock & Safe Area**: Automatically locks in landscape mode on mobile/tablets and perfectly pads around hardware notches.
- 🎨 **Dynamic Tagging & Trash Bin**: Customize tag colors with a built-in color picker. Deleted items go to a dedicated Trash Bin to prevent accidental data loss.

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite, Tailwind CSS
- **Markdown & Text Processing**: `markdown-it`, `highlight.js`, `turndown` (for smart HTML-to-MD pasting)
- **Native Wrap**: Capacitor (`@capacitor/app`, `@capacitor/clipboard`, `@capacitor/screen-orientation`)
- **Storage**: `localforage` (IndexedDB) & Custom Node.js File System middleware

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed.
- Android Studio (if you want to build the Android APK).

### 2. Installation
```bash
git clone https://github.com/h0ll0w-AkuZr0guY/let-code-in-pad.git
cd let-code-in-pad
npm install
```

### 3. PC Workflow (Content Creation)

Start the local server with physical file-writing permissions:


```bash
npm run dev
```

- Open `http://localhost:5173` in your browser.
- Create items, paste rich-text/images directly, and hit **Save**. Data is instantly written to `public/data.json`.

### 4. Tablet Workflow (Android APK Export)


```bash
npm run build
npx cap sync
npx cap open android
```

*Build the APK in Android Studio and install it on your tablet for a 100% offline, interactive learning experience!*

## 🔮 Roadmap / Future Plans

- [ ] **NFC "Tap to Share"**: Utilize NFC to transfer LCP protocol data instantly between phone and tablet without network constraints.
- [ ] **Cloud Sync (WebDAV/GitHub)**: Optional module to sync your local `data.json` to a personal cloud drive or GitHub Gist.
- [ ] **Dark Mode & Theming**: Full application dark mode support and custom theme configurations via the User Center.
- [ ] **Heatmap & Statistics**: GitHub-style contribution heatmaps for your algorithms and daily journaling.