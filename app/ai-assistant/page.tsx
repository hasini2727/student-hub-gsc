"use client";
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Bot, User, ChevronLeft, Sparkles, BookOpen, Clock, Award, GraduationCap, Paperclip, FileText, X } from 'lucide-react';
import Link from 'next/link';

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.match(/^[\*\-] /)) {
      const content = line.replace(/^[\*\-] /, '');
      return <li key={i} className="ml-4 list-disc leading-relaxed mb-1 text-slate-700">{formatInline(content)}</li>;
    }
    if (line.match(/^\d+\. /)) {
      const content = line.replace(/^\d+\. /, '');
      return <li key={i} className="ml-4 list-decimal leading-relaxed mb-1 text-slate-700">{formatInline(content)}</li>;
    }
    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      const content = line.replace(/^#+\s/, '');
      return <p key={i} className="font-bold text-slate-900 mt-4 mb-2">{formatInline(content)}</p>;
    }
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="leading-relaxed mb-2 text-slate-700">{formatInline(line)}</p>;
  });
};

const formatInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-slate-900">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="text-slate-800">{part.slice(1, -1)}</em>;
    return part;
  });
};

const suggestions = [
  { icon: <Award size={14} />, text: "Check my eligibility for Reliance Foundation Scholarship" },
  { icon: <Clock size={14} />, text: "What are upcoming hackathon deadlines?" },
  { icon: <BookOpen size={14} />, text: "Best internships for 3rd year CSE students?" },
];

