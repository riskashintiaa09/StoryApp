import { getStories } from '../../data/api';

export default class HomePresenter {
  constructor({ view, map }) {
    this.view = view;
    this.map = map;
    this.stories = [];
  }
  
  async getStories() {
    try {
      const result = await getStories();
      
      if (result.error) {
        this.view.showError(result.message);
        return;
      }
      
      this.stories = result.data;
      
      if (this.stories.length === 0) {
        this.view.showEmpty();
        return;
      }
      
      this.view.showStories(this.stories);
      
      if (this.map) {
        this._addMarkers();
      }
    } catch (error) {
      this.view.showError(error.message);
    }
  }
  
  _addMarkers() {
    const storiesWithLocation = this.stories.filter(
      story => story.lat && story.lon
    );
    
    if (storiesWithLocation.length > 0) {
      storiesWithLocation.forEach(story => {
        const popupContent = `
          <div class="map-popup">
            <h3>${story.name}</h3>
            <p>${this._truncateText(story.description, 100)}</p>
            <a href="#/detail/${story.id}" class="popup-link">View Story</a>
          </div>
        `;
 
        L.marker([story.lat, story.lon])
          .addTo(this.map)
          .bindPopup(popupContent);
      });
      
      const bounds = L.latLngBounds(storiesWithLocation.map(story => [story.lat, story.lon]));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
  
  _truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}