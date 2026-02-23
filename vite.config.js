import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  base: './', 
  server: {
    watch: {
      ignored: ['**/public/**']
    }
  },
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'local-file-manager',
      
      // 1. 本地开发时的保存拦截逻辑（保持不变）
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/save' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const publicDir = path.resolve(__dirname, 'public');
                const imgDir = path.join(publicDir, 'images');
                if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

                data.forEach(item => {
                  if (item.images) {
                    for (const [imgId, base64] of Object.entries(item.images)) {
                      if (base64.startsWith('data:image')) {
                        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                          const ext = matches[1].split('/')[1] || 'png';
                          const filename = `${imgId}.${ext}`;
                          fs.writeFileSync(path.join(imgDir, filename), matches[2], 'base64');
                          const localRegex = new RegExp(`\\]\\(local:${imgId}\\)`, 'g');
                          item.problemText = item.problemText?.replace(localRegex, `](/images/${filename})`);
                          item.solutionText = item.solutionText?.replace(localRegex, `](/images/${filename})`);
                        }
                      }
                    }
                    item.images = {}; 
                  }
                });

                fs.writeFileSync(path.join(publicDir, 'data.json'), JSON.stringify(data, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          } else {
            next();
          }
        });
      },

      // 2. 【核心新增】打包完成后的自动清洗逻辑
      closeBundle() {
        const outDir = path.resolve(__dirname, 'dist');
        const imgDir = path.join(outDir, 'images');
        const dataFile = path.join(outDir, 'data.json');
        
        // 生产构建时，强制将 dist 里的 data.json 重置为空数组
        if (fs.existsSync(dataFile)) {
          fs.writeFileSync(dataFile, '[]', 'utf-8');
          console.log('✅ Build: 已自动清空 data.json，输出空壳结构。');
        }
        
        // 生产构建时，强制删除 dist 里拷贝过去的图片文件夹
        if (fs.existsSync(imgDir)) {
          fs.rmSync(imgDir, { recursive: true, force: true });
          console.log('✅ Build: 已移除打包文件中的本地物理图片。');
        }
      }
    }
  ],
})