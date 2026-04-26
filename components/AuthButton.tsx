"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { LogOut, ChevronDown } from "lucide-react";

interface AuthButtonProps {
  onProfileUpdate: (year: string, branch: string) => void;
}

export default function AuthButton({ onProfileUpdate }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Load saved profile from localStorage
      if (u) {
        const savedYear = localStorage.getItem(`year_${u.uid}`) || "";
        const savedBranch = localStorage.getItem(`branch_${u.uid}`) || "";
        setYear(savedYear);
        setBranch(savedBranch);
        onProfileUpdate(savedYear, savedBranch);
      }
    });
    return () => unsub();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
    onProfileUpdate("", "");
  };

  const handleSaveProfile = () => {
    if (user) {
      localStorage.setItem(`year_${user.uid}`, year);
      localStorage.setItem(`branch_${user.uid}`, branch);
      onProfileUpdate(year, branch);
      setDropdownOpen(false);
    }
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
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
      >
        <img
          src={user.photoURL || ""}
          alt="profile"
          className="w-6 h-6 rounded-full"
        />
        <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
          {user.displayName?.split(" ")[0]}
        </span>
        <ChevronDown size={14} className="text-slate-500" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3">My Profile</p>

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