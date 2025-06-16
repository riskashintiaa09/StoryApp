import { showFormattedDate } from '../../utils';
import { initMap } from '../../utils/map';
import HomePresenter from './home-presenter';
import FavoriteDB from '../../utils/favorite-db';
 
export default class HomePage {
  constructor() {
    this.map = null;
    this.presenter = null;
  }

  async render() {
    return `
      <section class="container fade-in">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        
        <div class="intro-text">
  <h1 id="content" tabindex="0">Titik Cerita</h1>
  <p>Titik Cerita menghadirkan cara baru untuk bercerita. Kamu bisa menambahkan cerita di lokasi mana pun di peta mulai dari momen berkesan, pengalaman pribadi, hingga kenangan tak terlupakan.
  Setiap titik yang kamu tandai menyimpan kisah unik yang bisa dibagikan atau disimpan untuk diri sendiri. 
  Jelajahi peta, temukan kisah orang lain, dan rasakan dunia dari sudut pandang berbeda. Titikmu, ceritamu.</p>
</div>
        <div class="map-container">
          <div id="map" class="map"></div>
        </div>
        
        <div class="action-container">
          <a href="#/add" class="btn btn-primary" aria-label="Add new story">
            <i class="fas fa-plus"></i> Bagikan Ceritamu
          </a>
        </div>
        
        <div id="stories-container" class="stories-container">
          <div class="loading-indicator">Loading stories...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();
    this._initPresenter();
    await this.presenter.getStories();
  }
  
  _initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    this.map = initMap('map');
  }
  
  _initPresenter() {
    this.presenter = new HomePresenter({
      view: this,
      map: this.map
    });
  }

  showStories(stories) {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = '';
    
    stories.forEach((story) => {
      storiesContainer.innerHTML += this._createStoryItemTemplate(story);
    });

    this._initFavoriteButtons();
    this.initTransition();
  }
  
  async _initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    
    for (const button of favoriteButtons) {
      const storyId = button.dataset.id;
      const isFavorite = await FavoriteDB.get(storyId);
      
      if (isFavorite) {
        button.textContent = "Favoritku";
        button.classList.add('favorited');
      }
      
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const storyId = button.dataset.id;
        const story = this.presenter.stories.find(s => s.id === storyId);
        
        if (!story) return;
        
        const isFavorite = await FavoriteDB.get(storyId);
        
        if (isFavorite) {
          await FavoriteDB.delete(storyId);
          button.textContent = "Favoritkan";
          button.classList.remove('favorited');
        } else {
          await FavoriteDB.put(story);
          button.textContent = "Favoritku";
          button.classList.add('favorited');
        }
      });
    }
  }
  
  showError(message) {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }

  showEmpty() {
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = `<div class="empty-message">No stories found</div>`;
  }

  _createStoryItemTemplate(story) {
    return `
      <article class="story-item">
        <div class="story-image-container">
          <img 
            src="${story.photoUrl}" 
            alt="Story image by ${story.name}" 
            class="story-image"
            loading="lazy"
          >
        </div>
        <div class="story-content">
          <h2 class="story-title">${story.name}</h2>
          <p class="story-date"><i class="fas fa-calendar-alt"></i> ${showFormattedDate(story.createdAt)}</p>
          <p class="story-description">${this._truncateText(story.description, 150)}</p>
          
          <div class="story-actions">
            <button class="favorite-button" data-id="${story.id}">Favoritkan</button>
            <a href="#/detail/${story.id}" class="btn-view-detail">Detail</a>
          </div>
        </div>
      </article>
    `;
  }

  _truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  initTransition() {
    document.querySelectorAll('.story-item').forEach((item, index) => {
      setTimeout(() => {
        item.style.animation = 'fadeIn 0.5s forwards';
        item.style.opacity = '0';
      }, index * 100);
    });
  }
}
