import React, { useEffect, useState } from "react";
import { X, Phone, MapPin } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

export default function ReceiptModal({ open, receipt, onClose }) {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Blokpost",
    storePhone: "",
    storeAddress: "",
    receiptFooter: "Rahmat! Yana keling 😊",
    storeLogo: null
  });

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

  const storeName = storeSettings.storeName || "Blokpost";
  const storePhone = storeSettings.storePhone || "";
  const storeAddress = storeSettings.storeAddress || "";
  const receiptFooter = storeSettings.receiptFooter || "Rahmat! Yana keling 😊";

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
          {/* Header with Logo */}
          <div className="text-center">
            {storeSettings.storeLogo ? (
              <img
                src={`file://${storeSettings.storeLogo}`}
                alt="Logo"
                className="mx-auto mb-3 h-auto max-w-[150px] rounded-[8px] object-contain"
              />
            ) : null}
            <h3 className="text-lg font-bold text-[#003366]">{storeName}</h3>
            {(storePhone || storeAddress) && (
              <div className="mt-2 space-y-1 text-xs text-[#003366]/70">
                {storePhone && (
                  <p className="flex items-center justify-center gap-1">
                    <Phone size={10} /> {storePhone}
                  </p>
                )}
                {storeAddress && (
                  <p className="flex items-center justify-center gap-1">
                    <MapPin size={10} /> {storeAddress}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-b border-[rgba(0,51,102,0.2)]"></div>

          {/* Sale Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2">
              <p className="text-xs text-[#003366]/60">Sotuv vaqti</p>
              <p className="text-sm font-medium text-[#003366]">{soldAt.toLocaleString("uz-UZ")}</p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2">
              <p className="text-xs text-[#003366]/60">To'lov usuli</p>
              <p className="text-sm font-medium text-[#003366]">{paymentLabel}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-hidden rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#003366]/5 text-[#003366]">
                <tr>
                  <th className="px-3 py-2">Mahsulot</th>
                  <th className="px-3 py-2 text-center">Soni</th>
                  <th className="px-3 py-2 text-right">Narx</th>
                  <th className="px-3 py-2 text-right">Jami</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[rgba(0,51,102,0.1)]"
                  >
                    <td className="px-3 py-2 font-medium text-[#003366]">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {Number(item.quantity).toLocaleString("uz-UZ", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.price_at_sale).toLocaleString("uz-UZ")}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {Number(item.subtotal).toLocaleString("uz-UZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
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

          {/* Footer */}
          <p className="text-center text-sm text-[#003366]/70">
            {receiptFooter}
          </p>
        </div>
      </div>
    </div>
  );
}