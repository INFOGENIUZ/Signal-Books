import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  send: (body: any) => VercelResponse;
  json: (body: any) => VercelResponse;
}

async function fetchGoogleDrivePdf(fileId: string, maxBytes: number = 35 * 1024 * 1024): Promise<{ buffer: Buffer; contentType: string } | null> {
  const fetchPdf = async (url: string) => {
    return await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,text/html,*/*',
        'Range': `bytes=0-${maxBytes - 1}`
      },
      redirect: 'follow'
    });
  };

  try {
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
        return null;
      }
    }

    const arrayBuf = await driveRes.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuf),
      contentType: contentType || 'application/pdf'
    };
  } catch (err) {
    console.error('Error fetching Google Drive PDF:', err);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const fileId = (req.query?.id as string) || url.searchParams.get('id');
    const isDownload = ((req.query?.download as string) || url.searchParams.get('download')) === 'true';
    const filename = (req.query?.filename as string) || url.searchParams.get('filename') || 'kitob.pdf';

    if (!fileId) {
      res.statusCode = 400;
      res.end('File ID required');
      return;
    }

    const fetched = await fetchGoogleDrivePdf(fileId, 35 * 1024 * 1024);
    if (!fetched) {
      res.statusCode = 404;
      res.end('Google Drive PDF not accessible or private');
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    res.statusCode = 200;
    res.end(fetched.buffer);
  } catch (err: any) {
    console.error('Drive PDF Proxy Error in Vercel function:', err);
    res.statusCode = 500;
    res.end(err.message || 'Error fetching drive pdf');
  }
}
