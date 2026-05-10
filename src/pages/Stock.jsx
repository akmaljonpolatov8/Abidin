import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Filter, PackagePlus, Plus, X } from "lucide-react";
import ProductCard from "../components/ProductCard";

function formatDate(value) {
  if (!value) return "Yo'q";
  return new Date(value).toLocaleString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function AddStockModal({
  open,
  product,
  onClose,
  onSave,
  saving,
  quantity,
  setQuantity,
}) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-lg overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Sklad
            </p>
            <h2 className="text-xl font-bold text-[#003366]">Qabul qilish</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-3 py-2 text-sm"
          >
            <X size={16} /> Yopish
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-[#003366]">
              {product.name}
            </p>
            <p className="text-xs text-[#003366]/70">{product.barcode}</p>
          </div>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">
              Qo'shiladigan miqdor
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="field"
              placeholder="0"
            />
          </label>
        </div>
        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn-success"
          >
            <Plus size={16} /> {saving ? "Saqlanmoqda..." : "Qo'shish"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState({ open: false, product: null });
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiringSoonProducts, setExpiringSoonProducts] = useState([]);
  const [expiringMonthProducts, setExpiringMonthProducts] = useState([]);

  const loadStock = async () => {
    setLoading(true);
    try {
      const [list, expired, expiringSoon, expiringMonth] = await Promise.all([
        window.abidin.getStockList(),
        window.abidin.getExpiredProducts(),
        window.abidin.getExpiringSoonProducts(),
        window.abidin.getExpiringMonthProducts(),
      ]);
      setProducts(list);
      setExpiredProducts(expired);
      setExpiringSoonProducts(expiringSoon);
      setExpiringMonthProducts(expiringMonth);
    } catch (error) {
      setNotice(error.message || "Sklad ma'lumotlari yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const lowStockCount = useMemo(
    () => products.filter((product) => Number(product.stock || 0) < 5).length,
    [products],
  );

  const openModal = (product) => {
    setModal({ open: true, product });
    setQuantity("");
  };

  const closeModal = () => {
    setModal({ open: false, product: null });
    setQuantity("");
  };

  const saveStock = async () => {
    if (!modal.product || saving) return;
    setSaving(true);
    try {
      await window.abidin.restockProduct(modal.product.id, Number(quantity));
      setNotice("Sklad yangilandi");
      closeModal();
      await loadStock();
    } catch (error) {
      setNotice(error.message || "Qabul qilishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (filter === "low") {
      return products.filter((p) => Number(p.stock || 0) < 5);
    }
    return products;
  }, [products, filter]);

  const totalExpiryAlerts = expiredProducts.length + expiringSoonProducts.length + expiringMonthProducts.length;

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Sklad nazorati
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Qoldiq va kirimlar
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFilter(filter === "low" ? "all" : "low")}
              className={`btn-ghost flex items-center gap-2 ${filter === "low" ? "bg-[#C62828]/10 text-[#C62828]" : ""}`}
            >
              <Filter size={16} />
              {filter === "low" ? "Hammasini ko'rish" : "Kam qolganlar"}
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-[8px] bg-[#003366] px-4 py-3 text-[#F5DEB3]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#F5DEB3]/75">
              Kam qoldiq
            </p>
            <p className="text-2xl font-bold">{lowStockCount}</p>
          </div>
          {totalExpiryAlerts > 0 && (
            <div className="rounded-[8px] bg-[#C62828] px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/75">
                Muddati yaqin
              </p>
              <p className="text-2xl font-bold">{totalExpiryAlerts}</p>
            </div>
          )}
        </div>
        {notice ? (
          <p className="mt-4 text-sm font-medium text-[#003366]">{notice}</p>
        ) : null}
      </section>

      {(expiredProducts.length > 0 || expiringSoonProducts.length > 0 || expiringMonthProducts.length > 0) && (
        <section className="space-y-4">
          {expiredProducts.length > 0 && (
            <div className="panel border-l-4 border-l-[#C62828] px-5 py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-[#C62828]" />
                <div>
                  <h3 className="font-bold text-[#C62828]">Muddati o'tgan mahsulotlar</h3>
                  <p className="text-sm text-[#003366]/70">
                    {expiredProducts.map((p) => p.name).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {expiringSoonProducts.length > 0 && (
            <div className="panel border-l-4 border-l-[#F57C00] px-5 py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-[#F57C00]" />
                <div>
                  <h3 className="font-bold text-[#F57C00]">7 kunda muddati tugaydi</h3>
                  <p className="text-sm text-[#003366]/70">
                    {expiringSoonProducts.map((p) => `${p.name} (${formatDate(p.expiryDate)})`).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {expiringMonthProducts.length > 0 && (
            <div className="panel border-l-4 border-l-[#FBC02D] px-5 py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-[#FBC02D]" />
                <div>
                  <h3 className="font-bold text-[#F57C00]">30 kunda muddati tugaydi</h3>
                  <p className="text-sm text-[#003366]/70">
                    {expiringMonthProducts.map((p) => `${p.name} (${formatDate(p.expiryDate)})`).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="table-shell hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#003366]/5 text-[#003366]">
              <tr>
                <th className="px-5 py-3">Nomi</th>
                <th className="px-5 py-3">Barcode</th>
                <th className="px-5 py-3">Narx</th>
                <th className="px-5 py-3">Qoldiq</th>
                <th className="px-5 py-3">Muddati</th>
                <th className="px-5 py-3">So'nggi kirim</th>
                <th className="px-5 py-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-[#003366]/70"
                    colSpan={7}
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-[#003366]/70"
                    colSpan={7}
                  >
                    Mahsulot topilmadi
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = Number(product.stock || 0) < 5;
                  const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();
                  const isExpiringSoon = product.expiry_date && !isExpired && new Date(product.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                  return (
                    <tr
                      key={product.id}
                      className={`border-t border-[rgba(0,51,102,0.1)] ${
                        isExpired ? "bg-[#C62828]/10" : isExpiringSoon ? "bg-[#F57C00]/10" : isLow ? "bg-[#C62828]/5" : "bg-white/45"
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-[#003366]">
                        {product.name}
                        {isExpired && (
                          <span className="ml-2 text-[10px] font-bold text-[#C62828]">MUDDAT O'TGAN</span>
                        )}
                        {isExpiringSoon && !isExpired && (
                          <span className="ml-2 text-[10px] font-bold text-[#F57C00]">TEZKOR</span>
                        )}
                      </td>
                      <td className="px-5 py-4">{product.barcode}</td>
                      <td className="px-5 py-4">
                        {Number(product.price).toLocaleString("uz-UZ")} so'm
                      </td>
                      <td className={`px-5 py-4 font-semibold ${isLow ? "text-[#C62828]" : "text-[#003366]"}`}>
                        {Number(product.stock || 0)}
                        {product.unit === "kg" && <span className="ml-1 text-xs font-normal">kg</span>}
                      </td>
                      <td className="px-5 py-4">
                        {product.expiry_date ? (
                          <span className={isExpired ? "text-[#C62828] font-medium" : isExpiringSoon ? "text-[#F57C00] font-medium" : "text-[#003366]/70"}>
                            {formatDate(product.expiry_date)}
                          </span>
                        ) : (
                          <span className="text-[#003366]/50">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {formatDate(product.last_restock_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openModal(product)}
                          className="btn-success px-3 py-2 text-xs"
                        >
                          <PackagePlus size={14} /> Qo'shish
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
        ) : filteredProducts.length === 0 ? (
          <div className="panel px-5 py-10 text-center text-[#003366]/70">
            Mahsulot topilmadi
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddStock={openModal}
              compact={false}
            />
          ))
        )}
      </div>

      <AddStockModal
        open={modal.open}
        product={modal.product}
        onClose={closeModal}
        onSave={saveStock}
        saving={saving}
        quantity={quantity}
        setQuantity={setQuantity}
      />
    </div>
  );
}