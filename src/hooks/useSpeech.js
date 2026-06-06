import { useState, useEffect, useRef } from "react";

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Speak text aloud using SpeechSynthesis
  const speak = (text, onEndCallback) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis is not supported in this browser.");
      return;
    }

    // Cancel current speaking
    window.speechSynthesis.cancel();

    // Clean text from markdown notations to sound natural
    const cleanText = text
      .replace(/[*#_~`\[\]()]/g, "") // remove MD characters
      .replace(/-\s/g, "") // remove list hyphens
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose a premium sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Male"))
    ) || voices[0];
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Start listening for voice commands
  const startListening = (onResultCallback) => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    // Stop speaking if coach is talking
    stopSpeaking();

    recognitionRef.current.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      if (onResultCallback) {
        onResultCallback(resultText);
      }
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Recognition start issue:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    speechSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    synthesisSupported: typeof window !== "undefined" && "speechSynthesis" in window
  };
}
