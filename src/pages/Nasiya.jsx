import React, { useEffect, useState } from "react";
import { CreditCard, Phone, Plus, RefreshCw, User, Wallet, Search, X, DollarSign, FileText } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatDate(value) {
  if (!value) return "Yo'q";
  return new Date(value).toLocaleString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function PaymentModal({ open, credit, onClose, onSave, saving }) {
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState("");
  const [savingType, setSavingType] = useState("amount");

  useEffect(() => {
    if (open && credit) {
      setAmount(String(credit.remaining || 0));
      setPercentage("");
      setSavingType("amount");
    }
  }, [open, credit]);

  const handlePercentageChange = (val) => {
    setPercentage(val);
    if (credit && val) {
      const pct = parseFloat(val) / 100;
      const calcAmount = Math.round(credit.remaining * pct);
      setAmount(String(calcAmount));
    }
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    if (credit && val) {
      const pct = (parseFloat(val) / credit.remaining) * 100;
      if (pct <= 100) {
        setPercentage(pct.toFixed(1));
      } else {
        setPercentage("");
      }
    }
  };

  if (!open || !credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              To'lov
            </p>
            <h2 className="text-xl font-bold text-[#003366]">Qisman to'lov</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#003366]">
                  {credit.customerCode && <span className="text-[#003366]/50 mr-2">{credit.customerCode}</span>}
                  {credit.customerName}
                </p>
                {credit.customerPhone && (
                  <p className="text-xs text-[#003366]/70">{credit.customerPhone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-[#003366]/60">Qolgan</p>
                <p className="text-lg font-bold text-[#C62828]">{formatMoney(credit.remaining)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/60">Jami</p>
              <p className="mt-1 text-lg font-bold text-[#003366]">
                {formatMoney(credit.totalAmount)} so'm
              </p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/60">To'langan</p>
              <p className="mt-1 text-lg font-bold text-[#2E7D32]">
                {formatMoney(credit.paidAmount)} so'm
              </p>
            </div>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">To'lov miqdori (so'm)</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="field"
              placeholder="0"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Yoki foizda (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentage}
              onChange={(e) => handlePercentageChange(e.target.value)}
              className="field"
              placeholder="0"
            />
          </label>

          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-[8px] bg-[#2E7D32]/10 border border-[#2E7D32]/20 px-4 py-3">
              <p className="text-sm text-[#003366]">
                To'lov: <span className="font-bold">+{formatMoney(amount)} so'm</span>
              </p>
              <p className="text-xs text-[#003366]/70 mt-1">
                Qoladi: {formatMoney(credit.remaining - parseFloat(amount || 0))} so'm
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button
            type="button"
            onClick={() => onSave(Number(amount))}
            disabled={saving || !amount || parseFloat(amount) <= 0}
            className="btn-success"
          >
            <DollarSign size={16} /> {saving ? "Saqlanmoqda..." : "To'lov qabul qilish"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDebtModal({ open, credit, onClose, onSave, saving, products }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (open && credit) {
      setAmount("");
      setNote("");
      setSearchTerm("");
      setSelectedProduct(null);
    }
  }, [open, credit]);

  const filteredProducts = products?.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  ) || [];

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setAmount(String(product.price || 0));
    setNote(product.name);
  };

  if (!open || !credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Nasiya
            </p>
            <h2 className="text-xl font-bold text-[#003366]">Yangi qarz</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-[#003366]">
              {credit.customerCode && <span className="text-[#003366]/50 mr-2">{credit.customerCode}</span>}
              {credit.customerName}
            </p>
            <p className="text-xs text-[#003366]/70">Joriy qarz: {formatMoney(credit.remaining)} so'm</p>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Mahsulot qidirish</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/50" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field pl-9"
                placeholder="Nomi yoki barcode..."
              />
            </div>
            {searchTerm && filteredProducts.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white">
                {filteredProducts.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProductSelect(p)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#003366]/5"
                  >
                    <span className="font-medium text-[#003366]">{p.name}</span>
                    <span className="text-[#003366]/60 ml-2">{formatMoney(p.price)} so'm</span>
                  </button>
                ))}
              </div>
            )}
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Miqdor (so'm)</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="field"
              placeholder="0"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Izoh</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="field"
              placeholder="Mahsulot nomi yoki izoh"
            />
          </label>
        </div>

        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button
            type="button"
            onClick={() => onSave(Number(amount), note)}
            disabled={saving || !amount || parseFloat(amount) <= 0}
            className="btn-primary"
          >
            <Plus size={16} /> {saving ? "Saqlanmoqda..." : "Qarz qo'shish"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

function CreditDetailModal({ open, credit, transactions, onClose, onPayment, onAddDebt, saving }) {
  const [showPayment, setShowPayment] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (open) {
      window.abidin.listProducts().then(setProducts).catch(() => setProducts([]));
    }
  }, [open]);

  if (!open || !credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Nasiya
            </p>
            <h2 className="text-xl font-bold text-[#003366]">
              {credit.customerCode && <span className="text-[#003366]/50 mr-2">{credit.customerCode}</span>}
              {credit.customerName}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: "70vh" }}>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-[8px] bg-[#003366] px-4 py-3 text-[#F5DEB3]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#F5DEB3]/70">Jami</p>
              <p className="text-xl font-bold">{formatMoney(credit.totalAmount)}</p>
            </div>
            <div className="rounded-[8px] bg-[#2E7D32] px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">To'langan</p>
              <p className="text-xl font-bold">{formatMoney(credit.paidAmount)}</p>
            </div>
            <div className="rounded-[8px] bg-[#C62828] px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Qolgan</p>
              <p className="text-xl font-bold">{formatMoney(credit.remaining)}</p>
            </div>
          </div>

          {credit.customerPhone && (
            <div className="mb-4 flex items-center gap-2 text-sm text-[#003366]/70">
              <Phone size={14} /> {credit.customerPhone}
            </div>
          )}

          <div className="mb-4 flex gap-3">
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              disabled={saving || credit.remaining <= 0}
              className="btn-success flex-1"
            >
              <DollarSign size={14} /> To'lov
            </button>
            <button
              type="button"
              onClick={() => setShowAddDebt(true)}
              className="btn-primary flex-1"
            >
              <Plus size={14} /> Yangi qarz
            </button>
          </div>

          <div className="border-t border-[rgba(0,51,102,0.12)] pt-4">
            <h3 className="mb-3 font-semibold text-[#003366]">Tarix</h3>
            <div className="space-y-2">
              {transactions && transactions.length > 0 ? (
                transactions.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between rounded-[8px] px-3 py-2 ${
                      t.type === "payment" ? "bg-[#2E7D32]/10" : "bg-[#C62828]/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        t.type === "payment" ? "text-[#2E7D32]" : "text-[#C62828]"
                      }`}>
                        {t.type === "payment" ? "To'lov" : "Qarz"}
                      </span>
                      <span className="text-xs text-[#003366]/60">
                        {formatDate(t.createdAt)}
                      </span>
                      {t.note && <span className="text-xs text-[#003366]/50">- {t.note}</span>}
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${
                        t.type === "payment" ? "text-[#2E7D32]" : "text-[#C62828]"
                      }`}>
                        {t.type === "payment" ? "+" : "-"}{formatMoney(t.amount)}
                      </span>
                      <span className="ml-2 text-xs text-[#003366]/50">
                        → {formatMoney(t.balanceAfter)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#003366]/50">Tranzaksiyalar yo'q</p>
              )}
            </div>
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
            products={products}
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
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCredits = async () => {
    setLoading(true);
    try {
      const list = await window.abidin.getCreditList();
      setCredits(list);
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

  const openCreditDetail = async (credit) => {
    setSelectedCredit(credit);
    await loadTransactions(credit.id);
  };

  const closeDetail = () => {
    setSelectedCredit(null);
    setTransactions([]);
  };

  const handlePayment = async (amount) => {
    if (!selectedCredit || saving) return;
    if (amount <= 0 || amount > selectedCredit.remaining) {
      setNotice("To'lov miqdori noto'g'ri");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      await window.abidin.addCreditPayment(selectedCredit.id, amount);
      setNotice("To'lov qabul qilindi");
      const updated = await window.abidin.getCreditById(selectedCredit.id);
      setSelectedCredit(updated);
      await loadTransactions(selectedCredit.id);
      await loadCredits();
    } catch (error) {
      setNotice(error.message || "To'lovda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDebt = async (amount, note) => {
    if (!selectedCredit || saving || !amount) return;
    setSaving(true);
    setNotice("");
    try {
      await window.abidin.addCreditDebt(selectedCredit.id, amount, note);
      setNotice("Yangi qarz qo'shildi");
      const updated = await window.abidin.getCreditById(selectedCredit.id);
      setSelectedCredit(updated);
      await loadTransactions(selectedCredit.id);
      await loadCredits();
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

  const isOld = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  };

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Nasiya boshqaruvi
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Nasiya va qarzlar
            </h2>
          </div>
          <button type="button" onClick={loadCredits} className="btn-ghost">
            <RefreshCw size={16} /> Yangilash
          </button>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/50" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish: ID, nomi yoki telefon..."
              className="field pl-10"
            />
          </div>
        </div>

        {notice ? (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                Faol nasiyalar
              </p>
              <p className="mt-2 text-3xl font-bold text-[#003366]">{activeCredits.length}</p>
            </div>
            <CreditCard className="text-[#003366]" />
          </div>
        </div>
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                Jami qarz
              </p>
              <p className="mt-2 text-3xl font-bold text-[#C62828]">
                {formatMoney(totalRemaining)} so'm
              </p>
            </div>
            <Wallet className="text-[#C62828]" />
          </div>
        </div>
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                Eski (7+ kun)
              </p>
              <p className="mt-2 text-3xl font-bold text-[#C62828]">
                {activeCredits.filter((c) => isOld(c.createdAt)).length}
              </p>
            </div>
            <CreditCard className="text-[#C62828]" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="panel col-span-full px-5 py-10 text-center text-[#003366]/70">
            Yuklanmoqda...
          </div>
        ) : filteredCredits.length === 0 ? (
          <div className="panel col-span-full px-5 py-10 text-center text-[#003366]/70">
            Nasiyalar yo'q
          </div>
        ) : (
          filteredCredits.map((credit) => {
            const old = isOld(credit.createdAt);
            return (
              <div
                key={credit.id}
                onClick={() => openCreditDetail(credit)}
                className={`panel cursor-pointer border-l-4 ${
                  credit.status === "paid"
                    ? "border-l-[#2E7D32]"
                    : old
                    ? "border-l-[#C62828]"
                    : "border-l-[#003366]"
                } hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#003366]">
                        {credit.customerCode || "#" + String(credit.id).padStart(4, "0")}
                      </span>
                      {credit.status === "paid" && (
                        <span className="rounded bg-[#2E7D32]/15 px-2 py-0.5 text-xs font-medium text-[#2E7D32]">
                          To'langan
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-[#003366]">{credit.customerName}</p>
                    {credit.customerPhone && (
                      <p className="text-xs text-[#003366]/70">{credit.customerPhone}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-[#003366]/60">Jami</p>
                    <p className="font-medium">{formatMoney(credit.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#003366]/60">Qolgan</p>
                    <p className="font-bold text-[#C62828]">{formatMoney(credit.remaining)}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#003366]/50">{formatDate(credit.createdAt)}</p>
              </div>
            );
          })
        )}
      </div>

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