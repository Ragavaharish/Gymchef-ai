import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Bot, User, Sparkles, Volume2, VolumeX, Zap } from "lucide-react";
import { useSpeech } from "../hooks/useSpeech";
import { askCoach } from "../services/gemini";

/* ──────────────────────────────────────────────
   Markdown-lite renderer — converts common MD
   patterns into JSX-safe HTML for display.
   ────────────────────────────────────────────── */
function renderMarkdown(text) {
  if (!text) return "";
  return text
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-sm font-bold text-neon-lime mt-3 mb-1">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-neon-lime mt-4 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-slate-900 mt-4 mb-2">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-slate-500 italic">$1</em>')
    // Unordered list items
    .replace(/^[-•]\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-900/90">$1</li>')
    // Ordered list items
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal text-slate-900/90">$2</li>')
    // Line breaks
    .replace(/\n/g, "<br/>");
}

/* ──────────────────────────────────────────────
   Typing indicator — three bouncing dots
   ────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-start gap-3 max-w-[85%]"
    >
      <div className="shrink-0 mt-1 w-8 h-8 rounded-full bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center">
        <Bot className="h-4 w-4 text-neon-lime" />
      </div>
      <div className="bg-white border border-slate-200 shadow-lg rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-neon-lime/70"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Animated ring segments for the voice orb
   ────────────────────────────────────────────── */
function VoiceOrb({ isActive, isSpeaking }) {
  return (
    <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className={`absolute inset-0 rounded-full ${
          isActive || isSpeaking ? "bg-neon-lime/5" : "bg-white/[0.02]"
        }`}
        animate={
          isActive || isSpeaking
            ? { scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }
            : { scale: 1, opacity: 0.2 }
        }
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Middle pulse ring */}
      <motion.div
        className={`absolute inset-4 rounded-full border ${
          isActive
            ? "border-neon-lime/40"
            : isSpeaking
            ? "border-neon-lime/30"
            : "border-slate-200"
        }`}
        animate={
          isActive || isSpeaking
            ? { scale: [1, 1.08, 1], opacity: [0.6, 0.3, 0.6] }
            : { scale: 1, opacity: 0.5 }
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner solid orb */}
      <motion.div
        className={`absolute inset-8 rounded-full flex items-center justify-center ${
          isActive
            ? "bg-neon-lime/10 border border-neon-lime/30 pulse-neon"
            : isSpeaking
            ? "bg-neon-lime/10 border border-neon-lime/20 pulse-neon"
            : "bg-white border border-slate-200"
        }`}
        animate={
          isSpeaking
            ? { scale: [1, 1.05, 0.97, 1.03, 1] }
            : isActive
            ? { scale: [1, 1.04, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: isSpeaking ? 0.8 : 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {isSpeaking ? (
          <Volume2 className="h-10 w-10 text-neon-lime" />
        ) : isActive ? (
          <Mic className="h-10 w-10 text-neon-lime" />
        ) : (
          <Mic className="h-10 w-10 text-slate-500" />
        )}
      </motion.div>

      {/* Decorative rotating arcs */}
      {(isActive || isSpeaking) && (
        <>
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-neon-green/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-transparent border-b-neon-green/15"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Suggested Prompt Chips
   ────────────────────────────────────────────── */
const SUGGESTIONS = [
  { id: "sug-breakfast", label: "High-protein breakfast idea", icon: "🍳" },
  { id: "sug-budget", label: "Budget meal plan", icon: "💰" },
  { id: "sug-postworkout", label: "Post-workout nutrition", icon: "💪" },
  { id: "sug-fatloss", label: "Fat loss tips", icon: "🔥" },
];

/* ──────────────────────────────────────────────
   Main Coach Page Component
   ────────────────────────────────────────────── */
export default function Coach() {
  const {
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    speechSupported,
    synthesisSupported,
  } = useSpeech();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to newest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  /* ──── Send a message to the AI coach ──── */
  const handleSend = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || isLoading) return;

      // Append user message
      const userMsg = { sender: "user", text: trimmed };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const response = await askCoach(trimmed, updatedMessages);
        const aiMsg = { sender: "ai", text: response };
        setMessages((prev) => [...prev, aiMsg]);

        // Speak the response if synthesis supported & autoSpeak enabled
        if (synthesisSupported && autoSpeak) {
          speak(response);
        }
      } catch {
        const errMsg = {
          sender: "ai",
          text: "Sorry, I couldn't process that right now. Please try again in a moment.",
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, synthesisSupported, autoSpeak, speak]
  );

  /* ──── Handle form submit ──── */
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  /* ──── Voice recognition handler ──── */
  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening((resultText) => {
        handleSend(resultText);
      });
    }
  }, [isListening, stopListening, startListening, handleSend]);

  /* ──── Click a suggested prompt chip ──── */
  const handleSuggestion = (label) => {
    handleSend(label);
  };

  /* ──── Determine voice section status label ──── */
  const voiceStatusLabel = isListening
    ? "Listening..."
    : isSpeaking
    ? "Speaking..."
    : "Tap to speak";

  const voiceStatusColor = isListening
    ? "text-neon-lime"
    : isSpeaking
    ? "text-neon-lime"
    : "text-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-0 overflow-hidden"
    >
      {/* ═══════════════════════════════════════════
          VOICE SECTION (LEFT PANEL)
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full lg:w-[40%] flex flex-col items-center justify-center gap-6 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 relative overflow-hidden min-h-[280px] lg:min-h-0"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-glass-glow opacity-30 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-neon-lime" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Voice Coach</h2>
          </div>
          <p className="text-xs text-slate-500">AI-powered nutrition assistant</p>
        </div>

        {/* Voice Orb */}
        <div className="relative z-10">
          <VoiceOrb isActive={isListening} isSpeaking={isSpeaking} />
        </div>

        {/* Status Label */}
        <motion.p
          key={voiceStatusLabel}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative z-10 text-sm font-medium tracking-wide ${voiceStatusColor}`}
        >
          {voiceStatusLabel}
        </motion.p>

        {/* Mic Button */}
        <div className="relative z-10 flex items-center gap-4">
          <button
            id="coach-voice-toggle"
            onClick={handleVoiceToggle}
            disabled={!speechSupported}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? "bg-neon-red/20 border-2 border-neon-red text-neon-red shadow-lg shadow-neon-red/20 hover:bg-neon-red/30"
                : "bg-neon-lime/10 border-2 border-neon-lime/40 text-neon-lime hover:bg-neon-lime/20 hover:border-neon-lime glow-green"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <MicOff className="h-7 w-7" />
            ) : (
              <Mic className="h-7 w-7" />
            )}
          </button>

          {/* Auto-speak toggle */}
          {synthesisSupported && (
            <button
              id="coach-auto-speak-toggle"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
                autoSpeak
                  ? "bg-neon-lime/10 border-neon-lime/30 text-neon-lime"
                  : "bg-white border-slate-200 text-slate-500"
              }`}
              title={autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
            >
              {autoSpeak ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {!speechSupported && (
          <p className="relative z-10 text-xs text-slate-500/60 text-center max-w-[220px]">
            Voice not supported in this browser. Use Chrome or Safari.
          </p>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════
          CHAT SECTION (RIGHT PANEL)
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 flex flex-col min-h-0 bg-dark/50"
      >
        {/* ──── Chat Header ──── */}
        <div className="shrink-0 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center glow-green">
              <Bot className="h-5 w-5 text-neon-lime" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">GymChief AI</h3>
              <p className="text-[11px] text-neon-lime flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-lime inline-block animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-lime/5 border border-neon-lime/10">
            <Zap className="h-3 w-3 text-neon-lime" />
            <span className="text-[10px] text-neon-lime font-medium uppercase tracking-wider">
              AI Powered
            </span>
          </div>
        </div>

        {/* ──── Messages List ──── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin">
          {/* Welcome message when empty */}
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center mb-4 glow-green">
                <Bot className="h-8 w-8 text-neon-lime" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Hey! I&apos;m your AI Coach 💪
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Ask me anything about nutrition, meal plans, recipes, macros, or
                fitness goals. Use voice or text — I&apos;m ready.
              </p>
              {/* Suggestion chips when empty */}
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.id}
                    id={s.id}
                    onClick={() => handleSuggestion(s.label)}
                    className="px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-900 hover:border-neon-lime/40 hover:text-neon-lime hover:bg-neon-lime/5 transition-all duration-300"
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat bubbles */}
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <motion.div
                  key={`msg-${idx}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className={`flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI avatar */}
                  {!isUser && (
                    <div className="shrink-0 mt-1 w-8 h-8 rounded-full bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-neon-lime" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-white border border-slate-200 text-slate-900 rounded-tr-sm"
                        : "bg-white border border-slate-200 shadow-lg text-slate-900 rounded-tl-sm"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div
                        className="prose-coach [&_h2]:mt-3 [&_h3]:mt-2 [&_h4]:mt-2 [&_li]:mb-0.5 [&_strong]:text-slate-900"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(msg.text),
                        }}
                      />
                    )}
                  </div>

                  {/* User avatar */}
                  {isUser && (
                    <div className="shrink-0 mt-1 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>

          {/* Invisible scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* ──── Suggestion Chips (visible when chat has messages) ──── */}
        {messages.length > 0 && !isLoading && (
          <div className="shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin">
            {SUGGESTIONS.map((s) => (
              <button
                key={`inline-${s.id}`}
                id={`inline-${s.id}`}
                onClick={() => handleSuggestion(s.label)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/80 border border-slate-200 text-slate-500 hover:border-neon-lime/40 hover:text-neon-lime hover:bg-neon-lime/5 transition-all duration-200"
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        )}

        {/* ──── Input Bar ──── */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 p-3 border-t border-slate-200 flex items-center gap-3"
        >
          <input
            id="coach-chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about nutrition, recipes, macros..."
            disabled={isLoading}
            className="flex-1 bg-white/70 border border-slate-200 focus:border-neon-lime/50 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-dark-muted outline-none transition-all duration-300 disabled:opacity-50"
          />

          {/* Voice shortcut in input area */}
          {speechSupported && (
            <button
              id="coach-inline-mic"
              type="button"
              onClick={handleVoiceToggle}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                isListening
                  ? "bg-neon-red/20 border-neon-red text-neon-red"
                  : "bg-white border-slate-200 text-slate-500 hover:text-neon-lime hover:border-neon-lime/30"
              }`}
              title={isListening ? "Stop" : "Voice input"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            id="coach-send-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-neon-lime hover:bg-neon-lime/90 text-black flex items-center justify-center transition-all duration-300 shadow-lg shadow-neon-lime/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
