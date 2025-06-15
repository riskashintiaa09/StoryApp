import FavoriteDB from '../../utils/favorite-db';

export default class FavoritePresenter {
  constructor({ view, favoriteDB = FavoriteDB }) {
    this._view = view;
    this._favoriteDB = favoriteDB;
  }

  async getFavoriteStories() {
    try {
      const favoriteStories = await this._favoriteDB.getAll();
      return favoriteStories;
    } catch (error) {
      console.error('Error fetching favorite stories:', error);
      throw error;
    }
  }

  async removeFavorite(id) {
    try {
      await this._favoriteDB.delete(id);
      return await this.getFavoriteStories();
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }
}