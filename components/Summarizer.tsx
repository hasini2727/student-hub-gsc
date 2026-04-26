"use client";
import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileText, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function Summarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    if (!text) return;
    
    setLoading(true);
    setError("");
    
    try {
      // 1. Initialize Gemini with your API Key
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // 2. Craft the Prompt
      const prompt = `You are an expert academic counselor. Summarize the following scholarship/internship text into 3 clear bullet points: 
      1. Eligibility Criteria 
      2. Application Deadline 
      3. Benefits/Stipend. 
      Text: ${text}`;

      // 3. Generate Content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setSummary(response.text());
    } catch (err) {
      console.error(err);
      setError("AI was unable to process this. Check your API key or connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-inner mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-blue-600" size={20} />
        <h3 className="font-bold text-slate-800">AI PDF Tool (Beta)</h3>
      </div>
      
      <p className="text-xs text-slate-500 mb-4">
        Paste the content of a scholarship PDF below to get a 3-second summary.
      </p>

      <textarea 
        className="w-full h-32 p-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-sm mb-4"
        placeholder="Paste scholarship details here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button 
        onClick={handleSummarize}
        disabled={loading || !text}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition disabled:bg-slate-300"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><FileText size={18} /> Summarize with Gemini</>}
      </button>

      {summary && (
        <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-1">
            <Sparkles size={14} /> Quick TL;DR
          </h4>
          <div className="text-sm text-slate-600 prose prose-sm max-w-none whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}