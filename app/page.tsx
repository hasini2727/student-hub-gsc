"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, GraduationCap, Calendar, CheckCircle, ExternalLink, Loader2, Plus, Share2 } from 'lucide-react';

const getDeadlineStatus = (dateStr: string) => {
  if (!dateStr) return null;

  // Handle vague dates — just show a neutral "Upcoming" badge
  if (dateStr.toLowerCase().includes('tentative') || 
      dateStr.toLowerCase().includes('mid') ||
      dateStr.match(/^[A-Za-z]+ \d{4}$/)) {
    return 'upcoming';
  }

  // Try to parse exact dates like "May 10, 2026" or "April 28, 2026"
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;

  const today = new Date();
  const diffDays = Math.ceil((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'closing';
  return null;
};

const handleShare = (title: string, link: string, desc: string) => {
  const subject = encodeURIComponent(`Student Opportunity: ${title}`);
  const body = encodeURIComponent(
`Dear SPOC,

I would like to bring the following opportunity to your attention:

Opportunity: ${title}
Official Link: ${link}

About:
${desc}

Kindly approve or forward this for institutional participation.

Thank you.`
  );
  window.open(
    `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
    '_blank'
  );
};
export default function Home() {
  const [filter, setFilter] = useState('All');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "opportunities"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOpportunities(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = opportunities.filter(opt => {
    const matchesFilter = filter === 'All' || opt.type === filter;
    const matchesSearch = opt.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b p-4 sticky top-0 z-50">
        <div className="flex gap-3">
          <Link href="/ai-assistant">
            <button className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition">
              Ask AI
            </button>
          </Link>
          <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100">
            Login
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-12">
        {/* Hero / Search Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Opportunities for <span className="text-blue-600">Future Engineers</span>
          </h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">Explore verified scholarships, internships, and hackathons curated just for you.</p>
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-lg shadow-slate-200/50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['All', 'Scholarship', 'Internship', 'Hackathon'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                filter === tag
                ? 'bg-slate-900 text-white shadow-xl scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-medium animate-pulse">Fetching opportunities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredData.length > 0 ? (
              filteredData.map((opt) => (
                <div key={opt.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <GraduationCap size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                        <CheckCircle size={12} /> Verified
                      </span>
                      {getDeadlineStatus(opt.date) === 'closing' && (
                        <span className="text-[10px] font-black tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase animate-pulse">
                          🔴 Closing Soon
                        </span>
                      )}
                      {getDeadlineStatus(opt.date) === 'upcoming' && (
                        <span className="text-[10px] font-black tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">
                          📅 Tentative
                        </span>
                      )}
                      {getDeadlineStatus(opt.date) === 'expired' && (
                        <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{opt.title}</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-3">{opt.desc}</p>
                  <div className="pt-5 border-t border-slate-50 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <Calendar size={16} /> <span>{opt.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Share with SPOC Button */}
                      <button
                        onClick={() => handleShare(opt.title, opt.link || '#', opt.desc)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"
                      >
                        <Share2 size={13} />
                        Share with SPOC
                      </button>
                      <button className="flex items-center gap-1.5 text-blue-600 font-extrabold group-hover:gap-3 transition-all">
                        Details <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-slate-400 text-lg">No opportunities found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <button className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95">
        <Plus size={24} />
      </button>
    </main>
  );
}