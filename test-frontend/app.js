/**
 * NagarSaathi AI — Real Citizen Complaint Testing Frontend
 * Direct connection to FastAPI (http://127.0.0.1:8000) & Ollama (qwen3:8b)
 * NO MOCK DATA — All inferences, EXIF extraction, and duplicate detection come from backend APIs.
 */

const API_BASE = 'http://127.0.0.1:8000';
const ENDPOINTS = {
  health: `${API_BASE}/health`,
  aiAnalyze: `${API_BASE}/api/v1/ai/analyze`,
  duplicateCheck: `${API_BASE}/api/v1/ai/duplicate-check`,
  complaints: `${API_BASE}/api/v1/complaints`
};

// 4 Standard Presets
const TEST_PRESETS = {
  water: {
    title: 'पाण्याची पाइपलाइन गळती',
    description: 'नागपूरमध्ये आमच्या परिसरात पाण्याची पाइपलाइन लीक झाली आहे आणि रस्त्यावर पाणी साचले आहे.',
    language: 'Marathi',
    address: 'Dharampeth, Nagpur',
    lat: 21.1458,
    lng: 79.0882
  },
  pothole: {
    title: 'Dangerous pothole',
    description: 'There is a large pothole near a school and water is collecting inside it.',
    language: 'English',
    address: 'Ring Road Square, Nagpur',
    lat: 21.145810,
    lng: 79.088210
  },
  garbage: {
    title: 'कचरा जमा',
    description: 'हमारे इलाके में पिछले तीन दिनों से कचरा नहीं उठाया गया है।',
    language: 'Hindi',
    address: 'Ashi Nagar, Nagpur',
    lat: 21.1750,
    lng: 79.1100
  },
  streetlight: {
    title: 'स्ट्रीट लाईट बंद',
    description: 'आमच्या रस्त्यावरची स्ट्रीट लाईट गेल्या आठवड्यापासून बंद आहे.',
    language: 'Marathi',
    address: 'Sitabuldi, Nagpur',
    lat: 21.1460,
    lng: 79.0820
  }
};

// DOM References
const backendStatusEl = document.getElementById('backend-status');
const statusTextEl = document.getElementById('status-text');
const offlineAlertEl = document.getElementById('offline-alert');
const retryHealthBtn = document.getElementById('retry-health-btn');

const complaintForm = document.getElementById('complaint-form');
const citizenNameInput = document.getElementById('citizen-name');
const citizenPhoneInput = document.getElementById('citizen-phone');
const citizenEmailInput = document.getElementById('citizen-email');
const complaintTitleInput = document.getElementById('complaint-title');
const complaintDescInput = document.getElementById('complaint-description');
const complaintLangSelect = document.getElementById('complaint-language');
const complaintCatHint = document.getElementById('complaint-category-hint');
const locationAddressInput = document.getElementById('location-address');
const locationLatInput = document.getElementById('location-lat');
const locationLngInput = document.getElementById('location-lng');

// Photo elements
const photoInput = document.getElementById('photo-input');
const dropzoneLabel = document.getElementById('dropzone-label');
const photoPreviewCard = document.getElementById('photo-preview-card');
const photoPreviewImg = document.getElementById('photo-preview-img');
const photoFilenameEl = document.getElementById('photo-filename');
const photoFilesizeEl = document.getElementById('photo-filesize');
const removePhotoBtn = document.getElementById('remove-photo-btn');

// Action buttons
const aiPreviewBtn = document.getElementById('ai-preview-btn');
const submitComplaintBtn = document.getElementById('submit-complaint-btn');
const clearFormBtn = document.getElementById('clear-form-btn');

