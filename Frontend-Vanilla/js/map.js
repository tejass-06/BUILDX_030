/**
 * NagarSaathi AI - Map Engine (Leaflet + OpenStreetMap)
 * Handles reverse geocoding, GPS location pickers, civic hotspot layers, and conflict overlays.
 */

class MapEngine {
  constructor(elementId, options = {}) {
    this.elementId = elementId;
    this.defaultCenter = options.center || [21.1458, 79.0882]; // Nagpur center
    this.defaultZoom = options.zoom || 13;
    this.map = null;
    this.markers = [];
    this.layers = {};
    this.currentMarker = null;

    if (typeof L !== 'undefined' && document.getElementById(elementId)) {
      this.init();
    }
  }

  init() {
    try {
      this.map = L.map(this.elementId).setView(this.defaultCenter, this.defaultZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);
    } catch (e) {
      console.warn('Leaflet map initialization skipped or failed:', e);
    }
  }

  /**
   * Setup interactive location picker with draggable marker
   */
  setupPicker(onLocationSelect) {
    if (!this.map) return;

    this.map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      this.setPickerLocation(lat, lng);
      const address = await MapEngine.reverseGeocode(lat, lng);
      if (onLocationSelect) {
        onLocationSelect({ lat, lng, address });
      }
    });
  }

  setPickerLocation(lat, lng) {
    if (!this.map) return;
    if (this.currentMarker) {
      this.currentMarker.setLatLng([lat, lng]);
    } else {
      this.currentMarker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
    }
    this.map.panTo([lat, lng]);
  }

  /**
   * Render civic complaint hotspots
   */
  renderHotspots(hotspots = []) {
    if (!this.map) return;
    this.clearMarkers();

    hotspots.forEach(item => {
      const lat = item.latitude || (item.center && item.center.lat);
      const lng = item.longitude || (item.center && item.center.lng);
      if (!lat || !lng) return;

      const count = item.count || item.complaint_count || 1;
      const category = item.category || item.problem_type || 'Civic';
      const color = MapEngine.getCategoryColor(category);

      const circle = L.circleMarker([lat, lng], {
        radius: Math.min(30, Math.max(10, count * 4)),
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.75
      }).addTo(this.map);

      circle.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong style="color: ${color};">${category}</strong><br>
          <b>Complaints:</b> ${count}<br>
          <b>Zone / Area:</b> ${item.zone_name || item.location_name || 'Nagpur'}<br>
          ${item.risk_level ? `<b>Risk:</b> <span class="badge badge-danger">${item.risk_level}</span>` : ''}
        </div>
      `);

      this.markers.push(circle);
    });

    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  /**
   * Render overlapping infrastructure work conflicts
   */
  renderWorkConflicts(conflicts = []) {
    if (!this.map) return;

    conflicts.forEach(conflict => {
      const lat = conflict.latitude;
      const lng = conflict.longitude;
      if (!lat || !lng) return;

      const circle = L.circle([lat, lng], {
        radius: conflict.radius_meters || 150,
        color: '#ef4444',
        fillColor: '#f87171',
        fillOpacity: 0.35,
        dashArray: '6, 6'
      }).addTo(this.map);

      circle.bindPopup(`
        <div style="font-family: inherit; font-size: 13px;">
          <div style="color: #ef4444; font-weight: 700; margin-bottom: 4px;">⚠️ WORK CONFLICT DETECTED</div>
          <div><b>Departments:</b> ${(conflict.departments || []).join(' vs ')}</div>
          <div><b>Location:</b> ${conflict.location || 'Nagpur'}</div>
          <div><b>Risk:</b> ${conflict.reason || 'Overlapping excavation and road work'}</div>
        </div>
      `);

      this.markers.push(circle);
    });
  }

  clearMarkers() {
    this.markers.forEach(m => {
      if (this.map) this.map.removeLayer(m);
    });
    this.markers = [];
  }

  /**
   * Free OpenStreetMap / Nominatim Reverse Geocoding with fallback
   */
  static async reverseGeocode(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(', ');
          // Return concise civic locality e.g. "Ashi Nagar, Nagpur"
          const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential || parts[0];
          const city = data.address.city || data.address.town || 'Nagpur';
          return `${neighborhood}, ${city}`;
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }

  /**
   * Category color mapping
   */
  static getCategoryColor(category = '') {
    const cat = category.toUpperCase();
    if (cat.includes('WATER') || cat.includes('LEAK')) return '#0284c7';
    if (cat.includes('POTHOLE') || cat.includes('ROAD')) return '#f59e0b';
    if (cat.includes('GARBAGE') || cat.includes('WASTE')) return '#10b981';
    if (cat.includes('DRAIN') || cat.includes('SEWER')) return '#8b5cf6';
    if (cat.includes('LIGHT') || cat.includes('ELECTRIC')) return '#ec4899';
    return '#2563eb';
  }
}

window.MapEngine = MapEngine;
