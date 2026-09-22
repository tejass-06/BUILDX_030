/**
 * NagarSaathi AI - Report Problem Controller
 * Supports Multimodal Input: Natural Voice (Marathi/Hindi/English), Text, Photo, Geolocation/Map.
 */

document.addEventListener('DOMContentLoaded', () => {
  ReportController.init();
});

const ReportController = {
  voiceEngine: null,
  mapEngine: null,
  selectedFile: null,
  currentLocation: {
    lat: null,
    lng: null,
    address: ''
  },

  init() {
    this.setupVoice();
    this.setupPhotoUpload();
    this.setupLocationPicker();
    this.setupForm();
    this.restoreDraftIfAny();
  },

  /**
   * Voice Engine Setup with Marathi/Hindi/English recognition
   */
  setupVoice() {
    const voiceBtn = document.getElementById('btn-voice-record');
    const voiceStatus = document.getElementById('voice-status');
    const voiceWaves = document.getElementById('voice-waves');
    const descInput = document.getElementById('complaint-description');
    const voiceLangSelect = document.getElementById('voice-lang-select');

    if (!voiceBtn || !descInput) return;

    this.voiceEngine = new VoiceEngine({
      lang: voiceLangSelect ? voiceLangSelect.value : 'mr-IN',
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          const current = descInput.value.trim();
          descInput.value = current ? `${current} ${transcript}` : transcript;
          Utils.showToast('Voice converted to text', 'success');
        }
      },
      onStart: () => {
        voiceBtn.classList.add('recording');
        if (voiceStatus) voiceStatus.textContent = '🎙️ ' + Utils.t('listening');
        if (voiceWaves) voiceWaves.classList.add('active');
      },
      onEnd: () => {
        voiceBtn.classList.remove('recording');
        if (voiceStatus) voiceStatus.textContent = 'Voice input stopped.';
        if (voiceWaves) voiceWaves.classList.remove('active');
      },
      onError: (err) => {
        voiceBtn.classList.remove('recording');
        if (voiceStatus) voiceStatus.textContent = 'Voice error: ' + err;
        if (voiceWaves) voiceWaves.classList.remove('active');
        Utils.showToast('Voice error: ' + err, 'danger');
      }
    });

    voiceBtn.addEventListener('click', () => {
      if (this.voiceEngine.isRecording) {
        this.voiceEngine.stop();
      } else {
        if (voiceLangSelect) {
          this.voiceEngine.setLanguage(voiceLangSelect.value);
        }
        this.voiceEngine.start();
      }
    });

    if (voiceLangSelect) {
      voiceLangSelect.addEventListener('change', (e) => {
        this.voiceEngine.setLanguage(e.target.value);
      });
    }
  },

  /**
   * Photo Upload & Instant Preview
   */
  setupPhotoUpload() {
    const fileInput = document.getElementById('complaint-photo');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('photo-preview-img');
    const removeBtn = document.getElementById('btn-remove-photo');

    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          Utils.showToast('Image file size must be less than 10MB', 'warning');
          fileInput.value = '';
          return;
        }

        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (re) => {
          if (previewImg) previewImg.src = re.target.result;
          if (previewContainer) previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.selectedFile = null;
        if (fileInput) fileInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewImg) previewImg.src = '';
      });
    }
  },

  /**
   * Location Picker: GPS + Map + Reverse Geocoding
   */
  setupLocationPicker() {
    const gpsBtn = document.getElementById('btn-get-gps');
    const locText = document.getElementById('complaint-location-text');

    this.mapEngine = new MapEngine('location-picker-map', {
      center: [21.1458, 79.0882],
      zoom: 13
    });

    this.mapEngine.setupPicker((loc) => {
      this.currentLocation = loc;
      if (locText) {
        locText.value = loc.address;
      }
    });

    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          Utils.showToast('GPS is not supported by your browser', 'warning');
          return;
        }

        gpsBtn.disabled = true;
        gpsBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Detecting...';

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            this.mapEngine.setPickerLocation(lat, lng);
            const address = await MapEngine.reverseGeocode(lat, lng);
            this.currentLocation = { lat, lng, address };
            if (locText) locText.value = address;
            gpsBtn.disabled = false;
            gpsBtn.innerHTML = '<i data-lucide="crosshair"></i> Current GPS';
            if (window.lucide) lucide.createIcons();
            Utils.showToast('Location captured via GPS', 'success');
          },
          (err) => {
            gpsBtn.disabled = false;
            gpsBtn.innerHTML = '<i data-lucide="crosshair"></i> Current GPS';
            if (window.lucide) lucide.createIcons();
            Utils.showToast('Unable to retrieve GPS coordinates: ' + err.message, 'warning');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
  },

  /**
   * Form Submission -> Stores draft & proceeds to AI Understanding Screen
   */
  setupForm() {
    const form = document.getElementById('report-problem-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = document.getElementById('complaint-description').value.trim();
      const category = document.getElementById('complaint-category').value;
      const locationText = document.getElementById('complaint-location-text').value.trim();
      const citizenName = document.getElementById('citizen-name').value.trim();
      const citizenPhone = document.getElementById('citizen-phone').value.trim();

      if (!description) {
        Utils.showToast('Please provide a complaint description or speak using the mic', 'warning');
        return;
      }

      const draft = {
        description,
        category: category || 'OTHER',
        locationText: locationText || 'Ashi Nagar, Nagpur',
        latitude: this.currentLocation.lat || 21.1458,
        longitude: this.currentLocation.lng || 79.0882,
        citizenName: citizenName || 'Anonymous Citizen',
        citizenPhone: citizenPhone || '',
        hasPhoto: !!this.selectedFile
      };

      // Store in session storage for AI Understanding Screen
      sessionStorage.setItem('nagarsaathi_complaint_draft', JSON.stringify(draft));

      // Redirect to AI understanding analysis screen
      window.location.href = 'ai-analysis.html';
    });
  },

  restoreDraftIfAny() {
    const raw = sessionStorage.getItem('nagarsaathi_complaint_draft');
    if (!raw) return;

    try {
      const draft = JSON.parse(raw);
      if (document.getElementById('complaint-description')) {
        document.getElementById('complaint-description').value = draft.description || '';
      }
      if (document.getElementById('complaint-category') && draft.category) {
        document.getElementById('complaint-category').value = draft.category;
      }
      if (document.getElementById('complaint-location-text') && draft.locationText) {
        document.getElementById('complaint-location-text').value = draft.locationText;
      }
      if (document.getElementById('citizen-name') && draft.citizenName) {
        document.getElementById('citizen-name').value = draft.citizenName;
      }
      if (document.getElementById('citizen-phone') && draft.citizenPhone) {
        document.getElementById('citizen-phone').value = draft.citizenPhone;
      }
      if (draft.latitude && draft.longitude && this.mapEngine) {
        this.mapEngine.setPickerLocation(draft.latitude, draft.longitude);
        this.currentLocation = {
          lat: draft.latitude,
          lng: draft.longitude,
          address: draft.locationText
        };
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  }
};

window.ReportController = ReportController;
