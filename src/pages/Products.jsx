import React, { useEffect, useMemo, useRef, useState } from "react";
import { PencilLine, Plus, Search, Trash2, X } from "lucide-react";
import ProductCard from "../components/ProductCard";

const emptyForm = {
  name: "",
  barcode: "",
  price: "",
  stock: 0,
  unit: "dona",
  cost_price: "",
  discount_percent: "",
  expiry_date: "",
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function ProductModal({ open, mode, form, setForm, onClose, onSave, saving, isAdmin }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => barcodeRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-xl overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Mahsulot
            </p>
            <h2 className="text-xl font-bold text-[#003366]">
              {mode === "create"
                ? "Mahsulot qo'shish"
                : "Mahsulotni tahrirlash"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-3 py-2 text-sm"
          >
            <X size={16} /> Yopish
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-[#003366]">Nomi</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="field"
              placeholder="Masalan: Pepsi 1L"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#003366]">
              Barcode
            </span>
            <input
              ref={barcodeRef}
              value={form.barcode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  barcode: event.target.value,
                }))
              }
              className="field"
              placeholder="Barcode ni skanerlang yoki kiriting"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#003366]">Narx</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              className="field"
              placeholder="0"
            />
          </label>
          {isAdmin && (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#003366]">Tannarx (xarajat)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost_price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cost_price: event.target.value,
                  }))
                }
                className="field"
                placeholder="0"
              />
            </label>
          )}
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#003366]">Chegirma %</span>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={form.discount_percent}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discount_percent: event.target.value,
                }))
              }
              className="field"
              placeholder="0"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#003366]">Muddati</span>
            <input
              type="date"
              value={form.expiry_date}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  expiry_date: event.target.value,
                }))
              }
              className="field"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-[#003366]">
              Boshlang'ich qoldiq
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  stock: event.target.value,
                }))
              }
              className="field"
              placeholder="0"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-[#003366]">Birligi</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, unit: "dona" }))}
                className={`flex-1 rounded-[8px] px-4 py-3 text-sm font-medium transition-colors ${
                  form.unit === "dona"
                    ? "bg-[#003366] text-[#F5DEB3]"
                    : "bg-white text-[#003366] border border-[rgba(0,51,102,0.2)]"
                }`}
              >
                Dona
              </button>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, unit: "kg" }))}
                className={`flex-1 rounded-[8px] px-4 py-3 text-sm font-medium transition-colors ${
                  form.unit === "kg"
                    ? "bg-[#003366] text-[#F5DEB3]"
                    : "bg-white text-[#003366] border border-[rgba(0,51,102,0.2)]"
                }`}
              >
                Kg
              </button>
            </div>
          </label>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn-primary"
          >
            <Plus size={16} /> {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products({ isAdmin = false }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    id: null,
    form: emptyForm,
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await window.abidin.listProducts();
      setProducts(list);
    } catch (error) {
      setNotice(error.message || "Mahsulotlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return products;
    }
    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const barcode = String(product.barcode || "").toLowerCase();
      return name.includes(term) || barcode.includes(term);
    });
  }, [products, query]);

  const openCreate = () => {
    setModal({ open: true, mode: "create", id: null, form: emptyForm });
  };

  const openEdit = (product) => {
    setModal({
      open: true,
      mode: "edit",
      id: product.id,
      form: {
        name: product.name,
        barcode: product.barcode,
        price: String(product.price),
        stock: String(product.stock ?? 0),
        unit: product.unit === "kg" ? "kg" : "dona",
        cost_price: String(product.cost_price || ""),
        discount_percent: String(product.discount_percent || ""),
        expiry_date: product.expiry_date || "",
      },
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create", id: null, form: emptyForm });
  };

  const saveProduct = async () => {
    if (saving) return;
    setSaving(true);
    setNotice("");
    try {
      const payload = {
        name: modal.form.name,
        barcode: modal.form.barcode,
        price: Number(modal.form.price),
        stock: Number(modal.form.stock),
        unit: modal.form.unit || "dona",
        cost_price: Number(modal.form.cost_price || 0),
        discount_percent: Math.min(100, Math.max(0, Number(modal.form.discount_percent || 0))),
        expiry_date: modal.form.expiry_date || null,
      };
      if (modal.mode === "create") {
        await window.abidin.createProduct(payload);
        setNotice("Mahsulot qo'shildi");
      } else {
        await window.abidin.updateProduct(modal.id, payload);
        setNotice("Mahsulot yangilandi");
      }
      closeModal();
      await loadProducts();
    } catch (error) {
      setNotice(error.message || "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    const confirmed = window.confirm(
      `${product.name} mahsulotini o'chirmoqchimisiz?`,
    );
    if (!confirmed) return;
    try {
      const result = await window.abidin.deleteProduct(product.id);
      if (!result?.success) {
        throw new Error(result?.message || "O'chirish amalga oshmadi");
      }
      setNotice("Mahsulot o'chirildi");
      await loadProducts();
    } catch (error) {
      setNotice(error.message || "O'chirishda xatolik");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Mahsulotlar bazasi
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Katalog va narxlar
            </h2>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Mahsulot qo'shish
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/55"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nomi yoki barcode bo'yicha qidirish"
              className="field pl-10"
            />
          </div>
          <button type="button" onClick={loadProducts} className="btn-ghost">
            Yangilash
          </button>
        </div>
        {notice ? (
          <p className="mt-4 text-sm font-medium text-[#003366]">{notice}</p>
        ) : null}
      </section>

      <section className="table-shell hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#003366]/5 text-[#003366]">
              <tr>
                <th className="px-5 py-3">Nomi</th>
                <th className="px-5 py-3">Barcode</th>
                <th className="px-5 py-3">Narx</th>
                {isAdmin && <th className="px-5 py-3">Tannarx</th>}
                <th className="px-5 py-3">Chegirma</th>
                <th className="px-5 py-3">Birligi</th>
                <th className="px-5 py-3">Muddati</th>
                <th className="px-5 py-3">Qoldiq</th>
                <th className="px-5 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-[#003366]/70"
                    colSpan={isAdmin ? 10 : 9}
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-[#003366]/70"
                    colSpan={isAdmin ? 10 : 9}
                  >
                    Mahsulot topilmadi
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                  >
                    <td className="px-5 py-4 font-semibold text-[#003366]">
                      {product.name}
                    </td>
                    <td className="px-5 py-4">{product.barcode}</td>
                    <td className="px-5 py-4">
                      {Number(product.discount_percent || 0) > 0 ? (
                        <div>
                          <span className="text-[#003366]/50 line-through text-xs">
                            {formatMoney(product.price)} so'm
                          </span>
                          <div className="font-medium text-[#2E7D32]">
                            {formatMoney(product.price * (1 - (product.discount_percent || 0) / 100))} so'm
                          </div>
                        </div>
                      ) : (
                        <span>{formatMoney(product.price)} so'm</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-[#003366]/70">
                        {product.cost_price ? formatMoney(product.cost_price) + " so'm" : "-"}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      {Number(product.discount_percent || 0) > 0 ? (
                        <span className="rounded bg-[#C62828]/15 px-2 py-1 text-xs font-bold text-[#C62828]">
                          -{product.discount_percent}%
                        </span>
                      ) : (
                        <span className="text-[#003366]/50">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          product.unit === "kg"
                            ? "bg-[#2E7D32]/15 text-[#2E7D32]"
                            : "bg-[#003366]/10 text-[#003366]"
                        }`}
                      >
                        {product.unit === "kg" ? "Kg" : "Dona"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {product.expiry_date ? (
                        <span className={new Date(product.expiry_date) < new Date() ? "text-[#C62828] font-medium" : "text-[#003366]/70"}>
                          {formatDate(product.expiry_date)}
                        </span>
                      ) : (
                        <span className="text-[#003366]/50">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">{Number(product.stock || 0)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="btn-ghost px-3 py-2 text-xs"
                        >
                          <PencilLine size={14} /> Tahrirlash
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => removeProduct(product)}
                            className="btn-danger px-3 py-2 text-xs"
                          >
                            <Trash2 size={14} /> O'chirish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
              onEdit={openEdit}
              onDelete={isAdmin ? removeProduct : null}
            />
          ))
        )}
      </div>

      <ProductModal
        open={modal.open}
        mode={modal.mode}
        form={modal.form}
        setForm={(updater) =>
          setModal((current) => ({
            ...current,
            form:
              typeof updater === "function" ? updater(current.form) : updater,
          }))
        }
        onClose={closeModal}
        onSave={saveProduct}
        saving={saving}
        isAdmin={isAdmin}
      />
    </div>
  );
}