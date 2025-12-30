import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, Loader2, Globe } from "lucide-react";
import { useAssets } from "../../context/AssetContext";
import { useProcurement } from "../../context/ProcurementContext";
import { GoogleGenAI } from "@google/genai";

interface GroundingSource {
  title: string;
  uri: string;
}

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
}

const SmartAssist: React.FC = () => {
  const { assets, savedAssessments } = useAssets();
  const { tenders } = useProcurement();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Halo. Saya asisten cerdas MIGAS. Ada yang bisa saya bantu terkait data aset, tender, atau vendor?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isThinking]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsThinking(true);

    try {
      // 1. Build Context
      const assetContext = assets
        .slice(0, 8)
        .map(
          (a) =>
            `- ${a.name} (${a.category}): Status ${a.status}, CSMS Score ${a.csmsScore}`
        )
        .join("\n");
      const assessmentContext =
        savedAssessments.length > 0
          ? `Saved Assessments (Berita Acara): \n${savedAssessments
              .map(
                (a) =>
                  `- ${a.title} (${a.id}): ${a.candidates.length} candidates found.`
              )
              .join("\n")}`
          : "No saved market assessments yet.";

      const systemPrompt = `You are the SKK Migas AI Assistant (Text Only). 
      
      Current System Data:
      ${assetContext}
      
      ${assessmentContext}
      
      Answer accurately in Indonesian. Keep responses concise and professional.`;

      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: userMsg.text,
          config: {
            systemInstruction: systemPrompt,
            tools: [{ googleSearch: {} }],
          },
        });

        const chunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = chunks
          .map((c: any) =>
            c.web?.uri && c.web?.title
              ? { title: c.web.title, uri: c.web.uri }
              : null
          )
          .filter((s: any) => s !== null);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "model",
            text: response.text || "...",
            timestamp: new Date(),
            sources,
          },
        ]);
      } else {
        // Fallback for demo without API Key
        await new Promise((r) => setTimeout(r, 1000));
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "model",
            text: "Mode Demo: Saya dapat memberikan data real-time mengenai Aset Hulu Migas dan status Vendor.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "Maaf, sistem sedang sibuk. Mohon coba lagi.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-xl border transition-all duration-300 ${
          isOpen
            ? "bg-white text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700"
            : "bg-slate-900 text-white border-transparent dark:bg-white dark:text-slate-900 hover:scale-105"
        }`}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Main Window */}
      <div
        className={`fixed bottom-24 right-6 z-[60] w-[360px] md:w-[420px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 h-[600px]"
            : "opacity-0 scale-95 translate-y-4 h-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border bg-white border-slate-200 text-indigo-600 dark:bg-slate-900 dark:border-slate-700 dark:text-white">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                MIGAS AI
              </h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Kecerdasan Perusahaan
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-900 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed border ${
                  msg.role === "user"
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-br-none"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.uri}
                      target="_blank"
                      className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Globe size={10} /> {s.title}
                    </a>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 px-1 font-mono">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-3">
                <Loader2 size={14} className="animate-spin text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">
                  Memproses data...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik pesan..."
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg pl-4 pr-12 py-3 text-sm outline-none border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
              Konten dihasilkan AI mungkin tidak akurat.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartAssist;
