import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

export default function ReceiptModal({ open, receipt, onClose }) {
  const [storeSettings, setStoreSettings] = useState({ storeName: "Abidin", storeLogo: null });

  useEffect(() => {
    if (open && window.abidin?.getStoreSettings) {
      window.abidin.getStoreSettings().then((settings) => {
        if (settings) {
          setStoreSettings(settings);
        }
      });
    }
  }, [open]);

  if (!open || !receipt) {
    return null;
  }

  const soldAt = receipt.sale?.sold_at
    ? new Date(receipt.sale.sold_at)
    : new Date();

  const paymentType = receipt.sale?.payment_type || "naqt";
  const paymentLabel = paymentType === "naqt" ? "💵 Naqt" : paymentType === "karta" ? "💳 Karta" : "📱 Click/Payme";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-xl overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#003366]/70">
              Abidin
            </p>
            <h2 className="text-xl font-bold text-[#003366]">Chek</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-3 py-2 text-sm"
          >
            <X size={16} /> Yopish
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 text-[#1a1a1a]">
          <div className="text-center">
            {storeSettings.storeLogo ? (
              <img
                src={`file://${storeSettings.storeLogo}`}
                alt="Logo"
                className="mx-auto mb-2 max-h-16 object-contain"
              />
            ) : (
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#003366] text-[#F5DEB3]">
                <span className="text-2xl font-bold">A</span>
              </div>
            )}
            <h3 className="text-lg font-bold text-[#003366]">{storeSettings.storeName}</h3>
          </div>

          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-[#003366]">Sotuv vaqti</p>
            <p className="mt-1 text-sm">{soldAt.toLocaleString("uz-UZ")}</p>
          </div>

          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-[#003366]">To'lov usuli</p>
            <p className="mt-1 text-lg font-bold">{paymentLabel}</p>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#003366]/5 text-[#003366]">
                <tr>
                  <th className="px-4 py-3">Mahsulot</th>
                  <th className="px-4 py-3">Soni</th>
                  <th className="px-4 py-3">Narx</th>
                  <th className="px-4 py-3 text-right">Jami</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[rgba(0,51,102,0.1)]"
                  >
                    <td className="px-4 py-3 font-medium text-[#003366]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">
                      {Number(item.quantity).toLocaleString("uz-UZ", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                    </td>
                    <td className="px-4 py-3">
                      {Number(item.price_at_sale).toLocaleString("uz-UZ")} so'm
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(item.subtotal).toLocaleString("uz-UZ")} so'm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between rounded-[8px] bg-[#003366] px-4 py-4 text-[#F5DEB3]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#F5DEB3]/75">
                Umumiy summa
              </p>
              <p className="text-2xl font-bold">
                {Number(receipt.sale.total).toLocaleString("uz-UZ")} so'm
              </p>
            </div>
            <div className="text-right text-sm text-[#F5DEB3]/90">
              <p>Chek raqami</p>
              <p className="font-semibold">#{receipt.sale.id}</p>
            </div>
          </div>

          <p className="text-center text-sm text-[#003366]/70">
            Rahmat! Yana keling 😊
          </p>
        </div>
      </div>
    </div>
  );
}