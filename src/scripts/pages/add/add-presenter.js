import { addStory } from '../../data/api';

export default class AddPresenter {
  constructor({ view, map }) {
    this.view = view;
    this.map = map;
    this.selectedLocation = null;
    this.photoFile = null;
    this.stream = null;
    
    this._initMap();
    this._initCameraControls();
    this._initFormSubmission();
  }
  
  _initMap() {
    if (!this.map) return;
    
    let marker;
    
    this.map.on('click', (e) => {
      this.selectedLocation = {
        lat: e.latlng.lat,
        lon: e.latlng.lng
      };

      this.view.updateSelectedLocation(this.selectedLocation);

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(this.map);
      }
    });
  }
  
  _initCameraControls() {
    const startCameraButton = document.getElementById('start-camera');
    const takePhotoButton = document.getElementById('take-photo');
    const retakePhotoButton = document.getElementById('retake-photo');
    const videoPreview = document.getElementById('camera-preview');
    const photoCanvas = document.getElementById('photo-canvas');
    const photoPreview = document.getElementById('photo-preview');

    startCameraButton.addEventListener('click', async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });

        videoPreview.srcObject = this.stream;
        videoPreview.style.display = 'block';
        photoPreview.style.display = 'none';

        startCameraButton.disabled = true;
        takePhotoButton.disabled = false;
        retakePhotoButton.disabled = true;
      } catch (error) {
        this.view.showError('Error accessing camera: ' + error.message);
      }
    });

    takePhotoButton.addEventListener('click', () => {
      if (!this.stream) return;

      const context = photoCanvas.getContext('2d');

      photoCanvas.width = videoPreview.videoWidth;
      photoCanvas.height = videoPreview.videoHeight;

      context.drawImage(videoPreview, 0, 0, photoCanvas.width, photoCanvas.height);

      photoCanvas.toBlob((blob) => {
        this.photoFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

        photoPreview.src = URL.createObjectURL(this.photoFile);
        photoPreview.style.display = 'block';
        videoPreview.style.display = 'none';

        takePhotoButton.disabled = true;
        retakePhotoButton.disabled = false;

        this._stopCameraStream();
      }, 'image/jpeg', 0.8);
    });

    retakePhotoButton.addEventListener('click', async () => {
      this.photoFile = null;
      photoPreview.style.display = 'none';

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });

        videoPreview.srcObject = this.stream;
        videoPreview.style.display = 'block';

        takePhotoButton.disabled = false;
        retakePhotoButton.disabled = true;
      } catch (error) {
        this.view.showError('Error accessing camera: ' + error.message);
      }
    });
  }
  
  _stopCameraStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  
  _initFormSubmission() {
    const form = document.getElementById('add-story-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!this.photoFile) {
        this.view.showError('Ups! Kamu belum mengambil foto. Yuk, ambil sekarang!');
        return;
      }

      const description = document.getElementById('description').value;

      const payload = {
        description,
        photo: this.photoFile
      };

      if (this.selectedLocation) {
        payload.lat = this.selectedLocation.lat;
        payload.lon = this.selectedLocation.lon;
      }

      this.view.showLoading('Mengirimkan cerita Anda...');

      try {
        const result = await addStory(payload);

        if (result.error) {
          this.view.showError(result.message);
        } else {
          this.view.showSuccess('Story shared successfully! 🎉');
          this.resetForm(form);
        }
      } catch (error) {
        this.view.showError('Error: ' + error.message);
      }
    });

    window.addEventListener('hashchange', () => {
      this._stopCameraStream();
    });
  }
  
  resetForm(form) {
    form.reset();
    this.photoFile = null;
    this.selectedLocation = null;
    document.getElementById('photo-preview').style.display = 'none';
    this.view.resetLocationDisplay();

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  }
}