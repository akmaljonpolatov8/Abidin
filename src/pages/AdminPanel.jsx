import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Users, X, Upload, Image, Save, KeyRound } from "lucide-react";

function formatDate(value) {
  if (!value) return "Yo'q";
  return new Date(value).toLocaleString("uz-UZ");
}

function UserModal({ open, onClose, onSave, saving, editUser }) {
  const [form, setForm] = useState({ username: "", password: "", role: "kassir" });

  useEffect(() => {
    if (open && editUser) {
      setForm({ username: editUser.username, password: "", role: editUser.role });
    } else if (open) {
      setForm({ username: "", password: "", role: "kassir" });
    }
  }, [open, editUser]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-md overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">
              Foydalanuvchilar
            </p>
            <h2 className="text-xl font-bold text-[#003366]">
              {editUser ? "Tahrirlash" : "Yangi foydalanuvchi"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Foydalanuvchi nomi</span>
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="field"
              placeholder="foydalanuvchi_nomi"
            />
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Parol</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="field"
              placeholder={editUser ? "Yangi parol (bo'sh = o'zgartirmaslik)" : "parol"}
            />
          </label>
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-[#003366]">Rol</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: "admin" }))}
                className={`flex-1 rounded-[8px] px-4 py-3 text-sm font-medium transition-colors ${
                  form.role === "admin"
                    ? "bg-[#003366] text-[#F5DEB3]"
                    : "bg-white text-[#003366] border border-[rgba(0,51,102,0.2)]"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: "kassir" }))}
                className={`flex-1 rounded-[8px] px-4 py-3 text-sm font-medium transition-colors ${
                  form.role === "kassir"
                    ? "bg-[#003366] text-[#F5DEB3]"
                    : "bg-white text-[#003366] border border-[rgba(0,51,102,0.2)]"
                }`}
              >
                Kassir
              </button>
            </div>
          </label>
        </div>

        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button type="button" onClick={() => onSave(form)} disabled={saving} className="btn-primary">
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

export default function AdminPanel({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState({ open: false, editUser: null });
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Blokpost",
    storePhone: "",
    storeAddress: "",
    receiptFooter: "Rahmat! Yana keling 😊",
    storeLogo: null
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const fileInputRef = useRef(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await window.abidin.listUsers();
      setUsers(list);
    } catch (error) {
      setNotice(error.message || "Foydalanuvchilar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const loadStoreSettings = async () => {
    try {
      const settings = await window.abidin.getStoreSettings();
      if (settings) {
        setStoreSettings(settings);
      }
    } catch (error) {
      console.error("Settings load error:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStoreSettings();
  }, []);

  const openCreate = () => {
    setModal({ open: true, editUser: null });
  };

  const closeModal = () => {
    setModal({ open: false, editUser: null });
  };

  const saveUser = async (form) => {
    if (!form.username || (!form.password && !modal.editUser)) {
      setNotice("Foydalanuvchi nomi va parol kiritilmagan");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      if (modal.editUser) {
        setNotice("Tahrirlash endi mavjud emas (parolni yangilash uchun API kerak)");
      } else {
        await window.abidin.createUser(form.username, form.password, form.role);
        setNotice("Foydalanuvchi qo'shildi");
      }
      closeModal();
      await loadUsers();
    } catch (error) {
      setNotice(error.message || "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`${u.username} foydalanuvchisini o'chirmoqchimisiz?`)) return;
    try {
      await window.abidin.deleteUser(u.id);
      setNotice("Foydalanuvchi o'chirildi");
      await loadUsers();
    } catch (error) {
      setNotice(error.message || "O'chirishda xatolik");
    }
  };

  const handleSettingChange = async (field, value) => {
    setStoreSettings((s) => ({ ...s, [field]: value }));
  };

  const saveStoreSettings = async () => {
    setSaving(true);
    setNotice("");
    try {
      await window.abidin.setStoreSettings({
        storeName: storeSettings.storeName,
        storePhone: storeSettings.storePhone,
        storeAddress: storeSettings.storeAddress,
        receiptFooter: storeSettings.receiptFooter,
      });
      setNotice("Sozlamalar saqlandi ✓");
    } catch (error) {
      setNotice("Xatolik: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotice("Fayl hajmi 2MB dan oshmasligi kerak");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setNotice("Faqat PNG yoki JPG fayllar ruxsat etiladi");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const result = await window.abidin.saveLogo(base64);
        if (result.success) {
          setStoreSettings((s) => ({ ...s, storeLogo: result.path }));
          setNotice("Logo muvaffaqiyatli yuklandi");
        } else {
          setNotice("Logo yuklashda xatolik: " + (result.error || ""));
        }
      } catch (error) {
        setNotice("Xatolik yuz berdi");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = async () => {
    try {
      await window.abidin.setStoreSettings({ storeLogo: null });
      setStoreSettings((s) => ({ ...s, storeLogo: null }));
      setNotice("Logo olib tashlandi");
    } catch (error) {
      setNotice("Xatolik yuz berdi");
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setNotice("Barcha maydonlarni to'ldiring");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice("Yangi parollar mos kelmadi");
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      setNotice("Parol kamida 4 ta belgi bo'lishi kerak");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      await window.abidin.changePassword(user.username, passwordForm.currentPassword, passwordForm.newPassword);
      setNotice("Parol muvaffaqiyatli o'zgartirildi ✓");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setNotice("Xatolik: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Boshqaruv
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Admin paneli
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.2)] bg-white/60 px-4 py-2">
              <p className="text-xs text-[#003366]/60">Foydalanuvchi</p>
              <p className="font-semibold text-[#003366]">{user.username}</p>
            </div>
            <button type="button" onClick={onLogout} className="btn-danger">
              Chiqish
            </button>
          </div>
        </div>
        {notice ? (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") || notice.includes("emas") || notice.includes("noto'g'ri") || notice.includes("Mos") || notice.includes("kamida") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        ) : null}
      </section>

      {/* Section 1: Do'kon ma'lumotlari */}
      <section className="panel px-5 py-5">
        <h3 className="mb-5 text-lg font-bold text-[#003366]">Do'kon ma'lumotlari</h3>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <label className="space-y-3 block">
              <span className="text-sm font-semibold text-[#003366]">Logo</span>
              <div className="flex items-center gap-4">
                {storeSettings.storeLogo ? (
                  <div className="relative">
                    <img
                      src={`file://${storeSettings.storeLogo}`}
                      alt="Logo"
                      className="h-20 w-auto max-w-[200px] rounded-[8px] object-contain border border-[rgba(0,51,102,0.2)]"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C62828] text-white hover:bg-[#B71C1C]"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-20 w-32 items-center justify-center rounded-[8px] bg-[#003366]/10 border border-[rgba(0,51,102,0.2)]">
                    <div className="text-center">
                      <div className="mx-auto h-10 w-10 rounded-full bg-[#003366] text-[#F5DEB3] flex items-center justify-center text-lg font-bold">
                        {getInitials(storeSettings.storeName)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-sm"
                >
                  <Upload size={14} /> Logo yuklash
                </button>
                {storeSettings.storeLogo && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="btn-ghost text-sm"
                  >
                    O'chirish
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-[#003366]/60">PNG yoki JPG, max 2MB</p>
            </label>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#003366]">Do'kon nomi</span>
                <input
                  value={storeSettings.storeName}
                  onChange={(e) => handleSettingChange("storeName", e.target.value)}
                  className="field"
                  placeholder="Blokpost"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#003366]">Telefon</span>
                <input
                  value={storeSettings.storePhone}
                  onChange={(e) => handleSettingChange("storePhone", e.target.value)}
                  className="field"
                  placeholder="+998 90 123-45-67"
                />
              </label>
            </div>
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-[#003366]">Manzil</span>
              <input
                value={storeSettings.storeAddress}
                onChange={(e) => handleSettingChange("storeAddress", e.target.value)}
                className="field"
                placeholder="Toshkent, Amir Temur ko'chasi 1"
              />
            </label>
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-[#003366]">Chek pastki matni</span>
              <input
                value={storeSettings.receiptFooter}
                onChange={(e) => handleSettingChange("receiptFooter", e.target.value)}
                className="field"
                placeholder="Rahmat! Yana keling 😊"
              />
            </label>
            <button
              type="button"
              onClick={saveStoreSettings}
              disabled={saving}
              className="btn-success"
            >
              <Save size={16} /> {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Admin paroli */}
      <section className="panel px-5 py-5">
        <h3 className="mb-5 text-lg font-bold text-[#003366]">Admin paroli</h3>
        <div className="grid gap-4 md:grid-cols-3 max-w-2xl">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#003366]">Joriy parol</span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="field"
              placeholder="****"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#003366]">Yangi parol</span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
              className="field"
              placeholder="****"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#003366]">Tasdiqlash</span>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="field"
              placeholder="****"
            />
          </label>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={changePassword}
            disabled={saving}
            className="btn-primary"
          >
            <KeyRound size={16} /> {saving ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
          </button>
        </div>
      </section>

      <section className="panel px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#003366]">Foydalanuvchilar ro'yxati</h3>
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Yangi foydalanuvchi
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#003366]/5 text-[#003366]">
              <tr>
                <th className="px-5 py-3">Foydalanuvchi</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Yaratilgan</th>
                <th className="px-5 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-[#003366]/70" colSpan={4}>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-[#003366]/70" colSpan={4}>
                    Foydalanuvchilar yo'q
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-[rgba(0,51,102,0.1)] bg-white/45">
                    <td className="px-5 py-4 font-semibold text-[#003366]">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#003366]/60" />
                        {u.username}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-[#C62828]/15 text-[#C62828]"
                            : "bg-[#2E7D32]/15 text-[#2E7D32]"
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "Kassir"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      {u.role === "kassir" && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => deleteUser(u)}
                            className="btn-danger px-3 py-2 text-xs"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel px-5 py-5">
        <h3 className="mb-4 text-lg font-bold text-[#003366]">Ma'lumot</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-[#003366]">Umumiy foydalanuvchilar</p>
            <p className="mt-1 text-2xl font-bold text-[#003366]">{users.length}</p>
          </div>
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-[#003366]">Adminlar soni</p>
            <p className="mt-1 text-2xl font-bold text-[#003366]">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>
        </div>
      </section>

      <UserModal
        open={modal.open}
        editUser={modal.editUser}
        onClose={closeModal}
        onSave={saveUser}
        saving={saving}
      />
    </div>
  );
}