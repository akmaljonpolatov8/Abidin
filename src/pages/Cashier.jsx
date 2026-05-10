import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Minus, Plus, ScanBarcode, Trash2, CreditCard, X, User, Search } from "lucide-react";
import ReceiptModal from "../components/ReceiptModal";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function CreditModal({ open, onClose, onConfirm, saving }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paidAmount, setPaidAmount] = useState("0");

  useEffect(() => {
    if (open) {
      setCustomerName("");
      setCustomerPhone("");
      setPaidAmount("0");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Nasiya
            </p>
            <h2 className="text-xl font-bold text-[#003366]">Nasiyaga berish</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Mijoz ismi *</span>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="field"
              placeholder="Ism familiya"
            />
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Telefon</span>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="field"
              placeholder="+998 90 123 45 67"
            />
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Hozir to'lash (ixtiyoriy)</span>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="field"
              placeholder="0"
            />
          </label>
        </div>

        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button
            type="button"
            onClick={() => onConfirm({ customerName, customerPhone, paidAmount: Number(paidAmount) })}
            disabled={saving || !customerName}
            className="btn-primary flex-1"
          >
            {saving ? "Saqlanmoqda..." : "Nasiyaga berish"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerSearchModal({ open, onClose, onSelect, saving }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setResults([]);
    }
  }, [open]);

  const searchCustomers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const list = await window.abidin.searchCustomers(searchQuery);
      setResults(list);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Mijoz
            </p>
            <h2 className="text-xl font-bold text-[#003366]">Mijoz qidirish</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/50"
                size={16}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchCustomers();
                  }
                }}
                className="field pl-9"
                placeholder="Telefon yoki ism..."
              />
            </div>
            <button type="button" onClick={searchCustomers} className="btn-primary">
              Qidirish
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-center text-[#003366]/70">Qidirilmoqda...</p>
            ) : results.length === 0 ? (
              <p className="text-center text-[#003366]/70">Mijoz topilmadi</p>
            ) : (
              results.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelect(customer)}
                  className="w-full rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3 text-left hover:bg-white"
                >
                  <p className="font-semibold text-[#003366]">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-xs text-[#003366]/70">{customer.phone}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cashier({ user }) {
  const barcodeRef = useRef(null);
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [creditModal, setCreditModal] = useState({ open: false });
  const [customerModal, setCustomerModal] = useState({ open: false });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleFocus = () => barcodeRef.current?.focus();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const { total, subtotal, discountTotal } = useMemo(() => {
    const sub = cart.reduce((sum, item) => {
      const itemDiscount = item.discount_percent || 0;
      const itemTotal = item.price * item.quantity;
      return sum + itemTotal * (1 - itemDiscount / 100);
    }, 0);
    const disc = cart.reduce((sum, item) => {
      const itemDiscount = item.discount_percent || 0;
      return sum + (item.price * item.quantity * itemDiscount / 100);
    }, 0);
    return { total: sub, subtotal: cart.reduce((s, i) => s + i.price * i.quantity, 0), discountTotal: disc };
  }, [cart]);

  const addProductToCart = async (value) => {
    const code = String(value || "").trim();
    if (!code) return;

    if (!window.abidin?.getProductByBarcode) {
      setStatus({ type: "error", message: "Tizim IPC bog'lanishi topilmadi" });
      return;
    }

    try {
      const product = await window.abidin.getProductByBarcode(code);
      if (!product) {
        setStatus({ type: "error", message: "Mahsulot topilmadi" });
        return;
      }
      if (Number(product.stock || 0) <= 0) {
        setStatus({ type: "error", message: "Skladda qoldiq yo'q" });
        return;
      }

      const discountPercent = Number(product.discount_percent || 0);

      setCart((current) => {
        const existing = current.find((item) => item.id === product.id);
        const unit = product.unit || "dona";
        if (existing) {
          if (unit === "kg") {
            return current.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: Math.min(item.quantity + 0.5, Number(product.stock)),
                  }
                : item,
            );
          }
          return current.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, Number(product.stock)),
                }
              : item,
          );
        }
        return [
          ...current,
          {
            id: product.id,
            product_id: product.id,
            name: product.name,
            barcode: product.barcode,
            price: Number(product.price),
            quantity: unit === "kg" ? 0.5 : 1,
            stock: Number(product.stock),
            unit: unit,
            discount_percent: discountPercent,
          },
        ];
      });
      setStatus({
        type: "success",
        message: `${product.name} savatga qo'shildi${discountPercent > 0 ? ` (-${discountPercent}%)` : ""}`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Barcode o'qilmadi",
      });
    } finally {
      setBarcode("");
      barcodeRef.current?.focus();
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          let nextQuantity = item.quantity;
          if (item.unit === "kg") {
            nextQuantity = Math.round((item.quantity + delta * 0.5) * 1000) / 1000;
          } else {
            nextQuantity = item.quantity + delta;
          }
          if (nextQuantity <= 0) return null;
          return {
            ...item,
            quantity: Math.min(nextQuantity, item.stock),
          };
        })
        .filter(Boolean),
    );
  };

  const handleQuantityChange = (id, value) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return;
    setCart((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const maxStock = item.stock || 0;
        const validQuantity = Math.min(Math.max(0, numValue), maxStock);
        return {
          ...item,
          quantity: item.unit === "kg" ? Math.round(validQuantity * 1000) / 1000 : Math.floor(validQuantity),
        };
      }),
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setStatus({ type: "idle", message: "" });
    barcodeRef.current?.focus();
  };

  const handleSale = async (saleType = "cash", paymentType = "naqt", creditData = null) => {
    if (cart.length === 0 || isLoading) return;
    setIsLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const payload = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: item.price,
        unit: item.unit || "dona",
        discount_percent: item.discount_percent || 0,
        sale_type: saleType,
        customer_name: creditData?.customerName || (selectedCustomer ? selectedCustomer.name : null),
        customer_phone: creditData?.customerPhone || (selectedCustomer ? selectedCustomer.phone : null),
        customer_id: selectedCustomer ? selectedCustomer.id : null,
        paid_amount: creditData?.paidAmount || 0,
        payment_type: paymentType,
      }));
      const result = await window.abidin.createSale(payload);
      setReceipt(result);
      setCart([]);
      setBarcode("");
      setSelectedCustomer(null);
      setStatus({
        type: "success",
        message: saleType === "credit" ? "Nasiya sotuv muvaffaqiyatli yakunlandi" : "Sotuv muvaffaqiyatli yakunlandi",
      });
      if (creditData) {
        setCreditModal({ open: false });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Sotuv amalga oshmadi",
      });
    } finally {
      setIsLoading(false);
      barcodeRef.current?.focus();
    }
  };

  const confirmCredit = (creditData) => {
    handleSale("credit", "naqt", creditData);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerModal({ open: false });
    setStatus({ type: "success", message: `${customer.name} tanlandi` });
  };

  const removeCustomer = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <section className="panel px-5 py-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[280px] flex-1">
              <label className="mb-2 block text-sm font-semibold text-[#003366]">
                Barcode skaneri
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <ScanBarcode
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/60"
                    size={18}
                  />
                  <input
                    ref={barcodeRef}
                    value={barcode}
                    onChange={(event) => setBarcode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addProductToCart(barcode);
                      }
                    }}
                    placeholder="Barcode ni skanerlang yoki kiriting"
                    className="field pl-10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addProductToCart(barcode)}
                  className="btn-primary"
                >
                  <ArrowRight size={16} /> Qo'shish
                </button>
              </div>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.16)] bg-white/60 px-4 py-3 text-sm text-[#003366]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#003366]/55">
                Bugungi savat
              </p>
              <p className="mt-1 text-lg font-bold">
                {cart.length} ta mahsulot
              </p>
            </div>
          </div>

          {selectedCustomer && (
            <div className="mt-3 flex items-center justify-between rounded-[8px] bg-[#2E7D32]/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#2E7D32]" />
                <span className="font-medium text-[#2E7D32]">{selectedCustomer.name}</span>
                {selectedCustomer.phone && (
                  <span className="text-sm text-[#003366]/70">({selectedCustomer.phone})</span>
                )}
              </div>
              <button type="button" onClick={removeCustomer} className="text-[#C62828] hover:underline text-sm">
                Olib tashlash
              </button>
            </div>
          )}

          {!selectedCustomer && (
            <button
              type="button"
              onClick={() => setCustomerModal({ open: true })}
              className="mt-3 flex items-center gap-2 text-sm text-[#003366]/70 hover:text-[#003366]"
            >
              <User size={16} /> Mijoz tanlash (ixtiyoriy)
            </button>
          )}

          {status.message ? (
            <div
              className={`mt-4 rounded-[8px] px-4 py-3 text-sm font-medium ${status.type === "error" ? "bg-[#C62828]/10 text-[#C62828]" : "bg-[#2E7D32]/10 text-[#2E7D32]"}`}
            >
              {status.message}
            </div>
          ) : null}
        </section>

        <section className="table-shell">
          <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
            <h2 className="text-lg font-bold text-[#003366]">Savat</h2>
          </div>
          {cart.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-[#003366]/70">
              Savat bo'sh. Barcode skanerlang va mahsulot qo'shing.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#003366]/5 text-[#003366]">
                  <tr>
                    <th className="px-5 py-3">Mahsulot</th>
                    <th className="px-5 py-3">Soni</th>
                    <th className="px-5 py-3">Narx</th>
                    <th className="px-5 py-3">Jami</th>
                    <th className="px-5 py-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                    const itemDiscount = item.discount_percent || 0;
                    const itemTotal = item.price * item.quantity;
                    const discountedTotal = itemTotal * (1 - itemDiscount / 100);

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                      >
                        <td className="px-5 py-4">
                          <p className="flex items-center gap-2 font-semibold text-[#003366]">
                            {item.name}
                            {item.unit === "kg" && (
                              <span className="rounded bg-[#2E7D32]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#2E7D32]">
                                KG
                              </span>
                            )}
                            {itemDiscount > 0 && (
                              <span className="rounded bg-[#C62828]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#C62828]">
                                -{itemDiscount}%
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#003366]/60">
                            {item.barcode}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {item.unit === "kg" ? (
                            <input
                              type="number"
                              min="0"
                              step="0.100"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-20 rounded-[8px] border border-[rgba(0,51,102,0.15)] bg-white px-2 py-1 text-center font-semibold"
                            />
                          ) : (
                            <div className="inline-flex items-center gap-2 rounded-[8px] border border-[rgba(0,51,102,0.15)] bg-white px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="rounded-[8px] p-1 text-[#003366] hover:bg-[#003366]/10"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-[24px] text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="rounded-[8px] p-1 text-[#003366] hover:bg-[#003366]/10"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {itemDiscount > 0 ? (
                            <div>
                              <span className="text-[#003366]/50 line-through text-xs">
                                {formatMoney(item.price)} so'm
                              </span>
                              <div className="font-medium text-[#2E7D32]">
                                {formatMoney(item.price * (1 - itemDiscount / 100))} so'm
                              </div>
                            </div>
                          ) : (
                            <span>{formatMoney(item.price)} so'm</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {itemDiscount > 0 ? (
                            <span className="text-[#2E7D32]">
                              {formatMoney(discountedTotal)} so'm
                            </span>
                          ) : (
                            <span>{formatMoney(itemTotal)} so'm</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setCart((current) =>
                                current.filter((entry) => entry.id !== item.id),
                              )
                            }
                            className="btn-danger px-3 py-2 text-xs"
                          >
                            <Trash2 size={14} /> O'chirish
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="panel px-5 py-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
            Umumiy summa
          </p>
          {discountTotal > 0 && (
            <div className="mt-1 text-sm text-[#003366]/70">
              <span className="line-through">Original: {formatMoney(subtotal)} so'm</span>
            </div>
          )}
          <h2 className="mt-2 text-4xl font-bold text-[#003366]">
            {formatMoney(total)} so'm
          </h2>
          {discountTotal > 0 && (
            <p className="mt-2 text-sm font-medium text-[#2E7D32]">
              Tejash: {formatMoney(discountTotal)} so'm
            </p>
          )}
          <p className="mt-2 text-sm text-[#1a1a1a]/80">
            Sotuvni yakunlash uchun quyidagi tugmalardan birini bosing.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSale("cash", "naqt")}
              disabled={cart.length === 0 || isLoading}
              className="btn-success flex flex-col items-center gap-1 py-3"
            >
              <span className="text-xl">💵</span>
              <span className="text-sm font-semibold">Naqt</span>
            </button>
            <button
              type="button"
              onClick={() => handleSale("cash", "karta")}
              disabled={cart.length === 0 || isLoading}
              className="flex flex-col items-center gap-1 rounded-[8px] bg-[#003366] px-4 py-3 text-[#F5DEB3] transition hover:bg-[#002244]"
            >
              <span className="text-xl">💳</span>
              <span className="text-sm font-semibold">Karta</span>
            </button>
            <button
              type="button"
              onClick={() => handleSale("cash", "click")}
              disabled={cart.length === 0 || isLoading}
              className="flex flex-col items-center gap-1 rounded-[8px] bg-[#E65100] px-4 py-3 text-white transition hover:bg-[#BF360C]"
            >
              <span className="text-xl">📱</span>
              <span className="text-sm font-semibold">Click</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCreditModal({ open: true })}
            disabled={cart.length === 0 || isLoading}
            className="btn-primary mt-3 flex w-full items-center justify-center gap-2"
          >
            <CreditCard size={16} /> Nasiyaga berish
          </button>
        </section>

        <section className="panel px-5 py-5">
          <h3 className="text-base font-bold text-[#003366]">Qoidalar</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#1a1a1a]/85">
            <li>• Skaner barcode maydoniga avtomatik yozadi.</li>
            <li>• Mahsulot yo'q bo'lsa xabar ko'rsatiladi.</li>
            <li>• Sotuvdan so'ng qoldiq avtomatik kamayadi.</li>
            <li>• Chegirma % mahsulotga avtomatik qo'llaniladi.</li>
            <li>• Nasiyaga berish uchun mijoz ismi kiritish majburiy.</li>
          </ul>
        </section>
      </aside>

      <ReceiptModal
        open={Boolean(receipt)}
        receipt={receipt}
        onClose={() => setReceipt(null)}
      />

      <CreditModal
        open={creditModal.open}
        onClose={() => setCreditModal({ open: false })}
        onConfirm={confirmCredit}
        saving={isLoading}
      />

      <CustomerSearchModal
        open={customerModal.open}
        onClose={() => setCustomerModal({ open: false })}
        onSelect={selectCustomer}
        saving={isLoading}
      />
    </div>
  );
}