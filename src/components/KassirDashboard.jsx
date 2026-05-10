import React, { useEffect, useState } from "react";
import { Clock, ShoppingCart, TrendingUp, RefreshCw } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function ShiftModal({ open, shift, onClose, onSave, saving }) {
  const [totals, setTotals] = useState({
    total_sales: 0,
    naqt: 0,
    plastik: 0,
    click: 0,
    nasiya: 0,
    transaction_count: 0,
    profit: 0,
  });

  useEffect(() => {
    if (open && shift) {
      setTotals({
        total_sales: shift.total_sales || 0,
        naqt: shift.naqt || 0,
        plastik: shift.plastik || 0,
        click: shift.click || 0,
        nasiya: shift.nasiya || 0,
        transaction_count: shift.transaction_count || 0,
        profit: shift.profit || 0,
      });
    }
  }, [open, shift]);

  if (!open || !shift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-lg overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">Smena</p>
            <h2 className="text-xl font-bold text-[#003366]">Smena yopish</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">Yopish</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm text-[#003366]/70">Smena boshlanish</p>
            <p className="font-semibold text-[#003366]">{new Date(shift.started_at).toLocaleString("uz-UZ")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[8px] bg-[#003366] px-4 py-3 text-[#F5DEB3]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#F5DEB3]/70">Jami tushum</p>
              <p className="text-xl font-bold">{formatMoney(totals.total_sales)}</p>
            </div>
            <div className="rounded-[8px] bg-[#2E7D32] px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Foyda</p>
              <p className="text-xl font-bold">{formatMoney(totals.profit)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2 text-center">
              <p className="text-xs text-[#003366]/60">Naqt</p>
              <p className="font-semibold text-[#2E7D32]">{formatMoney(totals.naqt)}</p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2 text-center">
              <p className="text-xs text-[#003366]/60">Karta</p>
              <p className="font-semibold text-[#003366]">{formatMoney(totals.plastik)}</p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2 text-center">
              <p className="text-xs text-[#003366]/60">Click</p>
              <p className="font-semibold text-[#E65100]">{formatMoney(totals.click)}</p>
            </div>
          </div>
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium text-[#003366]">Tranzaksiyalar</span>
            <span className="text-lg font-bold text-[#003366]">{totals.transaction_count}</span>
          </div>
        </div>
        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button type="button" onClick={() => onSave(shift.id, totals)} disabled={saving} className="btn-success flex-1">
            {saving ? "Saqlanmoqda..." : "Smena yopish"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">Bekor</button>
        </div>
      </div>
    </div>
  );
}

export default function KassirDashboard({ user, onLogout }) {
  const [summary, setSummary] = useState({
    totalSales: 0,
    transactionCount: 0,
    paymentStats: { naqt: 0, karta: 0, click: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [shiftModal, setShiftModal] = useState({ open: false, shift: null });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, openShift] = await Promise.all([
        window.abidin.getTodaySummary(),
        window.abidin.getOpenShift(),
      ]);
      setSummary(summaryData);
      if (openShift) {
        setShiftModal({ open: true, shift: openShift });
      }
    } catch (error) {
      setNotice(error.message || "Ma'lumotlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openShiftModal = async () => {
    try {
      const openShift = await window.abidin.getOpenShift();
      if (openShift) {
        setShiftModal({ open: true, shift: openShift });
      } else {
        setNotice("Ochiq smena topilmadi");
      }
    } catch (error) {
      setNotice("Smena ma'lumotlarini olishda xatolik");
    }
  };

  const closeShiftModal = () => {
    setShiftModal({ open: false, shift: null });
  };

  const saveShift = async (shiftId, totals) => {
    setSaving(true);
    try {
      await window.abidin.closeShift(shiftId, totals);
      setNotice("Smena muvaffaqiyatli yopildi");
      closeShiftModal();
    } catch (error) {
      setNotice("Smena yopishda xatolik: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">Kassir paneli</p>
            <h2 className="text-2xl font-bold text-[#003366]">Xush kelibsiz, {user?.username}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={loadData} className="btn-ghost">
              <RefreshCw size={16} /> Yangilash
            </button>
            <button type="button" onClick={onLogout} className="btn-ghost">
              Chiqish
            </button>
          </div>
        </div>
        {notice ? (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Bugungi tushum</p>
              <p className="mt-2 text-3xl font-bold text-[#003366]">{formatMoney(summary.totalSales)}</p>
              <p className="text-sm text-[#003366]/70">so'm</p>
            </div>
            <TrendingUp className="text-[#2E7D32]" size={32} />
          </div>
        </div>
        <div className="panel px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Tranzaksiyalar</p>
              <p className="mt-2 text-3xl font-bold text-[#003366]">{summary.transactionCount}</p>
              <p className="text-sm text-[#003366]/70">ta</p>
            </div>
            <ShoppingCart className="text-[#003366]" size={32} />
          </div>
        </div>
        <div className="panel px-5 py-6 flex flex-col justify-center">
          <button type="button" onClick={openShiftModal} className="btn-success w-full py-4 text-lg">
            <Clock size={20} /> Smena tugatish
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#2E7D32]"></div>
            <p className="text-xs font-semibold text-[#003366]">Naqt</p>
          </div>
          <p className="text-xl font-bold text-[#2E7D32]">{formatMoney(summary.paymentStats?.naqt || 0)}</p>
        </div>
        <div className="panel px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#003366]"></div>
            <p className="text-xs font-semibold text-[#003366]">Karta</p>
          </div>
          <p className="text-xl font-bold text-[#003366]">{formatMoney(summary.paymentStats?.karta || 0)}</p>
        </div>
        <div className="panel px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#E65100]"></div>
            <p className="text-xs font-semibold text-[#003366]">Click</p>
          </div>
          <p className="text-xl font-bold text-[#E65100]">{formatMoney(summary.paymentStats?.click || 0)}</p>
        </div>
      </section>

      <section className="panel px-5 py-8 text-center">
        <p className="text-[#003366]/60">Kassir rejimida ishlayapsiz</p>
        <p className="mt-2 text-sm text-[#003366]/50">To'liq hisobotlar uchun admin bilan bog'laning</p>
      </section>

      <ShiftModal
        open={shiftModal.open}
        shift={shiftModal.shift}
        onClose={closeShiftModal}
        onSave={saveShift}
        saving={saving}
      />
    </div>
  );
}