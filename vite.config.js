import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  base: './', 
  server: {
    watch: {
      // 【核心修复】：忽略 public 文件夹的监听，防止物理写入 data.json 触发 Vite 全局刷新导致页面闪回首页
      ignored: ['**/public/**']
    }
  },
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'local-file-saver',
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
      }
    }
  ],
})