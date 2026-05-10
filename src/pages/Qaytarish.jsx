import React, { useEffect, useState } from "react";
import { ArrowLeft, Package2, RefreshCw, Search, X } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatDate(value) {
  if (!value) return "Yo'q";
  return new Date(value).toLocaleString("uz-UZ");
}

function ReturnModal({ open, saleData, onClose, onSave, saving }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open && saleData && saleData.items) {
      setItems(
        saleData.items.map((item) => ({
          ...item,
          returnQuantity: 0,
          reason: "",
        }))
      );
    }
  }, [open, saleData]);

  if (!open || !saleData) return null;

  const totalReturn = items.reduce((sum, item) => {
    return sum + item.returnQuantity * item.priceAtSale;
  }, 0);

  const handleQuantityChange = (index, value) => {
    const numValue = Number(value);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const maxQty = item.quantity || 0;
        return {
          ...item,
          returnQuantity: Math.min(Math.max(0, numValue), maxQty),
        };
      })
    );
  };

  const handleReasonChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, reason: value } : item))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Qaytarish
            </p>
            <h2 className="text-xl font-bold text-[#003366]">
              Sotuv #{saleData.sale?.id}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: "60vh" }}>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs text-[#003366]/60">Sana</p>
              <p className="font-semibold text-[#003366]">
                {formatDate(saleData.sale?.soldAt)}
              </p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs text-[#003366]/60">Jami summa</p>
              <p className="font-semibold text-[#003366]">
                {formatMoney(saleData.sale?.total)} so'm
              </p>
            </div>
          </div>

          <h4 className="mb-3 font-semibold text-[#003366]">Mahsulotlar</h4>
          {items.map((item, index) => (
            <div
              key={index}
              className="mb-3 rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#003366]">{item.productName}</p>
                  <p className="text-xs text-[#003366]/70">{item.barcode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#003366]">
                    Sotilgan: {item.quantity} ta
                  </p>
                  <p className="text-sm font-medium text-[#003366]">
                    Narx: {formatMoney(item.priceAtSale)} so'm
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-[#003366]">
                    Qaytarish miqdori
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={item.returnQuantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="field"
                    placeholder="0"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-[#003366]">Sabab</span>
                  <input
                    value={item.reason}
                    onChange={(e) => handleReasonChange(index, e.target.value)}
                    className="field"
                    placeholder="Masalan: buzilgan"
                  />
                </label>
              </div>
              {item.returnQuantity > 0 && (
                <div className="mt-2 text-right text-sm font-medium text-[#2E7D32]">
                  Qaytarish: {formatMoney(item.returnQuantity * item.priceAtSale)} so'm
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold text-[#003366]">Jami qaytarish:</span>
            <span className="text-xl font-bold text-[#C62828]">
              {formatMoney(totalReturn)} so'm
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onSave(items)}
              disabled={saving || totalReturn <= 0}
              className="btn-primary flex-1"
            >
              {saving ? "Saqlanmoqda..." : "Qaytarishni tasdiqlash"}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Bekor qilish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Qaytarish() {
  const [searchId, setSearchId] = useState("");
  const [saleData, setSaleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState({ open: false });

  const searchSale = async () => {
    if (!searchId) return;
    setLoading(true);
    setNotice("");
    setSaleData(null);
    try {
      const data = await window.abidin.getSaleForReturn(Number(searchId));
      if (data) {
        setSaleData(data);
      } else {
        setNotice("Sotuv topilmadi");
      }
    } catch (error) {
      setNotice(error.message || "Qidirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const openReturn = () => {
    if (saleData) {
      setModal({ open: true });
    }
  };

  const closeModal = () => {
    setModal({ open: false });
  };

  const saveReturn = async (items) => {
    if (!saleData || saving) return;

    const returnItems = items.filter((item) => item.returnQuantity > 0);
    if (returnItems.length === 0) {
      setNotice("Hech qanday mahsulot qaytarilmagan");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      for (const item of returnItems) {
        await window.abidin.createReturn(
          saleData.sale.id,
          item.productId,
          item.returnQuantity,
          item.priceAtSale,
          item.reason || "Qaytarish"
        );
      }
      setNotice("Qaytarish muvaffaqiyatli amalga oshirildi");
      closeModal();
      setSaleData(null);
      setSearchId("");
    } catch (error) {
      setNotice(error.message || "Qaytarishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Qaytarish boshqaruvi
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Mahsulotlarni qaytarish
            </h2>
          </div>
        </div>
        {notice ? (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        ) : null}
      </section>

      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px] flex-1">
            <label className="mb-2 block text-sm font-semibold text-[#003366]">
              Sotuv raqami (ID)
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/60"
                  size={18}
                />
                <input
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchSale();
                    }
                  }}
                  type="number"
                  placeholder="Sotuv ID sini kiriting"
                  className="field pl-10"
                />
              </div>
              <button
                type="button"
                onClick={searchSale}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Qidirilmoqda..." : "Qidirish"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {saleData && (
        <section className="table-shell">
          <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#003366]">Sotuv ma'lumotlari</h3>
              <p className="text-sm text-[#003366]/70">
                ID: #{saleData.sale?.id} | {formatDate(saleData.sale?.soldAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={openReturn}
              className="btn-primary"
            >
              <ArrowLeft size={16} /> Qaytarishni boshlash
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#003366]/5 text-[#003366]">
                <tr>
                  <th className="px-5 py-3">Mahsulot</th>
                  <th className="px-5 py-3">Barcode</th>
                  <th className="px-5 py-3">Soni</th>
                  <th className="px-5 py-3">Narx</th>
                  <th className="px-5 py-3 text-right">Jami</th>
                </tr>
              </thead>
              <tbody>
                {saleData.items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                  >
                    <td className="px-5 py-4 font-semibold text-[#003366]">
                      <div className="flex items-center gap-2">
                        <Package2 size={14} className="text-[#003366]/60" />
                        {item.productName}
                      </div>
                    </td>
                    <td className="px-5 py-4">{item.barcode}</td>
                    <td className="px-5 py-4">{item.quantity}</td>
                    <td className="px-5 py-4">{formatMoney(item.priceAtSale)} so'm</td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatMoney(item.quantity * item.priceAtSale)} so'm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ReturnModal
        open={modal.open}
        saleData={saleData}
        onClose={closeModal}
        onSave={saveReturn}
        saving={saving}
      />
    </div>
  );
}