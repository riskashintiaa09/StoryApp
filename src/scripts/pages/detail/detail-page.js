import { showFormattedDate } from '../../utils';
import { initMap } from '../../utils/map';
import { parseActivePathname } from '../../routes/url-parser';
import DetailPresenter from './detail-presenter';

export default class DetailPage {
  constructor() {
    this.map = null;
    this.presenter = null;
  }

  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        
        
          </a>
        </div>
        
        <div id="content" class="story-detail" tabindex="0">
          <div class="loading-indicator">Loading story details...</div>
        </div>
        
        <div class="map-container">
          <div id="detail-map" class="map"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();
    this._initPresenter();
    
    const { id } = parseActivePathname();
    await this.presenter.getStoryDetail(id);
  }
  
  _initMap() {
    const mapContainer = document.getElementById('detail-map');
    if (!mapContainer) return;
    
    this.map = initMap('detail-map');
  }
  
  _initPresenter() {
    this.presenter = new DetailPresenter({
      view: this,
      map: this.map
    });
  }
  
  showStoryDetail(story) {
    const detailContainer = document.querySelector('.story-detail');
    detailContainer.innerHTML = this._createStoryDetailTemplate(story);
  }
  
  showError(message) {
    const detailContainer = document.querySelector('.story-detail');
    detailContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }
  
  hideMap() {
    document.querySelector('.map-container').style.display = 'none';
  }
  
  _createStoryDetailTemplate(story) {
    return `
      <article class="detail-content">
        <h1 class="detail-title">${story.name}</h1>
        <p class="detail-date"><i class="fas fa-calendar-alt"></i> ${showFormattedDate(story.createdAt)}</p>
        
        <div class="detail-image-container">
          <img 
            src="${story.photoUrl}" 
            alt="Story image by ${story.name}" 
            class="detail-image"
          >
        </div>
        
        <div class="author-info">
          <i class="fas fa-user"></i> 
          <span>Cerita dari  ${story.name}</span>
        </div>
        
        <div class="detail-description">
          <p>${story.description}</p>
        </div>
      </article>
    `;
  }
}
