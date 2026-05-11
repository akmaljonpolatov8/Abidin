import React, { useEffect, useState } from "react";
import { Plus, Search, X, DollarSign, Phone, User, CreditCard } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatDate(dateStr) {
  if (!dateStr) return "Yo'q";
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugun";
  if (diffDays === 1) return "1 kun oldin";
  if (diffDays < 7) return `${diffDays} kun oldin`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
  return date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getDaysOld(dateStr) {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

// Modal: Yangi Nasiya
function NewCreditModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState({ name: "", phone: "", amount: "", note: "" });

  useEffect(() => {
    if (open) setForm({ name: "", phone: "", amount: "", note: "" });
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form.name.trim(), form.phone.trim(), Number(form.amount) || 0, form.note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#F5DEB3] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#003366]/60">Nasiya</p>
            <h2 className="text-xl font-bold text-[#003366]">Yangi nasiya</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#003366]/10 rounded-lg">
            <X size={20} className="text-[#003366]" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#003366] mb-2">
              Mijoz ismi <span className="text-[#C62828]">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              placeholder="Jasur Toshmatov"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#003366] mb-2">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#003366] mb-2">Birinchi qarz (so'm)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#003366] mb-2">Izoh (ixtiyoriy)</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              placeholder="Nima uchun qarz..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="flex-1 bg-[#2E7D32] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {saving ? "Saqlanmoqda..." : "Yaratish"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] text-[#003366] hover:bg-[#003366]/5 font-medium"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: Qarz qo'shish
function AddDebtModal({ open, credit, onClose, onSave, saving }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) { setAmount(""); setNote(""); }
  }, [open]);

  if (!open || !credit) return null;

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;
    onSave(Number(amount), note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#F5DEB3] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#003366]/60">Qarz</p>
            <h2 className="text-xl font-bold text-[#003366]">Qarz qo'shish</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#003366]/10 rounded-lg">
            <X size={20} className="text-[#003366]" />
          </button>
        </div>

        <div className="rounded-lg bg-white/70 p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-[#003366]">
                {credit.customerCode} {credit.customerName}
              </p>
              <p className="text-sm text-[#003366]/60">{credit.customerPhone || "Telefon yo'q"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#003366]/60">Joriy qarz</p>
              <p className="text-lg font-bold text-[#C62828]">{formatMoney(credit.remaining)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#003366] mb-2">Miqdor (so'm)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#003366] mb-2">Nima oldi?</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              placeholder="Mahsulot yoki izoh..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving || !amount || Number(amount) <= 0}
            className="flex-1 bg-[#003366] text-[#F5DEB3] py-3 px-4 rounded-lg font-semibold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saqlanmoqda..." : "Qarz qo'shish"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] text-[#003366] hover:bg-[#003366]/5 font-medium"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: To'lov qabul qilish (Summa va Foiz tablar bilan)
function PaymentModal({ open, credit, onClose, onSave, saving }) {
  const [tab, setTab] = useState("summa");
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState("");

  useEffect(() => {
    if (open && credit) {
      setAmount("");
      setPercentage("");
      setTab("summa");
    }
  }, [open, credit]);

  if (!open || !credit) return null;

  const currentDebt = credit.remaining || 0;

  const handlePercentageChange = (val) => {
    setPercentage(val);
    if (val && currentDebt > 0) {
      const calcAmount = Math.round(currentDebt * (Number(val) / 100));
      setAmount(String(calcAmount));
    }
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    if (val && currentDebt > 0) {
      const pct = (Number(val) / currentDebt) * 100;
      if (pct <= 100) setPercentage(pct.toFixed(1));
      else setPercentage("");
    }
  };

  const remainingAfter = currentDebt - (Number(amount) || 0);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0 || Number(amount) > currentDebt) return;
    onSave(Number(amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#F5DEB3] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#003366]/60">To'lov</p>
            <h2 className="text-xl font-bold text-[#003366]">To'lov qabul qilish</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#003366]/10 rounded-lg">
            <X size={20} className="text-[#003366]" />
          </button>
        </div>

        <div className="rounded-lg bg-white/70 p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-[#003366]">
                {credit.customerCode} {credit.customerName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#003366]/60">Joriy qarz</p>
              <p className="text-xl font-bold text-[#C62828]">{formatMoney(currentDebt)} so'm</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-[#003366]/10 p-1 mb-4">
          <button
            onClick={() => setTab("summa")}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition ${
              tab === "summa" ? "bg-[#003366] text-[#F5DEB3]" : "text-[#003366]/70"
            }`}
          >
            Summa
          </button>
          <button
            onClick={() => setTab("foiz")}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition ${
              tab === "foiz" ? "bg-[#003366] text-[#F5DEB3]" : "text-[#003366]/70"
            }`}
          >
            Foiz
          </button>
        </div>

        <div className="space-y-4">
          {tab === "summa" ? (
            <div>
              <label className="block text-sm font-semibold text-[#003366] mb-2">To'lov miqdori (so'm)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                placeholder="0"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-[#003366] mb-2">Foiz (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => handlePercentageChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                placeholder="0"
              />
              {percentage && (
                <p className="text-sm text-[#003366]/70 mt-1">
                  Hisoblangan: {formatMoney(Number(amount))} so'm
                </p>
              )}
            </div>
          )}

          {amount && Number(amount) > 0 && (
            <div className="rounded-lg bg-[#2E7D32]/10 border border-[#2E7D32]/20 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#003366]">To'lov:</span>
                <span className="font-bold text-[#2E7D32]">+{formatMoney(amount)} so'm</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-[#003366]">Qoladi:</span>
                <span className="font-bold text-[#C62828]">{formatMoney(remainingAfter)} so'm</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving || !amount || Number(amount) <= 0 || Number(amount) > currentDebt}
            className="flex-1 bg-[#2E7D32] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <DollarSign size={18} />
            {saving ? "Saqlanmoqda..." : "To'lov qabul qilish"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] text-[#003366] hover:bg-[#003366]/5 font-medium"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}

// Debtor Detail Modal
function CreditDetailModal({ open, credit, transactions, onClose, onPayment, onAddDebt, saving }) {
  const [showPayment, setShowPayment] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);

  if (!open || !credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-[#F5DEB3] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[rgba(0,51,102,0.1)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-lg font-bold text-[#003366]">{credit.customerCode}</span>
                <span className="text-xl font-bold text-[#003366]">{credit.customerName}</span>
              </div>
              {credit.customerPhone && (
                <div className="flex items-center gap-2 text-[#003366]/70">
                  <Phone size={14} />
                  <span>{credit.customerPhone}</span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#003366]/10 rounded-lg">
              <X size={24} className="text-[#003366]" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-[#003366]/60">JAMI QARZ</p>
            <p className="text-3xl font-bold text-[#C62828]">{formatMoney(credit.remaining)} so'm</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={() => setShowAddDebt(true)}
            disabled={saving}
            className="flex-1 bg-[#003366] text-[#F5DEB3] py-3 px-4 rounded-lg font-semibold hover:bg-[#002244] flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Qarz qo'shish
          </button>
          <button
            onClick={() => setShowPayment(true)}
            disabled={saving || credit.remaining <= 0}
            className="flex-1 bg-[#2E7D32] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1B5E20] flex items-center justify-center gap-2"
          >
            <DollarSign size={18} />
            To'lov qabul qilish
          </button>
        </div>

        {/* Transaction History Table */}
        <div className="px-6 pb-6">
          <h3 className="font-semibold text-[#003366] mb-3">Tranzaksiyalar tarixi</h3>
          <div className="overflow-x-auto rounded-lg border border-[rgba(0,51,102,0.1)]">
            <table className="w-full text-sm">
              <thead className="bg-[#003366]/5">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-[#003366]">Sana</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#003366]">Turi</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#003366]">Summa</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#003366]">Qoldiq</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? (
                  transactions.slice().reverse().map((t) => (
                    <tr key={t.id} className="border-t border-[rgba(0,51,102,0.1)]">
                      <td className="px-4 py-2 text-[#003366]">
                        {new Date(t.createdAt).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          t.type === "payment" ? "bg-[#2E7D32]/15 text-[#2E7D32]" : "bg-[#C62828]/15 text-[#C62828]"
                        }`}>
                          {t.type === "payment" ? "To'lov" : "Qarz oldi"}
                        </span>
                      </td>
                      <td className={`px-4 py-2 text-right font-semibold ${
                        t.type === "payment" ? "text-[#2E7D32]" : "text-[#C62828]"
                      }`}>
                        {t.type === "payment" ? "+" : "-"}{formatMoney(t.amount)}
                      </td>
                      <td className="px-4 py-2 text-right text-[#003366]/70">
                        {formatMoney(t.balanceAfter)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[#003366]/50">
                      Tranzaksiyalar yo'q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showPayment && (
          <PaymentModal
            open={true}
            credit={credit}
            onClose={() => setShowPayment(false)}
            onSave={onPayment}
            saving={saving}
          />
        )}
        {showAddDebt && (
          <AddDebtModal
            open={true}
            credit={credit}
            onClose={() => setShowAddDebt(false)}
            onSave={onAddDebt}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

export default function Nasiya() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const loadCredits = async () => {
    setLoading(true);
    try {
      const list = await window.abidin.getCreditList();
      setCredits(list.filter(c => c.status === "active"));
    } catch (error) {
      setNotice(error.message || "Nasiyalar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (creditId) => {
    try {
      const txs = await window.abidin.getCreditTransactions(creditId);
      setTransactions(txs);
    } catch (error) {
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const openDetail = async (credit) => {
    setSelectedCredit(credit);
    await loadTransactions(credit.id);
  };

  const closeDetail = () => {
    setSelectedCredit(null);
    setTransactions([]);
  };

  const handleCreateNew = async (name, phone, amount, note) => {
    setSaving(true);
    try {
      const newCredit = await window.abidin.createNewCredit(name, phone, amount, note);
      setNotice("Yangi nasiya yaratildi");
      setShowNewModal(false);
      await loadCredits();
      openDetail(newCredit);
    } catch (error) {
      setNotice(error.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = async (amount) => {
    if (!selectedCredit || saving) return;
    setSaving(true);
    setNotice("");
    try {
      await window.abidin.addCreditPayment(selectedCredit.id, amount);
      const updated = await window.abidin.getCreditById(selectedCredit.id);
      setSelectedCredit(updated);
      await loadTransactions(selectedCredit.id);
      await loadCredits();
      setNotice("To'lov qabul qilindi");
    } catch (error) {
      setNotice(error.message || "To'lovda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDebt = async (amount, note) => {
    if (!selectedCredit || saving) return;
    setSaving(true);
    setNotice("");
    try {
      await window.abidin.addCreditDebt(selectedCredit.id, amount, note);
      const updated = await window.abidin.getCreditById(selectedCredit.id);
      setSelectedCredit(updated);
      await loadTransactions(selectedCredit.id);
      await loadCredits();
      setNotice("Yangi qarz qo'shildi");
    } catch (error) {
      setNotice(error.message || "Xatolik");
    } finally {
      setSaving(false);
    }
  };

  const activeCredits = credits.filter(c => c.status === "active");
  const totalRemaining = activeCredits.reduce((sum, c) => sum + (c.remaining || 0), 0);

  const filteredCredits = credits.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.customerName?.toLowerCase().includes(query) ||
      c.customerPhone?.includes(query) ||
      c.customerCode?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-xl bg-[#F5DEB3] p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#003366]/60">
              Nasiya boshqaruvi
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">Nasiya va qarzlar</h2>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-[#2E7D32] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1B5E20] flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            Yangi nasiya
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#003366]/50" size={20} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidirish: ID (#0056), nomi yoki telefon..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
          />
        </div>

        {notice && (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") || notice.includes("emas") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        )}
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#F5DEB3] p-5 shadow-md">
          <p className="text-xs uppercase tracking-widest text-[#003366]/60">Faol nasiyalar</p>
          <p className="mt-2 text-3xl font-bold text-[#003366]">{activeCredits.length}</p>
        </div>
        <div className="rounded-xl bg-[#F5DEB3] p-5 shadow-md">
          <p className="text-xs uppercase tracking-widest text-[#003366]/60">Jami qarz</p>
          <p className="mt-2 text-3xl font-bold text-[#C62828]">{formatMoney(totalRemaining)} so'm</p>
        </div>
        <div className="rounded-xl bg-[#F5DEB3] p-5 shadow-md">
          <p className="text-xs uppercase tracking-widest text-[#003366]/60">Eski (7+ kun)</p>
          <p className="mt-2 text-3xl font-bold text-[#C62828]">
            {activeCredits.filter(c => getDaysOld(c.createdAt) > 7).length}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-xl bg-[#F5DEB3] p-10 text-center text-[#003366]/70">
            Yuklanmoqda...
          </div>
        ) : filteredCredits.length === 0 ? (
          <div className="col-span-full rounded-xl bg-[#F5DEB3] p-10 text-center text-[#003366]/70">
            Nasiyalar yo'q. "Yangi nasiya" tugmasini bosing.
          </div>
        ) : (
          filteredCredits.map((credit) => {
            const daysOld = getDaysOld(credit.createdAt);
            const isOld = daysOld > 7;
            return (
              <div
                key={credit.id}
                onClick={() => openDetail(credit)}
                className={`cursor-pointer rounded-xl bg-[#F5DEB3] p-5 shadow-md transition hover:shadow-lg ${
                  isOld ? "border-2 border-[#C62828]" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#003366]">{credit.customerCode}</span>
                    </div>
                    <p className="font-semibold text-[#003366]">{credit.customerName}</p>
                    {credit.customerPhone && (
                      <p className="text-sm text-[#003366]/70 flex items-center gap-1 mt-1">
                        <Phone size={12} /> {credit.customerPhone}
                      </p>
                    )}
                  </div>
                  {isOld && (
                    <span className="bg-[#C62828]/15 text-[#C62828] px-2 py-1 rounded text-xs font-medium">
                      Eski
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-xs text-[#003366]/60">Qarz</p>
                  <p className="text-2xl font-bold text-[#C62828]">-{formatMoney(credit.remaining)} so'm</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#003366]/50">Oxirgi: {formatDate(credit.createdAt)}</p>
                  <div className="flex gap-2">
                    <span className="text-sm text-[#003366] font-medium">Ko'rish</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <NewCreditModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleCreateNew}
        saving={saving}
      />

      <CreditDetailModal
        open={Boolean(selectedCredit)}
        credit={selectedCredit}
        transactions={transactions}
        onClose={closeDetail}
        onPayment={handlePayment}
        onAddDebt={handleAddDebt}
        saving={saving}
      />
    </div>
  );
}