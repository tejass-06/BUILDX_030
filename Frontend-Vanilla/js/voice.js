/**
 * NAGARSAATHI AI — NATURAL VOICE SPEECH-TO-TEXT ENGINE
 * Supports Marathi (mr-IN), Hindi (hi-IN), English (en-IN), and Multilingual Speech
 * Uses Browser Web Speech API: window.SpeechRecognition || window.webkitSpeechRecognition
 */

class VoiceEngine {
  constructor(options = {}) {
    this.lang = options.lang || 'mr-IN'; // Default Marathi for regional civic governance
    this.onResult = options.onResult || null;
    this.onStart = options.onStart || null;
    this.onEnd = options.onEnd || null;
    this.onError = options.onError || null;

    this.recognition = null;
    this.isRecording = false;
    this.finalTranscript = '';
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[VoiceEngine] Web Speech API is not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onstart = () => {
        this.isRecording = true;
        if (this.onStart) this.onStart();
      };

      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            this.finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const fullText = (this.finalTranscript + interim).trim();
        if (this.onResult) {
          this.onResult(fullText, event.results[event.results.length - 1].isFinal);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceEngine] Recognition event error:', event.error);
        this.isRecording = false;
        
        let friendlyMsg = 'Voice recognition error';
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            friendlyMsg = 'Microphone permission denied. Please allow microphone access in browser settings.';
            break;
          case 'no-speech':
            friendlyMsg = 'No speech detected. Please speak clearly into your microphone.';
            break;
          case 'audio-capture':
            friendlyMsg = 'No microphone found or audio capture failed.';
            break;
          case 'network':
            friendlyMsg = 'Network error during speech processing. Please check internet connection.';
            break;
          default:
            friendlyMsg = `Speech error: ${event.error}`;
        }

        if (this.onError) {
          this.onError(friendlyMsg);
        }
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        if (this.onEnd) this.onEnd();
      };
    } catch (e) {
      console.warn('[VoiceEngine] Failed to initialize SpeechRecognition:', e);
    }
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  setLanguage(langCode) {
    this.lang = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  start() {
    if (!this.isSupported()) {
      const msg = 'Voice input is not supported in this browser. Please type your complaint.';
      if (this.onError) this.onError(msg);
      if (typeof Utils !== 'undefined') Utils.showToast(msg, 'warning');
      return;
    }

    if (!this.recognition) {
      this.init();
    }

    if (this.isRecording) {
      return;
    }

    this.finalTranscript = '';
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('[VoiceEngine] Start error:', e);
      if (this.onError) this.onError('Could not start microphone: ' + e.message);
    }
  }

  stop() {
    if (this.recognition && this.isRecording) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('[VoiceEngine] Stop error:', e);
      }
    }
    this.isRecording = false;
  }

  toggle() {
    if (this.isRecording) {
      this.stop();
    } else {
      this.start();
    }
  }
}

// Expose globally for vanilla frontend scripts
window.VoiceEngine = VoiceEngine;
