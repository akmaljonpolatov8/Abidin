import React, { useEffect, useState } from "react";
import { CreditCard, Phone, Plus, RefreshCw, User, Wallet } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatDate(value) {
  if (!value) return "Yo'q";
  return new Date(value).toLocaleString("uz-UZ");
}

function PaymentModal({ open, credit, onClose, onSave, saving }) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open && credit) {
      setAmount(String(credit.remaining || 0));
    }
  }, [open, credit]);

  if (!open || !credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Nasiya
            </p>
            <h2 className="text-xl font-bold text-[#003366]">To'lov qabul qilish</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            Yopish
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-[#003366]">{credit.customerName}</p>
            {credit.customerPhone && (
              <p className="text-xs text-[#003366]/70">{credit.customerPhone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/60">Jami</p>
              <p className="mt-1 text-lg font-bold text-[#003366]">
                {formatMoney(credit.totalAmount)} so'm
              </p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/60">Qolgan</p>
              <p className="mt-1 text-lg font-bold text-[#C62828]">
                {formatMoney(credit.remaining)} so'm
              </p>
            </div>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">To'lov miqdori</span>
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
        </div>

        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button
            type="button"
            onClick={() => onSave(Number(amount))}
            disabled={saving || !amount}
            className="btn-success"
          >
            <Plus size={16} /> {saving ? "Saqlanmoqda..." : "To'lov qabul qilish"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Nasiya() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState({ open: false, credit: null });
  const [saving, setSaving] = useState(false);

  const loadCredits = async () => {
    setLoading(true);
    try {
      const list = await window.abidin.listCredits();
      setCredits(list);
    } catch (error) {
      setNotice(error.message || "Nasiyalar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const isOld = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  };

  const openPayment = (credit) => {
    setModal({ open: true, credit });
  };

  const closeModal = () => {
    setModal({ open: false, credit: null });
  };

  const savePayment = async (amount) => {
    if (!modal.credit || saving) return;
    if (amount <= 0 || amount > modal.credit.remaining) {
      setNotice("To'lov miqdori noto'g'ri");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      await window.abidin.creditPayment(modal.credit.id, amount);
      setNotice("To'lov qabul qilindi");
      closeModal();
      await loadCredits();
    } catch (error) {
      setNotice(error.message || "To'lovda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const totalRemaining = credits.reduce((sum, c) => sum + (c.remaining || 0), 0);
  const activeCount = credits.length;

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
              <p className="mt-2 text-3xl font-bold text-[#003366]">{activeCount}</p>
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
                {credits.filter((c) => isOld(c.createdAt)).length}
              </p>
            </div>
            <CreditCard className="text-[#C62828]" />
          </div>
        </div>
      </section>

      <section className="table-shell hidden md:block">
        <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
          <h3 className="text-lg font-bold text-[#003366]">Nasiya ro'yxati</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#003366]/5 text-[#003366]">
              <tr>
                <th className="px-5 py-3">Mijoz</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">Jami</th>
                <th className="px-5 py-3">To'langan</th>
                <th className="px-5 py-3">Qolgan</th>
                <th className="px-5 py-3">Sana</th>
                <th className="px-5 py-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-[#003366]/70" colSpan={7}>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : credits.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-[#003366]/70" colSpan={7}>
                    Nasiyalar yo'q
                  </td>
                </tr>
              ) : (
                credits.map((credit) => {
                  const old = isOld(credit.createdAt);
                  return (
                    <tr
                      key={credit.id}
                      className={`border-t border-[rgba(0,51,102,0.1)] ${old ? "bg-[#C62828]/10" : "bg-white/45"}`}
                    >
                      <td className="px-5 py-4 font-semibold text-[#003366]">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[#003366]/60" />
                          {credit.customerName}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {credit.customerPhone ? (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-[#003366]/60" />
                            {credit.customerPhone}
                          </div>
                        ) : (
                          <span className="text-[#003366]/50">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {formatMoney(credit.totalAmount)} so'm
                      </td>
                      <td className="px-5 py-4 text-[#2E7D32]">
                        {formatMoney(credit.paidAmount)} so'm
                      </td>
                      <td className="px-5 py-4 font-bold text-[#C62828]">
                        {formatMoney(credit.remaining)} so'm
                      </td>
                      <td className="px-5 py-4">
                        <span className={old ? "text-[#C62828] font-medium" : ""}>
                          {formatDate(credit.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openPayment(credit)}
                          className="btn-success px-3 py-2 text-xs"
                        >
                          <Plus size={14} /> To'lov
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 md:hidden">
        {loading ? (
          <div className="panel px-5 py-10 text-center text-[#003366]/70">
            Yuklanmoqda...
          </div>
        ) : credits.length === 0 ? (
          <div className="panel px-5 py-10 text-center text-[#003366]/70">
            Nasiyalar yo'q
          </div>
        ) : (
          credits.map((credit) => {
            const old = isOld(credit.createdAt);
            return (
              <div
                key={credit.id}
                className={`panel border-l-4 ${old ? "border-l-[#C62828]" : "border-l-[#003366]"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-[#003366]">{credit.customerName}</h4>
                    {credit.customerPhone && (
                      <p className="text-xs text-[#003366]/70">{credit.customerPhone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPayment(credit)}
                    className="btn-success text-xs"
                  >
                    To'lov
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-[#003366]/60">Jami</p>
                    <p className="font-medium">{formatMoney(credit.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#003366]/60">To'langan</p>
                    <p className="text-[#2E7D32]">{formatMoney(credit.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#003366]/60">Qolgan</p>
                    <p className="font-bold text-[#C62828]">{formatMoney(credit.remaining)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PaymentModal
        open={modal.open}
        credit={modal.credit}
        onClose={closeModal}
        onSave={savePayment}
        saving={saving}
      />
    </div>
  );
}