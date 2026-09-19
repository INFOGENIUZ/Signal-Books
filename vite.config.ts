import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function drivePdfProxyPlugin(): Plugin {
  return {
    name: 'drive-pdf-proxy',
    configureServer(server) {
      server.middlewares.use('/api/drive-pdf', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost:3000');
          const fileId = urlObj.searchParams.get('id');
          if (!fileId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('File ID required');
            return;
          }

          const fetchPdf = async (url: string) => {
            return await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,text/html,*/*'
              },
              redirect: 'follow'
            });
          };

          const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          let driveRes = await fetchPdf(initialUrl);

          let contentType = driveRes.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            const html = await driveRes.text();
            const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/) || html.match(/href="(\/uc\?export=download[^"]+)"/);
            if (confirmMatch && confirmMatch[1]) {
              const confirmUrl = confirmMatch[1].startsWith('/') 
                ? `https://drive.google.com${confirmMatch[1]}`
                : `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
              driveRes = await fetchPdf(confirmUrl);
              contentType = driveRes.headers.get('content-type') || '';
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Google Drive PDF not directly downloadable');
              return;
            }
          }

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          
          const arrayBuf = await driveRes.arrayBuffer();
          res.end(Buffer.from(arrayBuf));
        } catch (err: any) {
          console.error('Drive PDF Proxy Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end(err.message || 'Error fetching drive pdf');
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), drivePdfProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
