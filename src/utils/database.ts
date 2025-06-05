import Dexie from 'dexie';

interface MangaPreview {
  id: string;
  cover: string;
  title: string;
  description: string;
  cachedAt: Date;
}

class MangaCacheDB extends Dexie {
  mangas: Dexie.Table<MangaPreview, string>;

  constructor() {
    super('MangaCacheDB');
    // Version 1: single object store mangas keyed by “id”
    this.version(1).stores({
      mangas: 'id, cachedAt'   // primary key “id”, indexed prop “cachedAt”
    });

    // Expose a typed table
    this.mangas = this.table('mangas');
  }
}

export const db = new MangaCacheDB();

export type HistoryElement = {
  comic_id: string;
  comic_name: string;
  comic_slug: string;

  chapter_id: string;
  chapter_name: string;
  chapter_slug: string;

  thumbnail: string;

  read_at: Date;
}

export async function getHistoryInfo(key: string): Promise<HistoryElement | undefined> {
  return new Promise((resolve, reject) => {
    // Open the database
    const request = indexedDB.open('ComicHistoryDB');
    
    request.onsuccess = function(event) {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
      
      // Start a transaction
      const transaction = db.transaction(['readingHistory'], 'readonly');
      const objectStore = transaction.objectStore('readingHistory');
      
      // Get the record by key
      const getRequest = objectStore.get(key);
      
      getRequest.onsuccess = function(event) {
        const result = (event.target as IDBRequest).result;
        resolve(result); // Will be undefined if key doesn't exist
      };
      
      getRequest.onerror = function(event) {
        reject('Error retrieving data: ' + (event.target as IDBRequest).error);
      };
    };
    
    request.onerror = function(event) {
      reject('Error opening database: ' + (event.target as IDBRequest).error);
    };
  });
}