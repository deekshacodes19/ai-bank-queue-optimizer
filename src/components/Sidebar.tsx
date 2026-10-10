'use client';

import React from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  Layers,
  Sparkles,
  FileText,
  Settings,
  Landmark,
  Brain,
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { NavTab } from '@/types/queue';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useQueue();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'queue',
      label: 'Queue Management',
      icon: <ListOrdered className="w-5 h-5" />,
      badge: 'Live',
    },
    {
      id: 'counters',
      label: 'Counter Allocation',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'predictions',
      label: 'AI Predictions',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#0a1838] text-white flex flex-col shrink-0 min-h-screen border-r border-[#122452] shadow-xl select-none z-20">
      {/* Brand Header */}
      <div className="p-6 pb-8 border-b border-[#142858]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight flex items-center gap-1 text-white">
              BankQueue <span className="text-[#38bdf8]">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-normal tracking-wide">
              Smarter Queues, Happier Customers.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                isActive
                  ? 'bg-[#1e40af] text-white shadow-md shadow-blue-900/40 translate-x-1'
                  : 'text-slate-300 hover:text-white hover:bg-[#132758]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom AI Powered Card */}
      <div className="p-4 m-3 mb-6 rounded-2xl bg-gradient-to-b from-[#112454] to-[#0d1c44] border border-[#1b3474]/50 shadow-inner">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide">AI Powered</h4>
            <p className="text-[11px] text-slate-300/80 leading-snug mt-0.5">
              Predicting. Optimizing. Improving your service.
            </p>
          </div>
        </div>
        {/* Decorative Wave Graphic */}
        <div className="mt-3 pt-2 border-t border-blue-900/30">
          <svg className="w-full h-5 text-blue-400/40" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path
              d="M0,10 C20,18 35,2 50,10 C65,18 80,2 100,10 L100,20 L0,20 Z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M0,10 C20,18 35,2 50,10 C65,18 80,2 100,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </aside>
  );
}
