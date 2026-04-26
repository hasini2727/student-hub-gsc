"use client";
import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, Send, Bot, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AIChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
  { 
    role: 'ai', 
    text: "Hello! I'm your StudentHub Assistant. What can I help for you?" 
  }
]);
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!input) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // 1. Initialize the AI
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const expertPrompt = `You are an expert academic assistant for StudentHub. 
        Analyze the following opportunity details and provide a clear, concise summary. 
        Details/Question: ${userMsg}`;

      // 3. Use the most modern, robust call structure
      const result = await model.generateContent(expertPrompt);
      const response = await result.response;
      const text = response.text();
      
      setMessages(prev => [...prev, { role: 'ai', text: text }]);
    } catch (err: any) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-600" size={20} />
          <h1 className="font-bold text-slate-800">StudentHub AI Assistant</h1>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center mt-20 text-slate-400">
            <Bot size={48} className="mx-auto mb-4 opacity-20" />
            <p>Paste scholarship details or ask a career question!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <div className="flex items-center gap-2 mb-1 opacity-70">
                {m.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                <span className="text-[10px] font-bold uppercase">{m.role}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-blue-600 text-xs font-bold animate-pulse">AI is thinking...</div>}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input 
            className="flex-1 p-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
          />
          <button onClick={handleChat} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}