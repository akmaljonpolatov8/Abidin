import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Minus, Plus, ScanBarcode, Trash2 } from "lucide-react";
import ReceiptModal from "../components/ReceiptModal";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

export default function Cashier() {
  const barcodeRef = useRef(null);
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleFocus = () => barcodeRef.current?.focus();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

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

      setCart((current) => {
        const existing = current.find((item) => item.id === product.id);
        if (existing) {
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
            quantity: 1,
            stock: Number(product.stock),
          },
        ];
      });
      setStatus({
        type: "success",
        message: `${product.name} savatga qo'shildi`,
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
          const nextQuantity = item.quantity + delta;
          if (nextQuantity <= 0) return null;
          return {
            ...item,
            quantity: Math.min(nextQuantity, item.stock),
          };
        })
        .filter(Boolean),
    );
  };

  const clearCart = () => {
    setCart([]);
    setStatus({ type: "idle", message: "" });
    barcodeRef.current?.focus();
  };

  const handleSale = async () => {
    if (cart.length === 0 || isLoading) return;
    setIsLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const payload = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: item.price,
      }));
      const result = await window.abidin.createSale(payload);
      setReceipt(result);
      setCart([]);
      setBarcode("");
      setStatus({
        type: "success",
        message: "Sotuv muvaffaqiyatli yakunlandi",
      });
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
                  {cart.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#003366]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#003366]/60">
                          {item.barcode}
                        </p>
                      </td>
                      <td className="px-5 py-4">
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
                      </td>
                      <td className="px-5 py-4">
                        {formatMoney(item.price)} so'm
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {formatMoney(item.price * item.quantity)} so'm
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
                  ))}
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
          <h2 className="mt-2 text-4xl font-bold text-[#003366]">
            {formatMoney(total)} so'm
          </h2>
          <p className="mt-2 text-sm text-[#1a1a1a]/80">
            Sotuvni yakunlash uchun quyidagi tugmani bosing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSale}
              disabled={cart.length === 0 || isLoading}
              className="btn-success flex-1"
            >
              {isLoading ? "Jarayon..." : "Sotish"}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="btn-ghost flex-1"
            >
              Savatni tozalash
            </button>
          </div>
        </section>

        <section className="panel px-5 py-5">
          <h3 className="text-base font-bold text-[#003366]">Qoidalar</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#1a1a1a]/85">
            <li>• Skaner barcode maydoniga avtomatik yozadi.</li>
            <li>• Mahsulot yo'q bo'lsa xabar ko'rsatiladi.</li>
            <li>• Sotuvdan so'ng qoldiq avtomatik kamayadi.</li>
          </ul>
        </section>
      </aside>

      <ReceiptModal
        open={Boolean(receipt)}
        receipt={receipt}
        onClose={() => setReceipt(null)}
      />
    </div>
  );
}
