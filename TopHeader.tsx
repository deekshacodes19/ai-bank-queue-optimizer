'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Bell, ChevronDown, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function TopHeader() {
  const { notifications, resetDemoData } = useQueue();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('Tue, 28 Oct 2025 | 10:24 AM');

  // Real-time clock formatted cleanly
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(`${dateStr} | ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
      {/* Left: Greeting */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-500 shadow-sm">
          <Sun className="w-5 h-5 text-amber-500 fill-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Good Morning, Admin!
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Here&apos;s what&apos;s happening at your bank today.
          </p>
        </div>
      </div>

      {/* Right: Date, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Date / Time Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="Activity Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Queue Activity
                </span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Recent
                </span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No recent queue actions recorded yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 text-xs transition-colors"
                    >
                      <div className="flex items-center justify-between text-slate-700 font-semibold mb-0.5">
                        <span className="flex items-center gap-1.5">
                          {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          {n.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#0a1838] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-blue-100">
              A
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">Admin</div>
              <div className="text-[10px] text-slate-500 font-medium">Branch Manager</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <p className="font-semibold text-slate-800">Branch Manager</p>
                <p className="text-[11px] text-slate-400">admin@bankqueue.ai</p>
              </div>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 rounded-xl mt-1 text-left font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
