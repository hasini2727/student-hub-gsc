"use client"; // <-- This MUST be the very first line!

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { LogOut } from "lucide-react";

interface AuthButtonProps {
  onProfileUpdate: (year: string, branch: string) => void;
}

// Avatar component extracted outside to avoid being re‑created on each render
const Avatar = ({ user }: { user: User | null }) => {
  const letter = user?.displayName?.[0]?.toUpperCase() || "?";
  return user?.photoURL ? (
    <img
      src={user.photoURL}
      alt={`${user.displayName}'s avatar`}
      className="w-9 h-9 rounded-full object-cover"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
      {letter}
    </div>
  );
};

export default function AuthButton({ onProfileUpdate }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync global keys with user‑specific keys (ensures AI Chat page gets the correct data)
  const syncGlobalKeys = (y: string, b: string) => {
    localStorage.setItem("studentYear", y);
    localStorage.setItem("studentBranch", b);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const savedYear = localStorage.getItem(`year_${u.uid}`) || "";
        const savedBranch = localStorage.getItem(`branch_${u.uid}`) || "";
        setYear(savedYear);
        setBranch(savedBranch);
        // Also sync the global keys for the AI Chat page
        syncGlobalKeys(savedYear, savedBranch);
        onProfileUpdate(savedYear, savedBranch);
      } else {
        // No user: clear global keys to avoid showing stale data
        syncGlobalKeys("", "");
        onProfileUpdate("", "");
      }
    });
    return () => unsubscribe();
  }, [onProfileUpdate]); // include onProfileUpdate in deps (safe because it's stable)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setDropdownOpen(false);
    setYear("");
    setBranch("");
    // Clear both user‑specific and global keys
    if (user) {
      localStorage.removeItem(`year_${user.uid}`);
      localStorage.removeItem(`branch_${user.uid}`);
    }
    syncGlobalKeys("", "");
    onProfileUpdate("", "");
  };

  const handleSaveProfile = () => {
    // Save user‑specific preferences
    if (user) {
      localStorage.setItem(`year_${user.uid}`, year);
      localStorage.setItem(`branch_${user.uid}`, branch);
    }
    // Sync global keys for the AI Chat page
    syncGlobalKeys(year, branch);
    onProfileUpdate(year, branch);
    setDropdownOpen(false);
  };

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100"
      >
        Login
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex flex-col items-center gap-0.5 hover:opacity-80 transition"
        aria-label="Open profile menu"
      >
        <Avatar user={user} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          Profile
        </span>
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <Avatar user={user} />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase mb-3">Filter Opportunities</p>

          <div className="mb-3">
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select branch</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Chemical">Chemical</option>
            </select>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition mb-2"
          >
            Save & Filter Opportunities
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}