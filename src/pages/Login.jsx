import React, { useState, useEffect } from "react";
import { Package2, Lock, User } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Blokpost",
    storeLogo: null
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.abidin.getStoreSettings();
        if (settings) {
          setStoreSettings(settings);
        }
      } catch (e) {
        // use defaults
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Foydalanuvchi nomi va parol kiritilmagan");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await window.abidin.login(username, password);
      if (user) {
        localStorage.setItem("abidin_user", JSON.stringify({
          ...user,
          loginAt: new Date().toISOString(),
        }));
        onLogin(user);
      } else {
        setError("Noto'g'ri foydalanuvchi nomi yoki parol");
      }
    } catch (err) {
      setError("Tizim xatosi: " + (err.message || "Qayta urinib ko'ring"));
    } finally {
      setLoading(false);
    }
  };

  const storeName = storeSettings.storeName || "Blokpost";
  const storeLogo = storeSettings.storeLogo;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5DEB3] p-4">
      <div className="w-full max-w-md">
        <div className="panel border border-[rgba(0,51,102,0.18)] bg-white/85 px-8 py-10 shadow-xl">
          <div className="mb-8 flex flex-col items-center">
            {storeLogo ? (
              <img
                src={`file://${storeLogo}`}
                alt="Logo"
                className="mb-4 h-auto max-w-[180px] rounded-[8px] object-contain"
              />
            ) : (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[12px] bg-[#003366] text-[#F5DEB3] shadow-lg">
                <Package2 size={32} />
              </div>
            )}
            <h1 className="text-2xl font-bold text-[#003366]">{storeName}</h1>
            <p className="mt-1 text-sm text-[#003366]/70">Tizimga kirish</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-[8px] bg-[#C62828]/10 px-4 py-3 text-sm font-medium text-[#C62828]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#003366]">
                Foydalanuvchi nomi
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/50"
                  size={18}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="field pl-10"
                  placeholder="admin"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#003366]">Parol</label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#003366]/50"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? "Kirish..." : "Kirish"}
            </button>
          </form>

          <div className="mt-6 rounded-[8px] bg-[#003366]/5 px-4 py-3 text-center text-xs text-[#003366]/70">
            <p>Admin: admin / abidin2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}