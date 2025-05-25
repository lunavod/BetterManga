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