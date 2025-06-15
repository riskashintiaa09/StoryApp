import { showFormattedDate } from '../../utils';
import { isLoggedIn } from '../../data/api';
import FavoritePresenter from './favorite-presenter';

const FavoritePage = {
  async render() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return '';
    }
    
    return `
      <section class="favorite-page container fade-in">
        <div class="favorite-page__header">
          <h2 class="page-title">Cerita Favoritku </h2>
         
        </div>
        
        <div id="loading-container" class="loading-spinner">
          <div class="spinner"></div>
        </div>
        
        <div id="favoriteStoriesContainer" class="stories-grid"></div>
      </section>
    `;
  },

  async afterRender() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }
    
    this._container = document.getElementById('favoriteStoriesContainer');
    this._loadingContainer = document.getElementById('loading-container');
    this._presenter = new FavoritePresenter({ view: this });
    await this._renderFavoriteStories();
  },

  showLoading() {
    this._loadingContainer.style.display = 'flex';
  },

  hideLoading() {
    this._loadingContainer.style.display = 'none';
  },

  async _renderFavoriteStories() {
    try {
      this.showLoading();
      const favoriteStories = await this._presenter.getFavoriteStories();
      this.hideLoading();

      if (favoriteStories.length === 0) {
        this.showEmptyFavorites();
        return;
      }

      this.showFavoriteStories(favoriteStories);
    } catch (error) {
      this.hideLoading();
      this.showError(error);
    }
  },

  showEmptyFavorites() {
    this._container.innerHTML = `
      <div class="empty-state">
       <i class="fas fa-book empty-state__icon" style="color:rgb(255, 255, 255);"></i>
        <h3 class="empty-state__title">Belum ada cerita favorit. Yuk, tambahkan beberapa!</h3>
        <a href="#/" class="browse-stories-btn">
          <i class="fas fa-search"></i> Temukan Cerita
        </a>
      </div>
    `;
  },

  showError(error) {
    this._container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle error-state__icon"></i>
        <p class="error-state__message">Maaf, cerita favorit tidak dapat dimuat saat ini. Silakan coba kembali.</p>
        <button id="retry-button" class="retry-btn">
          <i class="fas fa-redo"></i> Yuk, coba lagi!
        </button>
      </div>
    `;
    
    document.getElementById('retry-button').addEventListener('click', () => {
      this._renderFavoriteStories();
    });
    
    console.error(error);
  },

  showFavoriteStories(stories) {
    this._container.innerHTML = '';
    
    stories.forEach(story => {
      const storyCard = document.createElement('article');
      storyCard.className = 'story-card fade-in';

      const description = story.description ? 
        story.description.substring(0, 100) + (story.description.length > 100 ? '...' : '') : 
        'Tidak ada deskripsi untuk cerita ini.';

      storyCard.innerHTML = `
        <div class="story-card__image-container">
          <img 
            src="${story.photoUrl}" 
            alt="${story.name}" 
            class="story-card__image"
            onerror="this.src='src/public/images/default-story.jpg'" 
          />
        </div>
        <div class="story-card__content">
          <h3 class="story-card__title">${story.name}</h3>
          <div class="story-card__info">
            <span><i class="fas fa-calendar"></i> ${showFormattedDate(story.createdAt)}</span>
            ${story.lat && story.lon ? '<span><i class="fas fa-map-marker-alt"></i> Lokasi tersedia</span>' : ''}
          </div>
          <p class="story-card__description">${description}</p>
          <div class="story-card__actions">
            <a href="#/detail/${story.id}" class="btn-detail">
              <i class="fas fa-book-open"></i> Detail
            </a>
            <button class="unfavorite-btn" data-id="${story.id}" aria-label="Hapus dari Favorit">
              <i class="fas fa-trash-alt"></i> Hapus 
            </button>
          </div>
        </div>
      `;

      this._container.appendChild(storyCard);

      this._initUnfavoriteButton(storyCard, story.id);
    });
  },

  _initUnfavoriteButton(element, storyId) {
    element.querySelector('.unfavorite-btn').addEventListener('click', async (event) => {
      try {
        if (confirm('Apakah Anda yakin ingin menghapus cerita ini dari favorit?')) {
          element.classList.add('removing');

          await this._presenter.removeFavorite(storyId);

          await this._renderFavoriteStories();
        }
      } catch (error) {
        console.error('Failed to remove favorite:', error);
        alert('Gagal menghapus dari favorit. Silakan coba lagi.');
      }
    });
  }
};

export default FavoritePage;