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
  },
};
