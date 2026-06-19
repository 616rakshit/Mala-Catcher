/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw, Feather, BookOpen, Quote } from "lucide-react";
import { ChatMessage } from "../types";

export default function AIGuide() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested pre-filled questions
  const SUGGESTED_TOPICS = [
    { text: "Life of Acharya Bhikshu", query: "Can you tell me about the life and core philosophy of Acharya Bhikshu?" },
    { text: "Meaning of Navkar Mantra", query: "What is the spiritual meaning and power of the Navkar Mantra?" },
    { text: "How to do Samayik", query: "How should a Shravak prepare and perform a 48-minute Samayik meditation?" },
    { text: "Philosophy of Pure Dharma", query: "Explain Acharya Bhikshu's concepts of Shuddha Dharma (pure religion of soul) vs outer rituals?" },
  ];

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "welcome",
        sender: "guru",
        text: "Pranam, noble seeker. I am your spiritual companion on this journey of self-realization. Explore the pristine teachings of Acharya Bhikshu, understand Navkar, or ask how to practice inner equanimity. How can I assist your soul's sadhana today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    fetchDailyQuote();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchDailyQuote = async () => {
    setQuoteLoading(true);
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: "Mindfulness and pure Soul Dharma" }),
      });
      const data = await response.json();
      setDailyQuote(data.quote || "May your intentions be pure, for purity is the supreme light of liberation.");
    } catch (e) {
      setDailyQuote("Ahimsa is the highest truth. Let every breath breathe out compassion to all living creatures.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSendMessage = async (userQuery: string) => {
    if (!userQuery.trim() || loading) return;

    setErrorText(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const chatHistory = messages.filter((m) => m.id !== "welcome");
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userQuery,
          history: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Server response was not successful");
      }

      const data = await response.json();
      
      const guruMsg: ChatMessage = {
        id: `g-${Date.now()}`,
        sender: "guru",
        text: data.text || "Your question triggers deep contemplation. Let us breathe out negativity and focus on outer silence.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, guruMsg]);

    } catch (error: any) {
      console.error(error);
      
      // Fallback pre-written answers based on keywords to keep the app 100% functional
      let fallbackText = "The path of self-realization requires steady patience. Let us quiet are minds and turn to introspection.";
      const queryLower = userQuery.toLowerCase();
      
      if (queryLower.includes("bhikshu") || queryLower.includes("founder") || queryLower.includes("life")) {
        fallbackText = `Acharya Bhikshu (1726–1803) was the revolutionary founder of Shvetambara Terapanth Jainism. He emphasized strict adherence to the vows of non-violence (Ahimsa) and truth (Satya). He separated public charity (Laukik dharma) from spiritual purity of soul (Lokottara/Shuddha dharma), urging practitioners to focus on cleansing their own consciousness of attachment and aversion (Raga and Dvesha). He wore pure white, simple robes and led a highly disciplined, wandering monastic life, inspiring millions with his clarity and devotion.`;
      } else if (queryLower.includes("navkar") || queryLower.includes("mantra") || queryLower.includes("meaning")) {
        fallbackText = `The Navkar Mantra (or Namokar Mantra) is the supreme prayer of Jainism. Rather than asking for worldly favors, we offer deep salutations to:
1. Arihants (destroyers of five inner enemies, spiritual masters)
2. Siddhas (liberated, disembodied souls)
3. Acharyas (spiritual leaders of the monastic orders)
4. Upadhyayas (monastic teachers)
5. Sadhus (pure wandering monks)
Chanting it purifies the soul, washes away negative karmic vibrations, and aligns our consciousness with supreme enlightenment.`;
      } else if (queryLower.includes("samayik") || queryLower.includes("meditation") || queryLower.includes("how to")) {
        fallbackText = `Samayik is a 48-minute spiritual meditation of equanimity. To perform it:
1. Sitting in a quiet corner with a small wooden table or seat.
2. Formulate a Sankalp (intent): "I will remain in peaceful equanimity, giving up all attachment, anger, and worldly thoughts for 48 minutes."
3. Recite the Karemi Bhante sutra (pledging to refrain from harmful deeds in mind, speech, and body).
4. Spend the 48 minutes either doing Mala Jaap (counting 'Om Bhikshu'), practicing deep breath control (Pranayama), or doing Swadhyay (reading sacred books).
It creates the ultimate mental shield, letting you experience monkhood for an hour.`;
      } else if (queryLower.includes("mala") || queryLower.includes("chanting") || queryLower.includes("why")) {
        fallbackText = `Mala chanting utilizes a rosary of 108 beads. Moving the beads one by one with your thumb and fingers while repeating your sacred mantra (like 'Om Bhikshu' or 'Namo Arihantanam'):
1. Connects the physical sense of touch to mental focusing.
2. Beats a natural rhythm matching your breathing, soothing the central nervous system.
3. Keeps track of the 108 chants (representing conquering the 108 kinds of karmic influxes).
It transforms random surface thoughts into a wave of serene single-pointed devotion.`;
      }

      setErrorText("Connected via Internal Wisdom (offline fallback mode active).");
      setTimeout(() => {
        const guruMsg: ChatMessage = {
          id: `g-${Date.now()}`,
          sender: "guru",
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, guruMsg]);
        setLoading(false);
      }, 800);
    } finally {
      if (!errorText) setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="ai-guide-interface">
      {/* Sidebar Info/Daily quote panel */}
      <div className="lg:col-span-1 flex flex-col gap-4" id="ai-sidebar-col">
        {/* Daily Quote card */}
        <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-5 rounded-2xl shadow-sm text-center flex flex-col items-center relative overflow-hidden" id="daily-blessing-card">
          <div className="absolute top-2 left-2 text-amber-200/50">
            <Quote className="w-8 h-8 fill-current rotate-180" />
          </div>
          
          <div className="p-2.5 bg-amber-100/50 rounded-xl text-amber-600 mb-3">
            <Feather className="w-5 h-5" />
          </div>

          <h4 className="text-xs font-bold uppercase tracking-widest text-amber-800 font-sans mb-2">Message of the Day</h4>
          
          <div className="text-xs text-stone-600 font-serif leading-relaxed italic mb-4">
            {quoteLoading ? (
              <span className="flex items-center justify-center gap-1.5 py-4">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                tuning spirit...
              </span>
            ) : (
              `"${dailyQuote}"`
            )}
          </div>

          <button
            onClick={fetchDailyQuote}
            className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors pointer-events-auto"
            id="btn-refresh-blessing"
          >
            <RefreshCw className="w-3 h-3" /> Seek New Guidance
          </button>
        </div>

        {/* Culture reference suggestions */}
        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col gap-3" id="quick-teachings-ref">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-500" /> Topic Prompts
          </h4>
          <span className="text-[10px] text-stone-400">Click a spiritual subject below to prompt the guide directly:</span>
          
          <div className="flex flex-col gap-2 mt-1">
            {SUGGESTED_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(topic.query)}
                className="text-left text-xs p-2.5 rounded-xl bg-amber-50/50 border border-amber-100/45 hover:bg-amber-100/40 text-amber-900 transition-colors pointer-events-auto"
              >
                {topic.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dialogue Screen */}
      <div className="lg:col-span-3 bg-white border border-stone-100 h-[68vh] rounded-3xl flex flex-col shadow-sm overflow-hidden" id="main-ai-dialogue">
        {/* Chat box top header */}
        <div className="bg-gradient-to-r from-amber-50/40 to-white px-6 py-4 border-b border-stone-100 flex items-center justify-between" id="ai-chat-header">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
              ॐ
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">Terapanth Spiritual Companion</h3>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Vikas & Shuddha Dharma guide online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 py-1 px-2.5 rounded-full text-[10px] font-mono text-amber-800 border border-amber-100/80">
            <Sparkles className="w-3 h-3 text-amber-500 animate-bounce" />
            OM BHIKSHU AI
          </div>
        </div>

        {/* Scrollable chat flow */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50/20" id="dialogue-flow-scroller">
          {messages.map((msg) => {
            const isGuru = msg.sender === "guru";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isGuru ? "self-start items-start" : "self-end items-end"}`}
              >
                {/* bubble */}
                <div
                  className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    isGuru
                      ? "bg-white border border-stone-100 text-stone-800 rounded-tl-sm font-light whitespace-pre-line"
                      : "bg-amber-600 text-white rounded-tr-sm font-medium"
                  }`}
                >
                  {msg.text}
                </div>
                {/* stamp */}
                <span className="text-[9px] text-stone-400 mt-1 font-mono">{msg.timestamp}</span>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex flex-col self-start max-w-[80%]">
              <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 text-stone-500 text-xs">
                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                Chanting internally for wisdom...
              </div>
            </div>
          )}

          {errorText && (
            <div className="self-center bg-stone-100 text-stone-500 text-[10px] font-mono py-1 px-3.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {errorText}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Message Input line */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-4 bg-white border-t border-stone-100 flex gap-2 items-center"
          id="dialogue-input-block"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything (e.g. Navkar Mantra meanings, Acharya Bhikshu...)"
            className="flex-1 py-2.5 px-4 bg-slate-50 border border-stone-200 focus:border-amber-400/80 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-200 transition-all font-light"
            id="field-user-query"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className={`p-2.5 rounded-xl shrink-0 transition-all shadow-sm ${
              inputValue.trim() && !loading
                ? "bg-amber-600 hover:bg-amber-700 text-white hover:shadow"
                : "bg-stone-100 text-stone-400 border border-stone-200"
            }`}
            id="btn-dialogue-send"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
