'use client';

import React from 'react';
import { X, Printer, Landmark } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function TokenSlipModal() {
  const {
    isTokenSlipModalOpen,
    setIsTokenSlipModalOpen,
    lastGeneratedToken,
    selectedToken,
    setSelectedToken,
  } = useQueue();

  const token = selectedToken || lastGeneratedToken;

  if (!isTokenSlipModalOpen || !token) return null;

  const handleClose = () => {
    setIsTokenSlipModalOpen(false);
    setSelectedToken(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Printable Ticket Area */}
        <div id="printable-token-slip" className="p-6 bg-white text-slate-800 text-center relative">
          {/* Close button (hidden on print) */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors print:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Bank Logo / Header */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#0a1838] text-white flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              BankQueue <span className="text-blue-600">AI</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Main Branch • Ground Floor</p>
          <p className="text-[10px] text-slate-400 mb-4">
            {new Date(token.createdAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            |{' '}
            {new Date(token.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {/* Dotted Divider */}
          <div className="border-b-2 border-dashed border-slate-200 my-3"></div>

          {/* Token Number Display */}
          <div className="py-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              YOUR TOKEN NUMBER
            </span>
            <div className="text-4xl font-black text-slate-900 tracking-tight my-1 text-blue-600">
              {token.tokenNumber}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <span>{token.serviceType}</span>
            </div>
          </div>

          {/* Ticket Details Box */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold text-slate-800">{token.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assigned Window:</span>
              <span className="font-bold text-blue-600">{token.assignedCounter}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Est. Waiting Time:</span>
              <span className="font-bold text-slate-800">~{token.waitingTime} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Priority Level:</span>
              <span className="font-bold text-purple-700">{token.priority}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Status:</span>
              <span className="font-bold text-amber-600">{token.status}</span>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="border-b-2 border-dashed border-slate-200 my-4"></div>

          {/* Barcode Mockup */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="flex items-center gap-1 tracking-widest text-[9px] text-slate-400 mb-1 font-mono">
              *{token.tokenNumber}*
            </div>
            {/* SVG barcode graphic */}
            <svg className="h-8 w-48 text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
              <rect x="0" y="0" width="2" height="20" fill="currentColor" />
              <rect x="4" y="0" width="1" height="20" fill="currentColor" />
              <rect x="7" y="0" width="3" height="20" fill="currentColor" />
              <rect x="12" y="0" width="1" height="20" fill="currentColor" />
              <rect x="15" y="0" width="4" height="20" fill="currentColor" />
              <rect x="21" y="0" width="2" height="20" fill="currentColor" />
              <rect x="25" y="0" width="1" height="20" fill="currentColor" />
              <rect x="28" y="0" width="3" height="20" fill="currentColor" />
              <rect x="33" y="0" width="2" height="20" fill="currentColor" />
              <rect x="37" y="0" width="1" height="20" fill="currentColor" />
              <rect x="40" y="0" width="4" height="20" fill="currentColor" />
              <rect x="46" y="0" width="2" height="20" fill="currentColor" />
              <rect x="50" y="0" width="1" height="20" fill="currentColor" />
              <rect x="53" y="0" width="3" height="20" fill="currentColor" />
              <rect x="58" y="0" width="1" height="20" fill="currentColor" />
              <rect x="61" y="0" width="3" height="20" fill="currentColor" />
              <rect x="66" y="0" width="2" height="20" fill="currentColor" />
              <rect x="70" y="0" width="1" height="20" fill="currentColor" />
              <rect x="73" y="0" width="4" height="20" fill="currentColor" />
              <rect x="79" y="0" width="2" height="20" fill="currentColor" />
              <rect x="83" y="0" width="1" height="20" fill="currentColor" />
              <rect x="86" y="0" width="3" height="20" fill="currentColor" />
              <rect x="91" y="0" width="2" height="20" fill="currentColor" />
              <rect x="95" y="0" width="2" height="20" fill="currentColor" />
              <rect x="99" y="0" width="1" height="20" fill="currentColor" />
            </svg>
          </div>

          <p className="text-[10px] text-slate-400 mt-2">
            Please watch the display screen for your token call. Thank you!
          </p>
        </div>

        {/* Modal Footer Controls (Print / Done) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Slip</span>
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all text-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
