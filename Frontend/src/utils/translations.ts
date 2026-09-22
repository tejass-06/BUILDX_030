import { SupportedLanguage } from '../types';

export interface TranslationDictionary {
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  reportProblemBtn: string;
  myComplaintsBtn: string;
  quickActionsTitle: string;
  quickReport: string;
  quickComplaints: string;
  quickCityMap: string;
  civicSummaryTitle: string;
  activeComplaintsLabel: string;
  inProgressLabel: string;
  resolvedLabel: string;
  recentComplaintsTitle: string;
  viewAllComplaints: string;
  noComplaintsTitle: string;
  noComplaintsDesc: string;
  cityAwarenessTitle: string;
  cityAwarenessSubtitle: string;
  waterIssues: string;
  roadIssues: string;
  garbageIssues: string;
  lightingIssues: string;
  exploreMapBtn: string;
  mapModalTitle: string;
  mapModalDesc: string;
  closeBtn: string;

  // Phase 3 Intelligence Flow keys
  reportHeading: string;
  reportSubheading: string;
  descriptionLabel: string;
  useVoiceBtn: string;
  listeningState: string;
  addPhotoBtn: string;
  photoAdded: string;
  locationLabel: string;
  useCurrentLocationBtn: string;
  continueBtn: string;

  aiUnderstandingHeading: string;
  aiUnderstandingSubheading: string;
  aiDiagnosticTitle: string;
  problemLabel: string;
  categoryLabel: string;
  severityLabel: string;
  confidenceLabel: string;
  originalReportLabel: string;
  aiDisclaimer: string;

  responsibleAuthorityHeading: string;
  departmentLabel: string;
  zoneLabel: string;
  slaLabel: string;
  routingConfidenceLabel: string;
  responsibleSubtext: string;
  checkSimilarBtn: string;
  editReportBtn: string;

  similarReportsHeading: string;
  similarReportsSubheading: string;
  clusterBadge: string;
  whyDuplicateHeading: string;
  reason1: string;
  reason2: string;
  reason3: string;
  joinExistingBtn: string;
  reportSeparatelyBtn: string;

  complaintSubmittedTitle: string;
  viewComplaintBtn: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    tagline: 'Smarter Citizens. Cleaner Cities. A Better Nagpur.',
    heroTitle: 'Report a Civic Problem',
    heroSubtitle:
      'Tell us what’s wrong in your area. NagarSaathi identifies the problem and routes it instantly to Orange City Water, NMC Roads, or PWD.',
    reportProblemBtn: 'Report a Problem',
    myComplaintsBtn: 'My Complaints',
    quickActionsTitle: 'Quick Actions',
    quickReport: 'Report Problem',
    quickComplaints: 'My Complaints',
    quickCityMap: 'Nagpur City Map',
    civicSummaryTitle: 'My Civic Overview',
    activeComplaintsLabel: 'Active Complaints',
    inProgressLabel: 'In Progress',
    resolvedLabel: 'Resolved',
    recentComplaintsTitle: 'My Active Complaints',
    viewAllComplaints: 'View All',
    noComplaintsTitle: 'No complaints yet',
    noComplaintsDesc: 'Report your first civic problem and track it here in real time.',
    cityAwarenessTitle: "What's happening around Nagpur?",
    cityAwarenessSubtitle:
      'Live civic workload and maintenance activity across Nagpur Municipal Corporation zones.',
    waterIssues: 'Water Distribution',
    roadIssues: 'Roads & Potholes',
    garbageIssues: 'Waste & Sanitation',
    lightingIssues: 'Street Lighting',
    exploreMapBtn: 'Explore Civic Map',
    mapModalTitle: 'Nagpur Civic Intelligence Map',
    mapModalDesc:
      'Interactive geospatial view of active civic work orders, pipeline maintenance, and road repairs across Nagpur wards.',
    closeBtn: 'Close',

    // Phase 3
    reportHeading: 'Report a Civic Problem',
    reportSubheading:
      "Tell NagarSaathi what is happening in your area. We'll understand the issue and route it to the right authority.",
    descriptionLabel: 'Problem Description',
    useVoiceBtn: 'Use Voice',
    listeningState: 'Listening...',
    addPhotoBtn: 'Add Photo Evidence',
    photoAdded: 'Photo Evidence Attached',
    locationLabel: 'Incident Location',
    useCurrentLocationBtn: 'Use Current Location',
    continueBtn: 'Continue to AI Analysis',

