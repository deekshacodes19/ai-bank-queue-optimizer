'use client';

import React, { useState } from 'react';
import {
  X,
  Ticket,
  User,
  Phone,
  FileText,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';
import { Priority, ServiceType } from '@/types/queue';

const SUPPORTED_SERVICES: { type: ServiceType; desc: string; icon: string }[] = [
  { type: 'Account Opening', desc: 'New Savings/Current accounts & KYC', icon: '🏦' },
  { type: 'Cash Deposit', desc: 'Cash & cheque deposit service', icon: '💵' },
  { type: 'Cash Withdrawal', desc: 'Instant cash payout & slips', icon: '🏧' },
  { type: 'Passbook Update', desc: 'Print statements & passbook updates', icon: '📖' },
  { type: 'Fixed Deposit', desc: 'Term deposit investment & renewal', icon: '📈' },
  { type: 'Loan Enquiry', desc: 'Personal, home & auto loan consultations', icon: '🤝' },
];

const PRIORITIES: { value: Priority; label: string; desc: string; badgeColor: string }[] = [
  {
    value: 'Regular',
    label: 'Standard Queue',
    desc: 'General customer queue',
    badgeColor: 'border-slate-300 text-slate-700 peer-checked:border-blue-600 peer-checked:bg-blue-50/50',
  },
  {
    value: 'VIP',
    label: 'VIP Customer',
    desc: 'Priority expedited service',
    badgeColor: 'border-purple-200 text-purple-700 peer-checked:border-purple-600 peer-checked:bg-purple-50/50',
  },
  {
    value: 'Senior Citizen',
    label: 'Senior Citizen',
    desc: 'Elderly priority support',
    badgeColor: 'border-teal-200 text-teal-700 peer-checked:border-teal-600 peer-checked:bg-teal-50/50',
  },
  {
    value: 'Differently Abled',
    label: 'Special Assistance',
    desc: 'Wheelchair / accessible service',
    badgeColor: 'border-indigo-200 text-indigo-700 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50',
  },
];

export default function GenerateTokenModal() {
  const { isTokenModalOpen, setIsTokenModalOpen, generateToken, counters } = useQueue();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Account Opening');
  const [priority, setPriority] = useState<Priority>('Regular');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTokenModalOpen) return null;

  // Determine which counter will be suggested
  const suggestedCounter = counters.find(
    (c) => c.supportedServices.includes(serviceType) && c.status !== 'On Break'
  ) || counters[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter a valid customer name (at least 2 characters).');
      return;
    }

    setIsSubmitting(true);
    const result = generateToken({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceType,
      priority,
      notes: notes.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      // Reset form and close dialog
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setPriority('Regular');
      setServiceType('Account Opening');
      setIsTokenModalOpen(false);
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0a1838] to-[#122858] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Generate Customer Token</h3>
              <p className="text-xs text-slate-300">Issue queue token with smart counter routing</p>
            </div>
          </div>
          <button
            onClick={() => setIsTokenModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Service Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Service Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_SERVICES.map((srv) => (
                <button
                  type="button"
                  key={srv.type}
                  onClick={() => setServiceType(srv.type)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
                    serviceType === srv.type
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-700'
                  }`}
                >
                  <span className="text-base shrink-0">{srv.icon}</span>
                  <div>
                    <span className="text-xs font-bold block leading-tight">{srv.type}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{srv.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map((p) => (
                <label
                  key={p.value}
                  className="relative flex items-center p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/60"
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={priority === p.value}
                    onChange={() => setPriority(p.value)}
                    className="sr-only"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{p.label}</span>
                    <span className="text-[10px] text-slate-400">{p.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notes / Account Ref <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP Card Holder"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Auto Counter Routing Preview */}
          <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">
                Auto-assigned to: <strong className="text-slate-800 font-semibold">{suggestedCounter.name}</strong> ({suggestedCounter.specialization})
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Optimal Route
            </span>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsTokenModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Ticket className="w-4 h-4" />
              <span>Generate & Issue Token</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
