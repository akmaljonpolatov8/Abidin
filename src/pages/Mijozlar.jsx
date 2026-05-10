import React, { useEffect, useState } from "react";
import { Plus, Search, PencilLine, Trash2, Phone, User, Calendar, ShoppingBag, X } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("uz-UZ");
}

function CustomerModal({ open, onClose, onSave, saving, editCustomer }) {
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (open) {
      if (editCustomer) {
        setForm({ name: editCustomer.name, phone: editCustomer.phone || "" });
      } else {
        setForm({ name: "", phone: "" });
      }
    }
  }, [open, editCustomer]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Mijoz
            </p>
            <h2 className="text-xl font-bold text-[#003366]">
              {editCustomer ? "Mijozni tahrirlash" : "Yangi mijoz"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Ism familiya *</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="field"
              placeholder="Ism familiya"
            />
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Telefon raqam</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="field"
              placeholder="+998 90 123 45 67"
            />
          </label>
        </div>

        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={saving || !form.name}
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

function CustomerHistoryModal({ open, customer, history, stats, onClose }) {
  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Mijoz
            </p>
            <h2 className="text-xl font-bold text-[#003366]">{customer.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: "70vh" }}>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs text-[#003366]/60">Sotuvlar soni</p>
              <p className="text-2xl font-bold text-[#003366]">{stats.purchaseCount}</p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs text-[#003366]/60">Jami xarajat</p>
              <p className="text-2xl font-bold text-[#2E7D32]">{formatMoney(stats.totalSpent)} so'm</p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
              <p className="text-xs text-[#003366]/60">Oxirgi kelgan</p>
              <p className="text-lg font-semibold text-[#003366]">{formatDate(stats.lastVisit)}</p>
            </div>
          </div>

          <h4 className="mb-3 font-semibold text-[#003366]">Sotuvlar tarixi</h4>
          {history.length === 0 ? (
            <p className="text-center text-[#003366]/70">Sotuvlar yo'q</p>
          ) : (
            <div className="space-y-2">
              {history.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-[#003366]">Chek #{sale.id}</p>
                    <p className="text-xs text-[#003366]/70">{formatDate(sale.soldAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#003366]">{formatMoney(sale.total)} so'm</p>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${
                        sale.paymentType === "naqt"
                          ? "bg-[#2E7D32]/15 text-[#2E7D32]"
                          : sale.paymentType === "karta"
                          ? "bg-[#003366]/15 text-[#003366]"
                          : "bg-[#E65100]/15 text-[#E65100]"
                      }`}
                    >
                      {sale.paymentType === "naqt" ? "Naqt" : sale.paymentType === "karta" ? "Karta" : "Click"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Mijozlar() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState({ open: false, editCustomer: null });
  const [historyModal, setHistoryModal] = useState({ open: false, customer: null, history: [], stats: {} });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const list = await window.abidin.searchCustomers(searchQuery);
      setCustomers(list);
    } catch (error) {
      setNotice(error.message || "Mijozlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const openCreate = () => {
    setModal({ open: true, editCustomer: null });
  };

  const openEdit = (customer) => {
    setModal({ open: true, editCustomer: customer });
  };

  const closeModal = () => {
    setModal({ open: false, editCustomer: null });
  };

  const saveCustomer = async (form) => {
    if (!form.name) {
      setNotice("Ism kiritilmagan");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      if (modal.editCustomer) {
        await window.abidin.updateCustomer(modal.editCustomer.id, form.name, form.phone || null);
        setNotice("Mijoz yangilandi");
      } else {
        await window.abidin.createCustomer(form.name, form.phone || null);
        setNotice("Mijoz qo'shildi");
      }
      closeModal();
      await loadCustomers();
    } catch (error) {
      setNotice(error.message || "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`${customer.name} mijozini o'chirmoqchimisiz?`)) return;
    try {
      await window.abidin.deleteCustomer(customer.id);
      setNotice("Mijoz o'chirildi");
      await loadCustomers();
    } catch (error) {
      setNotice(error.message || "O'chirishda xatolik");
    }
  };

  const openHistory = async (customer) => {
    try {
      const [stats, history] = await Promise.all([
        window.abidin.getCustomerStats(customer.id),
        window.abidin.getCustomerHistory(customer.id),
      ]);
      setHistoryModal({ open: true, customer, history, stats });
    } catch (error) {
      setNotice("Tarixni yuklashda xatolik");
    }
  };

  const closeHistoryModal = () => {
    setHistoryModal({ open: false, customer: null, history: [], stats: {} });
  };

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Mijozlar bazasi
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Ro'yxat va tarix
            </h2>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Mijoz qo'shish
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/55"
              size={16}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism yoki telefon bo'yicha qidirish"
              className="field pl-10"
            />
          </div>
          <button type="button" onClick={loadCustomers} className="btn-ghost">
            Yangilash
          </button>
        </div>
        {notice ? (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        ) : null}
      </section>

      <section className="table-shell hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#003366]/5 text-[#003366]">
              <tr>
                <th className="px-5 py-3">Mijoz</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">Sotuvlar</th>
                <th className="px-5 py-3">Jami</th>
                <th className="px-5 py-3">Oxirgi kelgan</th>
                <th className="px-5 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-[#003366]/70" colSpan={6}>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-[#003366]/70" colSpan={6}>
                    Mijoz topilmadi
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-semibold text-[#003366]">
                        <User size={14} className="text-[#003366]/60" />
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {customer.phone ? (
                        <div className="flex items-center gap-2 text-[#003366]/70">
                          <Phone size={14} className="text-[#003366]/60" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-[#003366]/50">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openHistory(customer)}
                        className="flex items-center gap-1 text-[#003366] hover:text-[#003366]/70"
                      >
                        <ShoppingBag size={14} />
                        Ko'rish
                      </button>
                    </td>
                    <td className="px-5 py-4 text-[#003366]/70">-</td>
                    <td className="px-5 py-4 text-[#003366]/70">
                      {customer.created_at ? formatDate(customer.created_at) : "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          className="btn-ghost px-3 py-2 text-xs"
                        >
                          <PencilLine size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCustomer(customer)}
                          className="btn-danger px-3 py-2 text-xs"
                        >
                          <Trash2 size={14} />
                        </button>
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
        ) : customers.length === 0 ? (
          <div className="panel px-5 py-10 text-center text-[#003366]/70">
            Mijoz topilmadi
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="panel px-4 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[#003366]">{customer.name}</h4>
                  {customer.phone && (
                    <p className="text-xs text-[#003366]/70">{customer.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openHistory(customer)}
                    className="btn-ghost px-2 py-1 text-xs"
                  >
                    Tarix
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(customer)}
                    className="btn-ghost px-2 py-1 text-xs"
                  >
                    <PencilLine size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CustomerModal
        open={modal.open}
        editCustomer={modal.editCustomer}
        onClose={closeModal}
        onSave={saveCustomer}
        saving={saving}
      />

      <CustomerHistoryModal
        open={historyModal.open}
        customer={historyModal.customer}
        history={historyModal.history}
        stats={historyModal.stats}
        onClose={closeHistoryModal}
      />
    </div>
  );
}