/**
 * AudioStorage Service
 * Provides IndexedDB persistence for uploaded audio files (MP3/M4A/WAV)
 * so they can be replayed on any page, survive page reloads, and play without network latency.
 */

const DB_NAME = 'SignalBooksAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';

interface AudioRecord {
  id: string;
  blob: Blob;
  name: string;
  mimeType: string;
  size: number;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache for active Object URLs to avoid leaking memory
const activeObjectUrls = new Map<string, string>();

export const AudioStorageService = {
  /**
   * Saves an audio File or Blob into IndexedDB
   * @returns unique local audio storage ID (e.g. "local-audio-17112345678")
   */
  async saveAudioFile(fileOrBlob: Blob, customId?: string, fileName?: string): Promise<string> {
    const id = customId || `audio-${Date.now()}`;

    // Create an ObjectURL and cache it immediately in memory for instant playback
    try {
      const url = URL.createObjectURL(fileOrBlob);
      activeObjectUrls.set(id, url);
    } catch (e) {
      console.warn('Could not create immediate object URL:', e);
    }

    try {
      const db = await openDB();
      const record: AudioRecord = {
        id,
        blob: fileOrBlob,
        name: fileName || (fileOrBlob instanceof File ? fileOrBlob.name : 'audio.mp3'),
        mimeType: fileOrBlob.type || 'audio/mpeg',
        size: fileOrBlob.size,
        updatedAt: Date.now()
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (dbErr) {
      console.warn('IndexedDB save warning (in-memory URL still active):', dbErr);
    }

    return id;
  },

  /**
   * Retrieves an audio record from IndexedDB or memory cache and returns a playable ObjectURL
   */
  async getAudioUrl(idOrUrl: string): Promise<string | null> {
    if (!idOrUrl) return null;

    // If it's already a playable URL (blob:, data:, http://, https://, /api/...)
    if (
      idOrUrl.startsWith('blob:') || 
      idOrUrl.startsWith('data:') || 
      idOrUrl.startsWith('http://') || 
      idOrUrl.startsWith('https://') ||
      idOrUrl.startsWith('/')
    ) {
      return idOrUrl;
    }

    // Check memory cache first
    if (activeObjectUrls.has(idOrUrl)) {
      return activeObjectUrls.get(idOrUrl)!;
    }

    // Lookup in IndexedDB
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(idOrUrl);

        req.onsuccess = () => {
          const record = req.result as AudioRecord | undefined;
          if (record && record.blob) {
            const url = URL.createObjectURL(record.blob);
            activeObjectUrls.set(idOrUrl, url);
            resolve(url);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  /**
   * Deletes an audio file from IndexedDB
   */
  async deleteAudio(id: string): Promise<void> {
    if (activeObjectUrls.has(id)) {
      try {
        URL.revokeObjectURL(activeObjectUrls.get(id)!);
      } catch {}
      activeObjectUrls.delete(id);
    }
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    } catch {}
  }
};
