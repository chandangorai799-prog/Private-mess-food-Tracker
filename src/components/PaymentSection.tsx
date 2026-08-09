import React, { useState } from 'react';
import { PaymentMethod, PaymentRecord } from '../types';
import {
  formatDateKey,
  formatMonthKey,
  formatStringDateToIndian,
} from '../utils/dateUtils';
import { Plus, CreditCard, Trash2, Edit2, Check, X, Calendar, DollarSign, Wallet } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface PaymentSectionProps {
  selectedYear: number;
  selectedMonth: number;
  payments: PaymentRecord[];
  onAddPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onEditPayment: (payment: PaymentRecord) => void;
  onDeletePayment: (paymentId: string) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedYear,
  selectedMonth,
  payments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
}) => {
  const currentMonthKey = formatMonthKey(selectedYear, selectedMonth);
  const todayStr = formatDateKey(new Date());

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState<string>('');

  // Editing State
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  // Deleting State (Confirmation Modal)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter payments for current month
  const monthPayments = payments.filter((p) => p.monthKey === currentMonthKey);
  const totalMonthPaid = monthPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // Calculate month key for the selected payment date
    const dateParts = date.split('-');
    const pYear = parseInt(dateParts[0], 10);
    const pMonth = parseInt(dateParts[1], 10) - 1;
    const pMonthKey = formatMonthKey(pYear, pMonth);

    if (editingPayment) {
      onEditPayment({
        ...editingPayment,
        amount: numAmount,
        date,
        monthKey: pMonthKey,
        method,
        note: note.trim() || undefined,
        formattedDate: formatStringDateToIndian(date),
      });
      setEditingPayment(null);
    } else {
      onAddPayment({
        amount: numAmount,
        date,
        monthKey: pMonthKey,
        method,
        note: note.trim() || undefined,
        formattedDate: formatStringDateToIndian(date),
      });
    }

    // Reset Form
    setAmount('');
    setDate(todayStr);
    setMethod('UPI');
    setNote('');
  };

  const startEdit = (p: PaymentRecord) => {
    setEditingPayment(p);
    setAmount(p.amount.toString());
    setDate(p.date);
    setMethod(p.method);
    setNote(p.note || '');
  };

  const cancelEdit = () => {
    setEditingPayment(null);
    setAmount('');
    setDate(todayStr);
    setMethod('UPI');
    setNote('');
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <CreditCard className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white uppercase tracking-tight">
              Payment Record
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Log payments made to mess owner
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Month Total Paid</span>
          <span className="text-base font-black text-sky-400">
            ₹{totalMonthPaid.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Add / Edit Payment Form */}
      <form onSubmit={handleSubmit} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>{editingPayment ? 'Edit Payment Entry' : 'Add New Payment'}</span>
          {editingPayment && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Amount Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Amount Paid (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly payment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {editingPayment ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingPayment ? 'Update Payment' : 'Add Payment'}
          </button>
        </div>
      </form>

      {/* Payment History List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-sky-400" />
          Payment History ({monthPayments.length})
        </h4>

        {monthPayments.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No payments recorded yet for this month.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
            {monthPayments.map((p) => (
              <div
                key={p.id}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0">
                    ₹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-base">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p.method}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                      <span>{p.formattedDate || formatStringDateToIndian(p.date)}</span>
                      {p.note && <span className="text-slate-500">• {p.note}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Payment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(p.id)}
                    className="p-1.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Delete Payment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deleting Payment */}
      <ConfirmationModal
        isOpen={deletingId !== null}
        title="Delete Payment Entry?"
        message="Are you sure you want to delete this payment record? Your monthly remaining balance will automatically update."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => {
          if (deletingId) {
            onDeletePayment(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </section>
  );
};