export default function AIChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [studentYear, setStudentYear] = useState('');
  const [studentBranch, setStudentBranch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load saved profile from localStorage (same as home page)
  useEffect(() => {
    const savedYear = localStorage.getItem('studentYear') || '';
    const savedBranch = localStorage.getItem('studentBranch') || '';
    setStudentYear(savedYear);
    setStudentBranch(savedBranch);
  }, []);

  const handleChat = async (overrideInput?: string) => {
    const userMsg = (overrideInput || input).trim();
    if (!userMsg && !pdfFile) return;

    // PDF upload flow
    if (pdfFile) {
      await handlePdfUpload();
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const expertPrompt = `You are an Academic Mentor for StudentHub. 
        Analyze the following opportunity details and provide a professional, helpful response. 
        Use clear headings and bullets.
        Question: ${userMsg}`;
      const result = await model.generateContent(expertPrompt);
      const text = result.response.text();
      setMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    const fileName = pdfFile.name;

    setMessages(prev => [...prev, {
      role: 'user',
      text: `📄 Uploaded: ${fileName}${studentYear && studentBranch ? `\n🎓 My Profile: Year ${studentYear} · ${studentBranch}` : ''}`
    }]);
    setPdfFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      if (studentYear) formData.append('year', studentYear);
      if (studentBranch) formData.append('branch', studentBranch);

      const res = await fetch('/api/pdf', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'ai', text: data.result }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error processing PDF: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); }
  };

  const isEmpty = messages.length === 0;
  const hasProfile = studentYear && studentBranch;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <style>{`
        .user-bubble { background: #4f46e5; }
        .ai-bubble { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .input-box { background: #ffffff; border: 1px solid #e2e8f0; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .input-box:focus-within { border-color: #6366f1; box-shadow: 0 4px 20px rgba(99,102,241,0.15); }
        .suggestion-chip { background: #ffffff; border: 1px solid #e2e8f0; transition: all 0.2s; cursor: pointer; }
        .suggestion-chip:hover { background: #f1f5f9; border-color: #6366f1; transform: translateY(-1px); }
        .send-btn { background: #4f46e5; transition: all 0.2s; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; }
        .pdf-chip { background: #eef2ff; border: 1px solid #c7d2fe; }
        .dot-pulse { display:flex; gap:4px; align-items:center; }
        .dot-pulse span { width:6px; height:6px; border-radius:50%; background:#6366f1; animation: dp 1.2s ease-in-out infinite; display:block; }
        .dot-pulse span:nth-child(2) { animation-delay:0.2s; }
        .dot-pulse span:nth-child(3) { animation-delay:0.4s; }
        @keyframes dp { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .fade-in { animation: fadeUp 0.3s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition border border-slate-200">
            <ChevronLeft size={18} className="text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm leading-tight">StudentHub AI</p>
              <p className="text-[10px] text-slate-500 font-medium">Academic Mentor · Gemini 2.5</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasProfile && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-600">Year {studentYear} · {studentBranch}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Online</span>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {isEmpty && (
            <div className="fade-in text-center mt-8 mb-10">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-200">
                <Bot size={32} className="text-white" />
              </div>
              <h2 className="text-slate-900 font-black text-3xl mb-3 tracking-tight">Your Academic Mentor</h2>
              <p className="text-slate-500 text-sm mb-3 max-w-sm mx-auto leading-relaxed">
                Ask questions or <span className="text-indigo-600 font-semibold">upload a PDF</span> to instantly check your eligibility.
              </p>
              {!hasProfile && (
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-4 py-2 rounded-full mb-8">
                  💡 Set your profile on the home page for personalized eligibility checks
                </div>
              )}
              {hasProfile && (
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium px-4 py-2 rounded-full mb-8">
                  🎓 Checking eligibility for Year {studentYear} · {studentBranch}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 text-left">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleChat(s.text)} className="suggestion-chip rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">{s.icon}</div>
                    <span className="text-sm font-medium text-slate-600">{s.text}</span>
                  </button>
                ))}
                {/* PDF suggestion */}
                <button onClick={() => fileInputRef.current?.click()} className="suggestion-chip rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm border-dashed">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><FileText size={14} /></div>
                  <span className="text-sm font-medium text-slate-600">Upload a scholarship/internship PDF to check eligibility</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`fade-in flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-indigo-600 shadow-md mt-1">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm ${
                  m.role === 'user'
                    ? 'user-bubble text-white rounded-tr-none shadow-lg shadow-indigo-100'
                    : 'ai-bubble text-slate-700 rounded-tl-none'
                }`}>
                  {m.role === 'ai'
                    ? <div className="prose prose-slate max-w-none">{renderMarkdown(m.text)}</div>
                    : <p className="leading-relaxed font-medium whitespace-pre-wrap">{m.text}</p>
                  }
                </div>
                {m.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-white border border-slate-200 shadow-sm mt-1">
                    <User size={16} className="text-slate-400" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="fade-in flex gap-4 justify-start">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="ai-bubble px-6 py-5 rounded-3xl rounded-tl-none">
                  <div className="dot-pulse"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 pb-6 pt-4">
        <div className="max-w-3xl mx-auto">

          {/* PDF preview chip */}
          {pdfFile && (
            <div className="pdf-chip flex items-center gap-2 px-4 py-2.5 rounded-xl mb-2 w-fit">
              <FileText size={14} className="text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700 max-w-[200px] truncate">{pdfFile.name}</span>
              <button onClick={() => setPdfFile(null)} className="text-indigo-400 hover:text-indigo-600 ml-1">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="input-box rounded-2xl flex items-end gap-2 p-2 pl-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Paperclip button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-slate-100 transition shrink-0 mb-1"
              title="Upload PDF"
            >
              <Paperclip size={18} className="text-slate-400 hover:text-indigo-600 transition" />
            </button>

            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent outline-none text-slate-800 text-sm resize-none py-3"
              style={{ minHeight: '44px', maxHeight: '150px' }}
              placeholder={pdfFile ? "PDF ready — click send to analyze..." : "Ask a question or upload a PDF 📎"}
              value={input}
              disabled={!!pdfFile}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => handleChat()}
              disabled={loading || (!input.trim() && !pdfFile)}
              className="send-btn w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-[10px] mt-2 text-slate-400 font-medium">
            Upload PDF 📎 for instant eligibility check · Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}