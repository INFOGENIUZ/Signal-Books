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

function driveAudioProxyPlugin(): Plugin {
  return {
    name: 'drive-audio-proxy',
    configureServer(server) {
      server.middlewares.use('/api/drive-audio', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
        res.setHeader('Accept-Ranges', 'bytes');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          const urlObj = new URL(req.url || '', 'http://localhost:3000');
          const fileId = urlObj.searchParams.get('id');
          if (!fileId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('File ID required');
            return;
          }

          const rangeHeader = req.headers.range;
          const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

          const candidateUrls = [
            `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
            `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
            `https://docs.google.com/uc?export=download&id=${fileId}`,
            `https://drive.google.com/uc?export=download&id=${fileId}`
          ];

          let driveRes: Response | null = null;
          let cookieJar = '';

          for (const testUrl of candidateUrls) {
            try {
              const fetchHeaders: Record<string, string> = {
                'User-Agent': userAgent,
                'Accept': '*/*',
              };
              if (rangeHeader) fetchHeaders['Range'] = rangeHeader;
              if (cookieJar) fetchHeaders['Cookie'] = cookieJar;

              const response = await fetch(testUrl, {
                headers: fetchHeaders,
                redirect: 'follow',
              });

              const setCookie = response.headers.get('set-cookie');
              if (setCookie) {
                const cookies = setCookie.split(',').map(c => c.split(';')[0].trim()).join('; ');
                cookieJar = cookieJar ? `${cookieJar}; ${cookies}` : cookies;
              }

              const contentType = response.headers.get('content-type') || '';
              if (contentType.includes('text/html')) {
                const html = await response.text();
                const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/) || 
                                     html.match(/href="(\/uc\?export=download[^"]+)"/) ||
                                     html.match(/action="(https:\/\/drive\.usercontent\.google\.com\/download[^"]+)"/);
                const uuidMatch = html.match(/name="uuid" value="([^"]+)"/);

                if (confirmMatch && confirmMatch[1]) {
                  let nextUrl = '';
                  if (confirmMatch[1].startsWith('http')) {
                    nextUrl = confirmMatch[1];
                  } else if (confirmMatch[1].startsWith('/')) {
                    nextUrl = `https://drive.google.com${confirmMatch[1]}`;
                  } else {
                    const uuidParam = uuidMatch ? `&uuid=${uuidMatch[1]}` : '';
                    nextUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${confirmMatch[1]}${uuidParam}`;
                  }

                  const secondHeaders: Record<string, string> = {
                    'User-Agent': userAgent,
                    'Accept': '*/*',
                  };
                  if (rangeHeader) secondHeaders['Range'] = rangeHeader;
                  if (cookieJar) secondHeaders['Cookie'] = cookieJar;

                  const secondRes = await fetch(nextUrl, {
                    headers: secondHeaders,
                    redirect: 'follow'
                  });

                  const secondType = secondRes.headers.get('content-type') || '';
                  if (!secondType.includes('text/html')) {
                    driveRes = secondRes;
                    break;
                  }
                }
                continue;
              }

              if (response.ok || response.status === 206) {
                driveRes = response;
                break;
              }
            } catch (err) {
              console.warn(`Drive audio attempt failed in Vite plugin:`, err);
            }
          }

          if (!driveRes) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Audio file not accessible on Google Drive');
            return;
          }

          let responseType = driveRes.headers.get('content-type') || 'audio/mpeg';
          if (!responseType.includes('audio')) {
            responseType = 'audio/mpeg';
          }
          res.setHeader('Content-Type', responseType);

          const contentRange = driveRes.headers.get('content-range');
          if (contentRange) {
            res.setHeader('Content-Range', contentRange);
          }
          const contentLength = driveRes.headers.get('content-length');
          if (contentLength) {
            res.setHeader('Content-Length', contentLength);
          }

          const statusCode = driveRes.status === 206 ? 206 : (driveRes.ok ? 200 : driveRes.status);
          res.statusCode = statusCode;

          const arrayBuf = await driveRes.arrayBuffer();
          res.end(Buffer.from(arrayBuf));
        } catch (err: any) {
          console.error('Drive Audio Proxy Vite Plugin Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end(err.message || 'Error streaming drive audio');
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), drivePdfProxyPlugin(), driveAudioProxyPlugin()],
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
