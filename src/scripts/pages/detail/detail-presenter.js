import { getStoryDetail } from '../../data/api';

export default class DetailPresenter {
  constructor({ view, map }) {
    this.view = view;
    this.map = map;
    this.story = null;
  }
  
  async getStoryDetail(id) {
    try {
      const result = await getStoryDetail(id);
      
      if (result.error) {
        this.view.showError(result.message);
        return;
      }
      
      this.story = result.data;
      this.view.showStoryDetail(this.story);
      
      if (this.story.lat && this.story.lon) {
        this._initMap();
      } else {
        this.view.hideMap();
      }
    } catch (error) {
      this.view.showError(error.message);
    }
  }
  
  _initMap() {
    if (!this.map) return;
    
    const marker = L.marker([this.story.lat, this.story.lon]).addTo(this.map);
    
    const popupContent = `
      <div class="map-popup">
        <h3>${this.story.name}</h3>
        <p>Location: ${this.story.lat.toFixed(4)}, ${this.story.lon.toFixed(4)}</p>
      </div>
    `;
    
    marker.bindPopup(popupContent).openPopup();
    
    this.map.setView([this.story.lat, this.story.lon], 13);
  }
}