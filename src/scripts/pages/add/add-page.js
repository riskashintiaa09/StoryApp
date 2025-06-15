import { initMap } from '../../utils/map';
import AddPresenter from './add-presenter';

export default class AddPage {
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
       
            
          </a>
        </div>

       <div class="add-story-wrapper">
    <h1 id="content" tabindex="0">Tambah Cerita Baru</h1>
    </div>
        <form id="add-story-form" class="story-form">    
          <div class="form-group">
            <label for="description">Cerita Anda</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              placeholder="Ceritakan pengalaman atau cerita menarik Anda"
              rows="5"
              aria-required="true"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Ambil Foto</label>
            <div class="camera-container">
              <div class="camera-preview-container">
                <video id="camera-preview" class="camera-preview" autoplay></video>
                <canvas id="photo-canvas" class="photo-canvas" style="display: none;"></canvas>
                <img id="photo-preview" class="photo-preview" alt="Your photo will appear here" style="display: none;">
              </div>

              <div class="camera-controls">
                <button type="button" id="start-camera" class="btn btn-secondary">
                  <i class="fas fa-camera"></i> Mulai Kamera
                </button>
                <button type="button" id="take-photo" class="btn btn-secondary" disabled>
                  <i class="fas fa-camera-retro"></i> Ambil Foto
                </button>
                <button type="button" id="retake-photo" class="btn btn-secondary" disabled>
                  <i class="fas fa-redo"></i> Ambil Ulang
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Pilih Lokasi</label>
            <div id="add-map" class="map"></div>
            <div id="selected-location" class="selected-location">
             Klik pada peta untuk menentukan lokasi cerita Anda
            </div>
          </div>

          <div class="form-group">
            <button type="submit" id="submit-button" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> Bagikan Cerita
            </button>
          </div>
        </form>

        <div id="submission-status" class="submission-status"></div>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();
    this._initPresenter();
  }

  _initMap() {
    const mapContainer = document.getElementById('add-map');
    if (!mapContainer) return;

    this.map = initMap('add-map');
  }
  
  _initPresenter() {
    this.presenter = new AddPresenter({
      view: this,
      map: this.map
    });
  }
  
  updateSelectedLocation(location) {
    document.getElementById('selected-location').innerHTML = `
      Selected: ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}
    `;
  }
  
  resetLocationDisplay() {
    document.getElementById('selected-location').innerHTML = 'Tidak ada lokasi yang dipilih';
  }

  showError(message) {
    const statusContainer = document.getElementById('submission-status');
    statusContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }

  showLoading(message) {
    const statusContainer = document.getElementById('submission-status');
    statusContainer.innerHTML = `<div class="loading-indicator">${message}</div>`;
  }

  showSuccess(message) {
    const statusContainer = document.getElementById('submission-status');
    statusContainer.innerHTML = `<div class="success-message">
      ${message} <a href="#/">See all stories 👀📖</a>
    </div>`;
  }
}