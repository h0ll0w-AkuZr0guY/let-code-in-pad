# Let Code in Pad 🚀

A lightweight, fully offline, tablet-optimized personal algorithm knowledge base.

**Let Code in Pad** is designed with a specific workflow in mind: **Write on PC, Review on Tablet**. It allows you to seamlessly manage your algorithm questions, code snippets, and study notes using a local-first approach without any complex backend databases.

## ✨ Features

- 📱 **Tablet-Optimized UI**: Features a clean, grid-based home screen for categories and a two-pane split layout (Problem on the left, Solution on the right) for comfortable reading.
- 🗂️ **Smart Sorting & Navigation**: Automatically sorts algorithms based on numerical prefixes in titles (e.g., "01.", "02."). Built-in **"Next / Prev"** buttons allow rapid flipping between questions within the same category.
- 📝 **Markdown & Syntax Highlighting**: Fully supports Markdown for formatting, alongside syntax highlighting for multiple programming languages (Python, C++, Java, JS, Go, C).
- 🖼️ **Direct Image Pasting**: Simply `Ctrl+V` to paste screenshots into the editor! The built-in local server automatically extracts the image, saves it as a physical `.png` file, and inserts the proper Markdown link.
- 💾 **Zero-Backend & Fully Local**: No databases required. All data is saved as a structured `data.json` file, and images are stored locally in the `public` folder.
- 📦 **One-Click App Export**: Powered by Capacitor, you can easily package the entire web app into a standalone `.apk` file to install on your Android tablet for pure offline reading.

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite, Tailwind CSS
- **Markdown Processing**: `markdown-it`, `highlight.js`
- **Native Packaging**: Capacitor
- **Local Storage**: Custom Vite middleware for direct physical file system access

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed on your computer.
- Android Studio (if you want to build the Android APK).

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone [https://github.com/yourusername/let-code-in-pad.git](https://github.com/yourusername/let-code-in-pad.git)
cd let-code-in-pad
npm install
```

### 3. Development & Content Creation (PC Workflow)

Start the local development server with file-writing permissions:

```bash
npm run dev
```

* Open `http://localhost:5173` in your browser.
* Click **"+ 新建算法" (+ New Algorithm)** to start writing.
* Paste images directly into the text areas.
* Click **"保存至本地" (Save to Local)**. Your changes are instantly written to `public/data.json` and `public/images/`.

### 4. Build for Tablet (Android APK Export)

Once you've added your notes, you can package them into an offline Android app:

```bash
# 1. Build the frontend static files
npm run build

# 2. Sync files to the Capacitor Android project
npx cap sync

# 3. Open Android Studio to build the APK
npx cap open android
```

In Android Studio, let Gradle sync finish, then go to `Build > Build Bundle(s) / APK(s) > Build APK(s)` to generate your offline app!

## 📂 Project Structure

* `public/data.json`: The core data file containing all your algorithmic records.
* `public/images/`: Auto-generated folder storing all pasted images.
* `src/App.vue`: The main application logic and UI.
* `vite.config.js`: Contains the custom `local-file-saver` plugin.
