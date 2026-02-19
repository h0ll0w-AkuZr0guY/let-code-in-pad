import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  base: './', // 【新增这行】确保打包后的资源路径是相对路径
  plugins: [
    vue(),
    tailwindcss(),
    {
      // 这是一个自定义的 Vite 插件，用于在本地开发时接管保存请求，将数据和图片物理写入硬盘
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
                if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true }); // 确保目录存在

                // 遍历数据，把 Base64 图片转换成真实的 png 文件
                data.forEach(item => {
                  if (item.images) {
                    for (const [imgId, base64] of Object.entries(item.images)) {
                      if (base64.startsWith('data:image')) {
                        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                          const ext = matches[1].split('/')[1] || 'png';
                          const filename = `${imgId}.${ext}`;
                          fs.writeFileSync(path.join(imgDir, filename), matches[2], 'base64');

                          // 将 Markdown 里的本地占位符替换为真实的相对路径
                          const localRegex = new RegExp(`\\]\\(local:${imgId}\\)`, 'g');
                          item.problemText = item.problemText?.replace(localRegex, `](/images/${filename})`);
                          item.solutionText = item.solutionText?.replace(localRegex, `](/images/${filename})`);
                        }
                      }
                    }
                    item.images = {}; // 图片实体化后，清空内存字典
                  }
                });

                // 将结构化数据写入 public/data.json
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