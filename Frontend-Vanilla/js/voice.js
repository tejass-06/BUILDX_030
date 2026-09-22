/**
 * NAGARSAATHI AI — NATURAL VOICE SPEECH-TO-TEXT ENGINE
 * Supports Marathi (mr-IN), Hindi (hi-IN), English (en-IN), and Mixed Language
 */

class VoiceInputHandler {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.currentLanguage = "mr-IN"; // Default Marathi for regional civic complaints
    this.finalTranscript = "";
    this.onTranscriptCallback = null;
    this.onStateChangeCallback = null;
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[Voice] Web Speech API not supported on this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onstart = () => {
      this.isRecording = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
    };

    this.recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const fullText = (this.finalTranscript + interim).trim();
      if (this.onTranscriptCallback) {
        this.onTranscriptCallback(fullText, interim);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("[Voice] Recognition error:", event.error);
      this.isRecording = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false, event.error);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
    };
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  start(onTranscript, onStateChange) {
    if (!this.recognition) {
      Utils.showToast("Speech recognition is not supported in this browser. Please use keyboard input.", "error");
      return;
    }
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;
    this.finalTranscript = "";
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("[Voice] Start error:", e);
    }
  }

  stop() {
    if (this.recognition && this.isRecording) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("[Voice] Stop error:", e);
      }
    }
    this.isRecording = false;
  }

  toggle(onTranscript, onStateChange) {
    if (this.isRecording) {
      this.stop();
    } else {
      this.start(onTranscript, onStateChange);
    }
  }
}

window.VoiceEngine = new VoiceInputHandler();