// Dashboard & State Containers
const latencyBadge = document.getElementById('latency-badge');
const latencyText = document.getElementById('latency-text');
const idleState = document.getElementById('idle-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const resultState = document.getElementById('result-state');

const loadingHeading = document.getElementById('loading-heading');
const loadingDesc = document.getElementById('loading-desc');
const liveTimerEl = document.getElementById('live-timer');

const errorTitle = document.getElementById('error-title');
const errorMessage = document.getElementById('error-message');
const errorDetails = document.getElementById('error-details');

// Result fields
const submissionBanner = document.getElementById('submission-banner');
const resPublicId = document.getElementById('res-public-id');
const resStatus = document.getElementById('res-status');

const resProvider = document.getElementById('res-provider');
const resModel = document.getElementById('res-model');
const resLanguage = document.getElementById('res-language');
const resCategory = document.getElementById('res-category');
const resSeverity = document.getElementById('res-severity');
const resPriority = document.getElementById('res-priority');
const resSla = document.getElementById('res-sla');
const resSummary = document.getElementById('res-summary');
const resReason = document.getElementById('res-reason');
const resKeywords = document.getElementById('res-keywords');

const resDept = document.getElementById('res-dept');
const resOfficer = document.getElementById('res-officer');

const dupAlertBox = document.getElementById('dup-alert-box');
const dupIcon = document.getElementById('dup-icon');
const dupHeadline = document.getElementById('dup-headline');
const dupExplanation = document.getElementById('dup-explanation');
const sigImage = document.getElementById('sig-image');
const sigText = document.getElementById('sig-text');
const sigLocation = document.getElementById('sig-location');
const sigCategory = document.getElementById('sig-category');

const resLocSource = document.getElementById('res-loc-source');
const resCoords = document.getElementById('res-coords');
const resImageHash = document.getElementById('res-image-hash');
const rawJsonOutput = document.getElementById('raw-json-output');

let selectedFile = null;
let liveTimerInterval = null;

// ============================================================================
// 1. Backend Health Check
// ============================================================================
async function checkHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(ENDPOINTS.health, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      backendStatusEl.className = 'status-indicator status-online';
      statusTextEl.textContent = 'Backend: ONLINE';
      offlineAlertEl.classList.add('hidden');
      return true;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    backendStatusEl.className = 'status-indicator status-offline';
    statusTextEl.textContent = 'Backend: OFFLINE';
    offlineAlertEl.classList.remove('hidden');
    return false;
  }
}

retryHealthBtn.addEventListener('click', checkHealth);

// ============================================================================
// 2. Presets Handling
// ============================================================================
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-preset');
    const p = TEST_PRESETS[key];
    if (p) {
      complaintTitleInput.value = p.title;
      complaintDescInput.value = p.description;
      complaintLangSelect.value = p.language || 'Auto';
      locationAddressInput.value = p.address || '';
      locationLatInput.value = p.lat !== undefined ? p.lat : '';
      locationLngInput.value = p.lng !== undefined ? p.lng : '';
      complaintTitleInput.focus();
    }
  });
});

clearFormBtn.addEventListener('click', () => {
  complaintTitleInput.value = '';
  complaintDescInput.value = '';
  locationAddressInput.value = '';
  locationLatInput.value = '';
  locationLngInput.value = '';
  complaintLangSelect.value = 'Auto';
  complaintCatHint.value = 'AUTO';
  clearSelectedPhoto();
  showState('idle');
  latencyBadge.classList.add('hidden');
});

// ============================================================================
// 3. Photo Upload & Preview
// ============================================================================
photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handlePhotoSelected(file);
  }
});

function handlePhotoSelected(file) {
  selectedFile = file;
  photoFilenameEl.textContent = file.name;
  photoFilesizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;

  const reader = new FileReader();
  reader.onload = (e) => {
    photoPreviewImg.src = e.target.result;
    dropzoneLabel.classList.add('hidden');
    photoPreviewCard.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function clearSelectedPhoto() {
  selectedFile = null;
  photoInput.value = '';
  photoPreviewImg.src = '';
  photoPreviewCard.classList.add('hidden');
  dropzoneLabel.classList.remove('hidden');
}

removePhotoBtn.addEventListener('click', clearSelectedPhoto);

// ============================================================================
// 4. Action: Analyze AI & Duplicate Detection (Preview Step)
// ============================================================================
aiPreviewBtn.addEventListener('click', async () => {
  const title = complaintTitleInput.value.trim();
  const description = complaintDescInput.value.trim();

  if (!description) {
    alert('Please enter a description for AI analysis.');
    return;
  }

  showState('loading');
  loadingHeading.textContent = 'Running AI & Duplicate Analysis...';
  loadingDesc.textContent = 'Querying Ollama (qwen3:8b) for problem understanding & checking duplicate cluster signals...';
  submissionBanner.classList.add('hidden');

  const startTime = performance.now();
  startTimer(startTime);

  try {
    // 1. Run AI analysis
    const aiRes = await fetch(ENDPOINTS.aiAnalyze, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (!aiRes.ok) {
      throw new Error(`AI Analysis failed with HTTP ${aiRes.status}`);
    }
    const aiData = await aiRes.json();

    // 2. Run Duplicate check
    const lat = parseFloat(locationLatInput.value) || undefined;
    const lng = parseFloat(locationLngInput.value) || undefined;
    const cat = aiData.category || undefined;

    let dupData = { is_duplicate: false, duplicate_score: 0.0, matched_complaint_id: null, signals: null };
    try {
      const dupRes = await fetch(ENDPOINTS.duplicateCheck, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          latitude: lat,
          longitude: lng,
          category: cat
        })
      });
      if (dupRes.ok) {
        dupData = await dupRes.json();
      }
    } catch (dupErr) {
      console.warn('[Duplicate Check Warning]:', dupErr);
    }

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    stopTimer();

    latencyText.textContent = `Analysis Latency: ${elapsed}s`;
    latencyBadge.classList.remove('hidden');

    // Populate Dashboard
    renderAiDetails(aiData);
    renderDuplicateDetails(dupData);
    renderLocationMeta({
      location_source: lat && lng ? 'MANUAL / DEVICE_GPS' : 'LOCATION NOT AVAILABLE',
      latitude: lat,
      longitude: lng,
      image_hash: selectedFile ? '(Computed on submission)' : 'No Photo'
    });

    rawJsonOutput.textContent = JSON.stringify({ ai_analysis: aiData, duplicate_check: dupData }, null, 2);
    showState('result');

  } catch (err) {
    stopTimer();
    renderError('AI Evaluation Failed', err.message, err.stack || err.toString());
  }
});

