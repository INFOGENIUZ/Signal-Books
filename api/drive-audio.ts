import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  send: (body: any) => VercelResponse;
  json: (body: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const fileId = (req.query?.id as string) || url.searchParams.get('id');

    if (!fileId) {
      res.statusCode = 400;
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
        if (rangeHeader) {
          fetchHeaders['Range'] = rangeHeader;
        }
        if (cookieJar) {
          fetchHeaders['Cookie'] = cookieJar;
        }

        const response = await fetch(testUrl, {
          headers: fetchHeaders,
          redirect: 'follow',
        });

        // Collect cookies
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          const cookies = setCookie.split(',').map(c => c.split(';')[0].trim()).join('; ');
          cookieJar = cookieJar ? `${cookieJar}; ${cookies}` : cookies;
        }

        const contentType = response.headers.get('content-type') || '';

        // If Google Drive returns HTML warning / confirm page
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
        console.warn(`Drive audio attempt failed for ${testUrl}:`, err);
      }
    }

    if (!driveRes) {
      res.statusCode = 404;
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

    if (driveRes.body) {
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(driveRes.body as any);
      nodeStream.pipe(res);
    } else {
      const arrayBuf = await driveRes.arrayBuffer();
      res.end(Buffer.from(arrayBuf));
    }
  } catch (err: any) {
    console.error('Drive Audio Proxy Error in Vercel function:', err);
    res.statusCode = 500;
    res.end(err.message || 'Error streaming drive audio');
  }
}
