import { openDB } from 'idb';

const DB_NAME = 'storyshare-favorite-db';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

const FavoriteDB = {
  async getAll() {
    return (await dbPromise).getAll(STORE_NAME);
  },
  
  async get(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },
  
  async put(story) {
    if (!story.id) throw new Error('Story harus memiliki id');
    return (await dbPromise).put(STORE_NAME, story);
  },
  
  async delete(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  }
};

export default FavoriteDB;
