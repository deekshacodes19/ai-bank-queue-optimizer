'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function ToastNotifications() {
  const { notifications, removeToast } = useQueue();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const getStyle = () => {
          switch (n.type) {
            case 'success':
              return {
                bg: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
                bar: 'bg-emerald-500',
              };
            case 'warning':
              return {
                bg: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
                icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
                bar: 'bg-amber-500',
              };
            case 'error':
              return {
                bg: 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10',
                icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
                bar: 'bg-rose-500',
              };
            case 'info':
            default:
              return {
                bg: 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10',
                icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
                bar: 'bg-blue-500',
              };
          }
        };

        const style = getStyle();

        return (
          <div
            key={n.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${style.bg}`}
          >
            {style.icon}
            <div className="flex-1 pr-2">
              <h5 className="font-bold text-xs text-slate-900 tracking-tight">{n.title}</h5>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{n.message}</p>
            </div>
            <button
              onClick={() => removeToast(n.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
