import { openDB } from 'idb';

const DB_NAME = 'dicodingstory';
const STORE_NAME = 'stories';

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' }); 
    }
  },
});

export const saveStory = async (story) => {
  if (!story.id) {
    throw new Error('Cerita harus memiliki ID');
  }

  const db = await dbPromise;
  await db.put(STORE_NAME, story);
};

export const getAllStories = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const deleteStory = async (id) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
};
