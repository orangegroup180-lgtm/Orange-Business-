import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from '../components/UI';
import { Send, Bot, User, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { getBusinessChatSession } from '../services/geminiService';
import { Chat } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Array<{uri: string; title: string}>;
  isStreaming?: boolean;
}

export const AIChat: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI Business Assistant. I can help with market research, strategy, drafting content, or analyzing your business data. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const session = getBusinessChatSession();
      if (session) {
        setChat(session);
      } else {
        setMessages(prev => [...prev, {
            id: 'error-init',
            role: 'model',
            text: "Error: API Key is missing. Please check your configuration."
        }]);
      }
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage({ message: userMsg.text });
      
      // Extract grounding sources if available
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "I couldn't generate a response.",
        sources: sources
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Chat error", error);
      let errorMessage = "Sorry, I encountered an error processing your request.";
      if (error?.status === 403 || JSON.stringify(error).includes("PERMISSION_DENIED")) {
        errorMessage = "Permission denied. Please check your API Key.";
      }
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>

      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
             <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg tracking-tight">Assistant</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Sparkles size={10} className="text-orange-500" />
              Powered by Gemini
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex text-[10px] uppercase tracking-wider px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold items-center gap-1.5 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-slate-50/30 custom-scrollbar scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 max-w-3xl mx-auto group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-2 transition-transform group-hover:scale-105
              ${msg.role === 'user' 
                ? 'bg-slate-900 text-white' 
                : 'bg-white border border-slate-200 text-orange-500 shadow-sm'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`
                px-6 py-4 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-[1.5rem] rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-[1.5rem] rounded-tl-sm'}
              `}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {/* Grounding Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="bg-white p-3 rounded-2xl text-xs border border-slate-200 shadow-sm w-full animate-in fade-in slide-in-from-top-2">
                  <p className="font-bold text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[10px] pl-1">
                    <ExternalLink size={10} /> Verified Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-700 px-3 py-2 rounded-xl transition-colors border border-slate-100 hover:border-orange-100 font-medium"
                      >
                        <span className="truncate max-w-[150px]">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm mt-2">
              <Sparkles size={14} />
            </div>
            <div className="bg-white border border-slate-200 px-5 py-4 rounded-[1.5rem] rounded-tl-sm shadow-sm flex items-center gap-3">
               <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
               <span className="text-sm text-slate-500 font-medium">Generating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 md:p-6 bg-white z-10">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500/20 transition-all shadow-inner">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="flex-grow border-none focus:ring-0 bg-transparent shadow-none px-4 py-2"
              disabled={isLoading}
              autoFocus
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 px-0 flex items-center justify-center rounded-full bg-slate-900 hover:bg-black text-white shadow-md transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
          <div className="text-center mt-3">
             <p className="text-[10px] text-slate-400 font-medium">
               Gemini can make mistakes. Verify important information.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};