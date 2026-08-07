import React, { useState } from 'react';
import { Sun, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  userName?: string;
  onUserNameChange?: (name: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  userName = "Rajamma",
  onUserNameChange,
}) => {
  const [nameInput, setNameInput] = useState(userName);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNameInput(val);
    if (onUserNameChange) {
      onUserNameChange(val);
    }
  };

  const handleLoginClick = () => {
    if (onUserNameChange && nameInput.trim()) {
      onUserNameChange(nameInput.trim());
    }
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-6 text-gray-800 font-serif">
      {/* Container */}
      <div className="max-w-md w-full bg-[#FAF7F2] rounded-3xl p-8 md:p-12 border-2 border-[#E6DFC8] shadow-xl text-center flex flex-col items-center">
        {/* Soft Glowing Sun Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-200/50 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-[#FFF9E6] border-4 border-amber-300 flex items-center justify-center text-amber-500 shadow-md">
            <Sun className="w-14 h-14 fill-amber-400 stroke-amber-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#3D3A34] mb-2 tracking-tight font-serif">
          Welcome Home
        </h1>
        <p className="text-base text-[#6B655B] font-medium mb-6 max-w-xs leading-relaxed font-sans">
          Aura Senior AI Companion
        </p>

        {/* Name Input Field */}
        <div className="w-full text-left mb-6 font-sans">
          <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-teal-600" />
            <span>Enter Your Name / Senior's Name:</span>
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={handleNameChange}
            placeholder="e.g. Rajamma, Karthik, Savitri..."
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#D6CFC0] focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white font-bold text-gray-900 text-base outline-none shadow-2xs"
          />
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            The AI Companion will address you as <strong className="text-teal-700">"{nameInput || 'User'}"</strong>
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          onClick={handleLoginClick}
          className="w-full h-14 bg-white hover:bg-gray-50 active:scale-[0.98] border-2 border-[#D6CFC0] rounded-2xl shadow-md flex items-center justify-center gap-4 text-gray-800 font-bold text-lg transition-all cursor-pointer hover:shadow-lg active:shadow-inner"
        >
          {/* Google 'G' SVG Logo */}
          <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-sans font-bold">Sign in as {nameInput || 'User'}</span>
        </button>

        <p className="text-sm text-gray-400 mt-8 font-sans font-medium">
          Protected by Aura Safety Network • Easy One-Tap Access
        </p>
      </div>
    </div>
  );
};