    aiUnderstandingHeading: 'AI-Assisted Problem Understanding',
    aiUnderstandingSubheading:
      'Multimodal intelligence analyzing your description and photo evidence to determine civic jurisdiction.',
    aiDiagnosticTitle: 'AI Analysis Breakdown',
    problemLabel: 'Identified Problem',
    categoryLabel: 'Civic Category',
    severityLabel: 'Urgency Severity',
    confidenceLabel: 'AI Confidence Score',
    originalReportLabel: 'Your Reported Text',
    aiDisclaimer:
      'AI assistance helps structure your report and identify the likely civic responsibility across Nagpur agencies.',

    responsibleAuthorityHeading: 'Responsible Civic Authority',
    departmentLabel: 'Assigned Department',
    zoneLabel: 'Jurisdiction Zone',
    slaLabel: 'Target Resolution SLA',
    routingConfidenceLabel: 'Routing Confidence',
    responsibleSubtext:
      'Based on the reported issue and location, NagarSaathi routes this problem to Orange City Water.',
    checkSimilarBtn: 'Check Similar Reports',
    editReportBtn: 'Edit Report',

    similarReportsHeading: 'Similar civic problems nearby',
    similarReportsSubheading:
      'NagarSaathi found reports describing a similar problem in your area.',
    clusterBadge: 'Duplicate Cluster Detected',
    whyDuplicateHeading: 'Why this is considered related:',
    reason1: 'Similar problem: Clean potable water pipeline rupture',
    reason2: 'Nearby location: Within 150m of Kapil Nagar Community Hall',
    reason3: 'Similar time period: Reported in past 24 hours',
    joinExistingBtn: 'Join Existing Issue',
    reportSeparatelyBtn: 'Report Separately',