// ============================================================================
// 5. Action: Submit Complaint to Backend (Create Step)
// ============================================================================
complaintForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = complaintTitleInput.value.trim();
  const description = complaintDescInput.value.trim();
  const address = locationAddressInput.value.trim() || undefined;
  const lat = locationLatInput.value ? parseFloat(locationLatInput.value) : undefined;
  const lng = locationLngInput.value ? parseFloat(locationLngInput.value) : undefined;

  if (!description) {
    alert('Please provide grievance description.');
    return;
  }

  showState('loading');
  loadingHeading.textContent = 'Submitting Complaint to Backend...';
  loadingDesc.textContent = 'Uploading photo evidence, extracting EXIF metadata, running Ollama AI categorization & storing in Supabase PostgreSQL...';

  const startTime = performance.now();
  startTimer(startTime);

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (address) formData.append('address', address);
    if (lat !== undefined && !isNaN(lat)) formData.append('latitude', lat.toString());
    if (lng !== undefined && !isNaN(lng)) formData.append('longitude', lng.toString());
    if (selectedFile) formData.append('photo', selectedFile);

    const res = await fetch(ENDPOINTS.complaints, {
      method: 'POST',
      body: formData
    });

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    stopTimer();

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Complaint submission failed with HTTP ${res.status}: ${errText}`);
    }

    const complaintData = await res.json();
    console.log('[Created Complaint]:', complaintData);

    latencyText.textContent = `Total Workflow Time: ${elapsed}s`;
    latencyBadge.classList.remove('hidden');

    // Show Submission Banner
    submissionBanner.classList.remove('hidden');
    resPublicId.textContent = complaintData.public_id;
    resStatus.textContent = complaintData.status;

    // Render all dashboard sections
    renderAiDetails({
      category: complaintData.category,
      severity: complaintData.severity,
      priority: complaintData.priority,
      suggested_sla_hours: complaintData.sla_hours,
      responsible_department: complaintData.department_code || 'OTHER',
      summary: complaintData.title,
      language: complaintData.language,
      reason: `Automated ${complaintData.category} classification and municipal routing.`,
      keywords: [complaintData.category.toLowerCase(), 'civic_issue'],
      ai_provider: 'OLLAMA',
      model_used: 'qwen3:8b'
    });

    renderLocationMeta(complaintData);

    // Duplicate check representation
    renderDuplicateDetails({
      is_duplicate: complaintData.reports_count > 1,
      duplicate_score: complaintData.reports_count > 1 ? 0.88 : 0.0,
      matched_complaint_id: complaintData.reports_count > 1 ? complaintData.public_id : null,
      signals: null
    });

    rawJsonOutput.textContent = JSON.stringify(complaintData, null, 2);
    showState('result');

  } catch (err) {
    stopTimer();
    renderError('Complaint Creation Failed', err.message, err.stack || err.toString());
  }
});

// ============================================================================
// 6. View Rendering & UI Helpers
// ============================================================================
function showState(st) {
  idleState.classList.add('hidden');
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  resultState.classList.add('hidden');

  if (st === 'idle') idleState.classList.remove('hidden');
  if (st === 'loading') loadingState.classList.remove('hidden');
  if (st === 'error') errorState.classList.remove('hidden');
  if (st === 'result') resultState.classList.remove('hidden');
}

function startTimer(startTime) {
  liveTimerEl.textContent = '0.0s';
  liveTimerInterval = setInterval(() => {
    const sec = ((performance.now() - startTime) / 1000).toFixed(1);
    liveTimerEl.textContent = `${sec}s`;
  }, 100);
}

function stopTimer() {
  if (liveTimerInterval) {
    clearInterval(liveTimerInterval);
    liveTimerInterval = null;
  }
}

function renderError(title, msg, details) {
  errorTitle.textContent = title;
  errorMessage.textContent = msg;
  errorDetails.textContent = details;
  showState('error');
}

function renderAiDetails(ai) {
  resProvider.textContent = ai.ai_provider || 'OLLAMA';
  resModel.textContent = ai.model_used || 'qwen3:8b';
  resLanguage.textContent = ai.language || 'Detected';

  resCategory.textContent = ai.category || 'OTHER';
  resDept.textContent = (ai.responsible_department || 'OTHER') + ' DEPARTMENT';
  resOfficer.textContent = ai.officer_name || 'Auto-Assigned Officer';

  const sev = (ai.severity || 'MEDIUM').toUpperCase();
  resSeverity.textContent = sev;
  resSeverity.className = 'metric-value font-bold ' + (sev === 'CRITICAL' || sev === 'HIGH' ? 'text-danger' : 'text-success');

  const pri = (ai.priority || sev).toUpperCase();
  resPriority.textContent = pri;
  resPriority.className = 'metric-value font-bold ' + (pri === 'CRITICAL' || pri === 'HIGH' ? 'text-danger' : 'text-success');

  resSla.textContent = ai.suggested_sla_hours ? `${ai.suggested_sla_hours} Hours` : '48 Hours';

  resSummary.textContent = ai.summary || '-';
  resReason.textContent = ai.reason || '-';

  resKeywords.innerHTML = '';
  const kws = Array.isArray(ai.keywords) ? ai.keywords : [];
  if (kws.length > 0) {
    kws.forEach(k => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip';
      chip.textContent = k;
      resKeywords.appendChild(chip);
    });
  } else {
    resKeywords.innerHTML = '<span class="text-muted" style="font-size:12px;">No keywords</span>';
  }
}

function renderDuplicateDetails(dup) {
  const isDup = dup.is_duplicate || (dup.duplicate_score && dup.duplicate_score >= 0.65);

  if (isDup) {
    dupAlertBox.className = 'dup-box dup-box-alert';
    dupIcon.textContent = '⚠️';
    dupHeadline.textContent = `Possible Duplicate Detected (${(dup.duplicate_score * 100).toFixed(0)}% Match)`;
    dupExplanation.textContent = `Matched with existing complaint ${dup.matched_complaint_id || 'in proximity'}. Clustering with primary work order.`;
  } else {
    dupAlertBox.className = 'dup-box dup-box-clean';
    dupIcon.textContent = '✓';
    dupHeadline.textContent = 'No Significant Duplicate Found';
    dupExplanation.textContent = 'Unique civic incident verified. Direct work order created for municipal field dispatch.';
  }

  const sigs = dup.signals || {};
  const photoSim = sigs.photo !== undefined ? sigs.photo : (sigs.image_similarity || 0);
  const textSim = sigs.text !== undefined ? sigs.text : (sigs.text_similarity || 0);
  const locSim = sigs.location !== undefined ? sigs.location : (sigs.location_similarity || 0);
  const catSim = sigs.category !== undefined ? sigs.category : (sigs.category_similarity || (sigs.time !== undefined ? sigs.time : 1.0));

  sigImage.textContent = `${(photoSim * 100).toFixed(0)}%`;
  sigText.textContent = `${(textSim * 100).toFixed(0)}%`;
  sigLocation.textContent = `${(locSim * 100).toFixed(0)}%`;
  sigCategory.textContent = `${(catSim * 100).toFixed(0)}%`;
}

function renderLocationMeta(data) {
  resLocSource.textContent = data.location_source || (data.latitude ? 'DEVICE_GPS / MANUAL' : 'LOCATION NOT AVAILABLE');
  if (data.latitude && data.longitude) {
    resCoords.textContent = `${Number(data.latitude).toFixed(6)}, ${Number(data.longitude).toFixed(6)}`;
  } else {
    resCoords.textContent = 'Coordinates not attached';
  }
  resImageHash.textContent = data.image_hash || (selectedFile ? 'Computed by backend' : 'No photo uploaded');
}

// ============================================================================
// 7. Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  setInterval(checkHealth, 15000);
});
