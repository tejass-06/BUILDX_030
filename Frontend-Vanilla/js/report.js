/**
 * NagarSaathi AI - Official Citizen Problem Reporting Controller
 * Handles Multimodal Input (Voice in Marathi/Hindi/English, Photo, Automatic Location),
 * internal backend AI processing feedback, and direct ticket creation.
 */

document.addEventListener('DOMContentLoaded', () => {
  ReportController.init();
});

const ReportController = {
  voiceEngine: null,
  mapEngine: null,
  selectedPhotoFile: null,
  currentLocation: {
    lat: null,
    lng: null,
    address: '',
    source: 'MANUAL'
  },

  async init() {
    // 1. Enforce Authentication Guard
    if (typeof AuthManager !== 'undefined') {
      const isAuth = AuthManager.requireAuth(['CITIZEN']);
      if (!isAuth) return;

      // Auto-fill logged-in citizen details if available
      const user = AuthManager.getUser();
      if (user) {
        const nameInput = document.getElementById('citizen-name');
        const phoneInput = document.getElementById('citizen-phone');
        if (nameInput && (user.name || user.full_name)) nameInput.value = user.name || user.full_name;
        if (phoneInput && user.phone) phoneInput.value = user.phone;
      }
    }

    this.setupVoice();
    this.setupPhotoUpload();
    this.setupLocationPicker();
    this.setupForm();
    this.autoRequestLocation();
  },

  /**
   * Automatically requests browser GPS on page load as per official workflow.
   */
  autoRequestLocation() {
    const locText = document.getElementById('complaint-location-text');
    const locHint = document.getElementById('location-status-hint');

    if (!navigator.geolocation) {
      if (locHint) locHint.textContent = 'GPS not supported by browser. Please enter location or select on map.';
      return;
    }

    if (locHint) locHint.textContent = 'Detecting your civic location via GPS...';

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (this.mapEngine) {
          this.mapEngine.setPickerLocation(lat, lng);
        }

        try {
          const address = await MapEngine.reverseGeocode(lat, lng);
          this.currentLocation = { lat, lng, address, source: 'DEVICE_GPS' };
          if (locText) locText.value = address;
          if (locHint) {
            locHint.innerHTML = `<span style="color: var(--success); font-weight: 600;"><i data-lucide="check-circle" style="width: 14px; height: 14px; vertical-align: middle;"></i> Location detected: ${Utils.escapeHtml(address)}</span>`;
            if (window.lucide) lucide.createIcons();
          }
        } catch (e) {
          this.currentLocation = { lat, lng, address: 'Nagpur', source: 'DEVICE_GPS' };
          if (locText && !locText.value) locText.value = 'Nagpur';
        }
      },
      (err) => {
        console.log('Auto GPS permission info:', err.message);
        if (locHint) {
          locHint.textContent = 'Allow location access or pinpoint location on map below.';
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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

    if (typeof VoiceEngine === 'undefined') {
      console.warn('VoiceEngine module not loaded.');
      return;
    }

    this.voiceEngine = new VoiceEngine({
      lang: voiceLangSelect ? voiceLangSelect.value : 'mr-IN',
      onResult: (transcript, isFinal) => {
        if (isFinal && transcript) {
          const current = descInput.value.trim();
          descInput.value = current ? `${current} ${transcript}` : transcript;
          Utils.showToast('Voice converted to text', 'success');
        }
      },
      onStart: () => {
        voiceBtn.classList.add('recording');
        if (voiceStatus) voiceStatus.textContent = '🎙️ Listening... Speak naturally';
        if (voiceWaves) voiceWaves.classList.add('active');
      },
      onEnd: () => {
        voiceBtn.classList.remove('recording');
        if (voiceStatus) voiceStatus.textContent = 'Voice input ready. Click to speak again.';
        if (voiceWaves) voiceWaves.classList.remove('active');
      },
      onError: (err) => {
        voiceBtn.classList.remove('recording');
        if (voiceStatus) voiceStatus.textContent = 'Voice error: ' + err;
        if (voiceWaves) voiceWaves.classList.remove('active');
        Utils.showToast('Voice error: ' + err, 'warning');
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
        if (this.voiceEngine) {
          this.voiceEngine.setLanguage(e.target.value);
        }
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
        if (file.size > 15 * 1024 * 1024) {
          Utils.showToast('Photo size must be less than 15MB', 'warning');
          fileInput.value = '';
          return;
        }

        this.selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (re) => {
          if (previewImg) previewImg.src = re.target.result;
          if (previewContainer) previewContainer.style.display = 'block';
          Utils.showToast('Photo attached successfully', 'success');
        };
        reader.readAsDataURL(file);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.selectedPhotoFile = null;
        if (fileInput) fileInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewImg) previewImg.src = '';
      });
    }
  },

  /**
   * Location Picker: GPS Button + Map Pinpoint
   */
  setupLocationPicker() {
    const gpsBtn = document.getElementById('btn-get-gps');
    const locText = document.getElementById('complaint-location-text');
    const locHint = document.getElementById('location-status-hint');

    if (typeof MapEngine !== 'undefined' && document.getElementById('location-picker-map')) {
      this.mapEngine = new MapEngine('location-picker-map', {
        center: [21.1458, 79.0882],
        zoom: 13
      });

      this.mapEngine.setupPicker(async (loc) => {
        this.currentLocation = { ...loc, source: 'MANUAL' };
        if (locText) {
          locText.value = loc.address;
        }
        if (locHint) {
          locHint.innerHTML = `<span style="color: var(--success); font-weight: 600;"><i data-lucide="map-pin" style="width: 14px; height: 14px; vertical-align: middle;"></i> Pinned location: ${Utils.escapeHtml(loc.address)}</span>`;
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          Utils.showToast('GPS is not supported by your browser', 'warning');
          return;
        }

        gpsBtn.disabled = true;
        gpsBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Locating...';

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (this.mapEngine) {
              this.mapEngine.setPickerLocation(lat, lng);
            }
            const address = await MapEngine.reverseGeocode(lat, lng);
            this.currentLocation = { lat, lng, address, source: 'DEVICE_GPS' };
            if (locText) locText.value = address;
            if (locHint) {
              locHint.innerHTML = `<span style="color: var(--success); font-weight: 600;"><i data-lucide="check-circle" style="width: 14px; height: 14px; vertical-align: middle;"></i> Location detected: ${Utils.escapeHtml(address)}</span>`;
            }
            gpsBtn.disabled = false;
            gpsBtn.innerHTML = '<i data-lucide="crosshair"></i> Current Location';
            if (window.lucide) lucide.createIcons();
            Utils.showToast('Location captured via GPS', 'success');
          },
          (err) => {
            gpsBtn.disabled = false;
            gpsBtn.innerHTML = '<i data-lucide="crosshair"></i> Current Location';
            if (window.lucide) lucide.createIcons();
            Utils.showToast('Unable to retrieve GPS: ' + err.message, 'warning');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
  },

  /**
   * Form Submission: Direct submission to Backend with progressive feedback
   */
  setupForm() {
    const form = document.getElementById('report-problem-form');
    const reportCard = document.getElementById('report-card-container');
    const progressOverlay = document.getElementById('submit-progress-overlay');
    const progressTitle = document.getElementById('progress-status-title');
    const progressSubtitle = document.getElementById('progress-status-subtitle');
    const successCard = document.getElementById('submit-success-card');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = document.getElementById('complaint-description').value.trim();
      const category = document.getElementById('complaint-category')?.value || '';
      const locationText = document.getElementById('complaint-location-text')?.value.trim() || '';
      const citizenName = document.getElementById('citizen-name')?.value.trim() || '';
      const citizenPhone = document.getElementById('citizen-phone')?.value.trim() || '';

      if (!description) {
        Utils.showToast('Please describe the problem or use voice input', 'warning');
        return;
      }

      if (!locationText && !this.currentLocation.address) {
        Utils.showToast('Please specify or pinpoint your location', 'warning');
        return;
      }

      // Hide form card and show progressive loading states
      if (reportCard) reportCard.style.display = 'none';
      if (progressOverlay) progressOverlay.style.display = 'block';

      // Progressive status messages (Internal Backend Intelligence in flight)
      const stages = [
        { title: 'Submitting your complaint...', sub: 'Connecting to Nagpur Municipal Corporation portal...' },
        { title: 'Understanding your complaint...', sub: 'Analyzing civic issue, urgency and service levels...' },
        { title: 'Finding the responsible team...', sub: 'Routing to authoritative municipal department...' },
        { title: 'Checking for similar civic issues...', sub: 'Scanning community reports in your ward...' },
        { title: 'Assigning your complaint...', sub: 'Designating responsible ward officer...' }
      ];

      let stageIdx = 0;
      const progressTimer = setInterval(() => {
        stageIdx = (stageIdx + 1) % stages.length;
        if (progressTitle) progressTitle.textContent = stages[stageIdx].title;
        if (progressSubtitle) progressSubtitle.textContent = stages[stageIdx].sub;
      }, 900);

      try {
        const formData = new FormData();
        formData.append('title', description.length > 50 ? description.substring(0, 50) + '...' : description);
        formData.append('description', description);
        if (category) formData.append('category', category);
        formData.append('address', locationText || this.currentLocation.address || 'Nagpur');

        if (this.currentLocation.lat) formData.append('latitude', this.currentLocation.lat);
        if (this.currentLocation.lng) formData.append('longitude', this.currentLocation.lng);
        if (citizenName) formData.append('citizen_name', citizenName);
        if (citizenPhone) formData.append('citizen_phone', citizenPhone);

        if (this.selectedPhotoFile) {
          formData.append('photo', this.selectedPhotoFile);
        }

        const result = await API.createComplaint(formData);

        clearInterval(progressTimer);
        if (progressOverlay) progressOverlay.style.display = 'none';

        // Render Success Card
        if (successCard) {
          successCard.style.display = 'block';

          const ticketId = result.public_id || (result.id ? `NS-${result.id}` : 'NS-2026-CONFIRMED');
          const deptName = (result.department && result.department.name) ? result.department.name : (result.department_code || 'NMC Public Works');
          const status = result.status || 'ASSIGNED';
          const slaHours = result.sla_hours || 24;

          const ticketEl = document.getElementById('success-ticket-id');
          const deptEl = document.getElementById('success-department');
          const statusEl = document.getElementById('success-status-badge');
          const slaEl = document.getElementById('success-sla');
          const trackBtn = document.getElementById('btn-success-track');

          if (ticketEl) ticketEl.textContent = ticketId;
          if (deptEl) deptEl.textContent = deptName;
          if (statusEl) statusEl.innerHTML = Utils.getStatusBadge(status);
          if (slaEl) slaEl.textContent = `${slaHours} Hours`;
          if (trackBtn) {
            trackBtn.href = `tracking.html?id=${encodeURIComponent(result.public_id || result.id)}`;
          }

          if (window.lucide) lucide.createIcons();
          Utils.showToast('Complaint registered successfully!', 'success');
        }
      } catch (err) {
        clearInterval(progressTimer);
        if (progressOverlay) progressOverlay.style.display = 'none';
        if (reportCard) reportCard.style.display = 'block';

        console.error('Submission failed:', err);
        Utils.showToast(`Submission failed: ${err.message}`, 'danger');
      }
    });
  }
};

window.ReportController = ReportController;