    complaintSubmittedTitle: 'Complaint Submitted Successfully',
    viewComplaintBtn: 'View Complaint',
  },
  mr: {
    tagline: 'हुशार नागरिक. स्वच्छ शहर. सुंदर नागपूर.',
    heroTitle: 'नागरी समस्या नोंदवा',
    heroSubtitle:
      'आपल्या भागातील नागरी समस्यांची माहिती द्या. नगरसाथी ती त्वरित संबंधित महापालिका किंवा ऑरेंज सिटी वॉटर विभागाकडे वर्ग करेल.',
    reportProblemBtn: 'समस्या नोंदवा',
    myComplaintsBtn: 'माझ्या तक्रारी',
    quickActionsTitle: 'जलद कृती',
    quickReport: 'समस्या नोंदवा',
    quickComplaints: 'माझ्या तक्रारी',
    quickCityMap: 'नागपूर शहर नकाशा',
    civicSummaryTitle: 'माझा नागरी आढावा',
    activeComplaintsLabel: 'सक्रिय तक्रारी',
    inProgressLabel: 'काम प्रगतीपथावर',
    resolvedLabel: 'निवारण झाले',
    recentComplaintsTitle: 'माझ्या सक्रिय तक्रारी',
    viewAllComplaints: 'सर्व पहा',
    noComplaintsTitle: 'अद्याप कोणतीही तक्रार नाही',
    noComplaintsDesc: 'आपली पहिली नागरी समस्या नोंदवा आणि येथे थेट मागोवा घ्या.',
    cityAwarenessTitle: 'नागपुरात सध्या काय सुरू आहे?',
    cityAwarenessSubtitle:
      'नागपूर महानगरपालिका क्षेत्रातील थेट नागरी कामांचा व दुरुस्तीचा आढावा.',
    waterIssues: 'पाणी पुरवठा',
    roadIssues: 'रस्ते व खड्डे',
    garbageIssues: 'कचरा व स्वच्छता',
    lightingIssues: 'रस्त्यावरील दिवे',
    exploreMapBtn: 'शहर नकाशा पहा',
    mapModalTitle: 'नागपूर नागरी बुद्धिमत्ता नकाशा',
    mapModalDesc:
      'नागपूर शहरातील सक्रिय समस्या आणि महापालिकेच्या दुरुस्ती कामांचा नकाशा.',
    closeBtn: 'बंद करा',

    // Phase 3
    reportHeading: 'नागरी समस्या नोंदवा',
    reportSubheading:
      'आपल्या परिसरातील समस्येची माहिती द्या. नगरसाथी त्याचे विश्लेषण करून योग्य प्राधिकरणाकडे पाठवेल.',
    descriptionLabel: 'समस्येचे वर्णन',
    useVoiceBtn: 'आवाज वापरा',
    listeningState: 'ऐकत आहे...',
    addPhotoBtn: 'फोटो जोडा',
    photoAdded: 'फोटो जोडला गेला',
    locationLabel: 'घटनास्थळ',
    useCurrentLocationBtn: 'माझे चालू ठिकाण वापरा',
    continueBtn: 'AI विश्लेषणासाठी पुढे जा',

    aiUnderstandingHeading: 'AI-सहाय्यित समस्या विश्लेषण',
    aiUnderstandingSubheading:
      'आपल्या वर्णनावरून व फोटोवरून जबाबदार विभागाची निश्चिती.',
    aiDiagnosticTitle: 'AI विश्लेषण तपशील',
    problemLabel: 'ओळखलेली समस्या',
    categoryLabel: 'नागरी प्रवर्ग',
    severityLabel: 'गंभीरता',
    confidenceLabel: 'विश्वासार्हता',
    originalReportLabel: 'आपले मूळ वर्णन',
    aiDisclaimer:
      'AI प्रणाली आपल्या समस्येचे वर्गीकरण करून योग्य विभागाकडे पोहोचवण्यास मदत करते.',

    responsibleAuthorityHeading: 'जबाबदार नागरी प्राधिकरण',
    departmentLabel: 'संबंधित विभाग',
    zoneLabel: 'प्रभाग / झोन',
    slaLabel: 'निवारण मुदत (SLA)',
    routingConfidenceLabel: 'मार्गक्रमण खात्री',
    responsibleSubtext:
      'समस्या व ठिकाणानुसार ही तक्रार ऑरेंज सिटी वॉटर विभागाकडे पाठवली जात आहे.',
    checkSimilarBtn: 'समान तक्रारी तपासा',
    editReportBtn: 'तक्रार संपादित करा',

    similarReportsHeading: 'परिसरातील समान नागरी समस्या',
    similarReportsSubheading:
      'नगरसाथीला आपल्या परिसरात याच प्रकारच्या तक्रारी आढळल्या आहेत.',
    clusterBadge: 'समान तक्रार समूह आढळला',
    whyDuplicateHeading: 'ही तक्रार संबंधित का मानली आहे:',
    reason1: 'समान समस्या: पिण्याच्या पाण्याची मुख्य लाईन फुटली आहे',
    reason2: 'जवळचे ठिकाण: कपिल नगर कम्युनिटी हॉलपासून १५० मीटर अंतरावर',
    reason3: 'समान कालावधी: मागील २४ तासांत नोंदवलेली तक्रार',
    joinExistingBtn: 'सध्याच्या तक्रारीत सामील व्हा',
    reportSeparatelyBtn: 'स्वतंत्र तक्रार नोंदवा',

    complaintSubmittedTitle: 'तक्रार यशस्वीरित्या नोंदवली गेली',
    viewComplaintBtn: 'तक्रार पहा',
  },
  hi: {
    tagline: 'स्मार्ट नागरिक. स्वच्छ शहर. बेहतर नागपुर.',
    heroTitle: 'नागरिक समस्या दर्ज करें',
    heroSubtitle:
      'अपने क्षेत्र की समस्या बताएं। नगरसाथी तुरंत समस्या की पहचान कर संबंधित विभाग (OCW, NMC Roads, PWD) को भेजेगा।',
    reportProblemBtn: 'समस्या दर्ज करें',
    myComplaintsBtn: 'मेरी शिकायतें',
    quickActionsTitle: 'त्वरित सेवाएं',
    quickReport: 'समस्या दर्ज करें',
    quickComplaints: 'मेरी शिकायतें',
    quickCityMap: 'नागपुर शहर मानचित्र',
    civicSummaryTitle: 'मेरा नागरिक विवरण',
    activeComplaintsLabel: 'सक्रिय शिकायतें',
    inProgressLabel: 'प्रगति पर',
    resolvedLabel: 'समाधान हुआ',
    recentComplaintsTitle: 'मेरी सक्रिय शिकायतें',
    viewAllComplaints: 'सभी देखें',
    noComplaintsTitle: 'अभी तक कोई शिकायत नहीं',
    noComplaintsDesc: 'अपनी पहली नागरिक समस्या दर्ज करें और यहाँ ट्रैक करें।',
    cityAwarenessTitle: 'नागपुर में क्या हो रहा है?',
    cityAwarenessSubtitle:
      'नागपुर नगर निगम क्षेत्रों में चल रहे नागरिक कार्यों और रखरखाव की लाइव स्थिति।',
    waterIssues: 'जल वितरण',
    roadIssues: 'सड़क एवं गड्ढे',
    garbageIssues: 'कचरा एवं स्वच्छता',
    lightingIssues: 'स्ट्रीट लाइट',
    exploreMapBtn: 'नागरिक मानचित्र देखें',
    mapModalTitle: 'नागपुर नागरिक मानचित्र',
    mapModalDesc:
      'नागपुर के विभिन्न वार्डों में सक्रिय नागरिक शिकायतों और मरम्मत कार्यों का मानचित्र।',
    closeBtn: 'बंद करें',

    // Phase 3
    reportHeading: 'नागरिक समस्या दर्ज करें',
    reportSubheading:
      'अपने क्षेत्र की समस्या बताएं। नगरसाथी समस्या को समझकर सही विभाग तक पहुंचाएगा।',
    descriptionLabel: 'समस्या का विवरण',
    useVoiceBtn: 'आवाज का उपयोग करें',
    listeningState: 'सुन रहा है...',
    addPhotoBtn: 'फोटो साक्ष्य जोड़ें',
    photoAdded: 'फोटो साक्ष्य संलग्न',
    locationLabel: 'घटना स्थल',
    useCurrentLocationBtn: 'वर्तमान स्थान चुनें',
    continueBtn: 'AI विश्लेषण के लिए आगे बढ़ें',

    aiUnderstandingHeading: 'AI-सहायक समस्या समझ',
    aiUnderstandingSubheading:
      'आपके विवरण और साक्ष्य का विश्लेषण कर जिम्मेदार विभाग तय किया जा रहा है।',
    aiDiagnosticTitle: 'AI विश्लेषण सारांश',
    problemLabel: 'चिह्नित समस्या',
    categoryLabel: 'नागरिक श्रेणी',
    severityLabel: 'गंभीरता',
    confidenceLabel: 'सटीकता स्कोर',
    originalReportLabel: 'आपका दर्ज विवरण',
    aiDisclaimer:
      'AI सहायता आपकी रिपोर्ट को संरचित करने और संबंधित नागपुर विभाग की पहचान करने में मदद करती है।',

    responsibleAuthorityHeading: 'जिम्मेदार नागरिक प्राधिकरण',
    departmentLabel: 'संबंधित विभाग',
    zoneLabel: 'कार्यक्षेत्र जोन',
    slaLabel: 'समाधान समयसीमा (SLA)',
    routingConfidenceLabel: 'रूटिंग सटीकता',
    responsibleSubtext:
      'दर्ज विवरण व स्थान के आधार पर नगरसाथी इसे ऑरेंज सिटी वाटर को भेज रहा है।',
    checkSimilarBtn: 'समान शिकायतें देखें',
    editReportBtn: 'विवरण बदलें',

    similarReportsHeading: 'आस-पास समान नागरिक समस्याएं',
    similarReportsSubheading:
      'नगरसाथी को आपके क्षेत्र में इसी तरह की समस्या की रिपोर्ट मिली है।',
    clusterBadge: 'समान शिकायत क्लस्टर पाया गया',
    whyDuplicateHeading: 'यह संबंधित क्यों है:',
    reason1: 'समान समस्या: पेयजल पाइपलाइन लीकेज',
    reason2: 'समीप स्थान: कपिल नगर कम्युनिटी हॉल के 150 मीटर के दायरे में',
    reason3: 'समान समय: पिछले 24 घंटों में दर्ज',
    joinExistingBtn: 'मौजूदा समस्या से जुड़ें',
    reportSeparatelyBtn: 'अलग से रिपोर्ट करें',

    complaintSubmittedTitle: 'शिकायत सफलतापूर्वक दर्ज हुई',
    viewComplaintBtn: 'शिकायत देखें',
  },
};
