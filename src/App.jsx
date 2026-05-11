import React, { useEffect, useMemo, useState } from "react";
import {
  HashRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  ScanLine,
  Settings,
  ShoppingCart,
  Store,
  ArrowLeftRight,
  Users,
  X,
  Lock,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Cashier from "./pages/Cashier";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import Nasiya from "./pages/Nasiya";
import Qaytarish from "./pages/Qaytarish";
import Mijozlar from "./pages/Mijozlar";
import KassirDashboard from "./components/KassirDashboard";

// Admin Password Modal
function AdminPasswordModal({ open, onClose, onVerify, error, verifying }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      onVerify(password.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-[#F5DEB3] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003366]">
              <Lock size={20} className="text-[#F5DEB3]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#003366]/60">Admin panel</p>
              <h2 className="text-lg font-bold text-[#003366]">Tasdiqlash</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#003366]/10 rounded-lg">
            <X size={20} className="text-[#003366]" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#003366] mb-2">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
              placeholder="Parolni kiriting"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-[#C62828] font-medium">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={verifying || !password.trim()}
              className="flex-1 bg-[#003366] text-[#F5DEB3] py-3 px-4 rounded-lg font-semibold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Tekshirilmoqda..." : "Kirish"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-[rgba(0,51,102,0.2)] text-[#003366] hover:bg-[#003366]/5 font-medium"
            >
              Bekor
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-[#003366]/60 text-center">
          Parol 1 soat davomida saqlanadi
        </p>
      </div>
    </div>
  );
}

const navItems = (user, isAdmin) => [
  { label: "Kassa", to: "/", icon: ScanLine },
  { label: "Mahsulotlar", to: "/products", icon: Store },
  { label: "Sklad", to: "/stock", icon: ShoppingCart },
  { label: "Mijozlar", to: "/mijozlar", icon: Users },
  { label: "Nasiya", to: "/nasiya", icon: CreditCard },
  { label: "Qaytarish", to: "/qaytarish", icon: ArrowLeftReturn },
  ...(isAdmin ? [
    { label: "Hisobot", to: "/reports", icon: BarChart3 },
    { label: "Admin", to: "/admin", icon: Settings }
  ] : []),
];

function ArrowLeftReturn(props) {
  return <ArrowLeftRight {...props} />;
}

const titles = {
  "/": "Kassa",
  "/products": "Mahsulotlar",
  "/stock": "Sklad",
  "/mijozlar": "Mijozlar",
  "/reports": "Hisobot",
  "/nasiya": "Nasiya",
  "/qaytarish": "Qaytarish",
  "/admin": "Admin",
};

function Shell({ user, onLogout, lowStockCount }) {
  const location = useLocation();
  const [appMeta, setAppMeta] = useState({ name: "Abidin", version: "1.0.0" });
  const [storeSettings, setStoreSettings] = useState({ storeName: "Abidin", storeLogo: null });

  // Admin session state
  const [adminVerified, setAdminVerified] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminVerifying, setAdminVerifying] = useState(false);
  const [pendingAdmin, setPendingAdmin] = useState(false);

  const isAdmin = user?.role === "admin";

  // Check admin session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem("abidin_admin_session");
    if (adminSession) {
      try {
        const { timestamp } = JSON.parse(adminSession);
        const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (hoursSince < 1) {
          setAdminVerified(true);
        } else {
          localStorage.removeItem("abidin_admin_session");
        }
      } catch (e) {
        localStorage.removeItem("abidin_admin_session");
      }
    }
  }, []);

  // Handle navigation to admin
  useEffect(() => {
    if (location.pathname === "/admin" && isAdmin && !adminVerified) {
      setPendingAdmin(true);
      setShowAdminModal(true);
    }
  }, [location.pathname, isAdmin, adminVerified]);

  const verifyAdminPassword = async (password) => {
    setAdminVerifying(true);
    setAdminError("");
    try {
      const isValid = await window.abidin.verifyAdminPassword(password);
      if (isValid) {
        setAdminVerified(true);
        localStorage.setItem("abidin_admin_session", JSON.stringify({ timestamp: Date.now() }));
        setShowAdminModal(false);
        setPendingAdmin(false);
      } else {
        setAdminError("Parol noto'g'ri");
      }
    } catch (error) {
      setAdminError("Xatolik yuz berdi");
    } finally {
      setAdminVerifying(false);
    }
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setPendingAdmin(false);
    // Redirect away from admin if not verified
    if (!adminVerified && location.pathname === "/admin") {
      window.location.hash = "#/";
    }
  };

  useEffect(() => {
    let mounted = true;
    if (window.abidin?.getAppMeta) {
      window.abidin.getAppMeta().then((meta) => {
        if (mounted && meta) {
          setAppMeta(meta);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (window.abidin?.getStoreSettings) {
      window.abidin.getStoreSettings().then((settings) => {
        if (settings) {
          setStoreSettings(settings);
        }
      });
    }
  }, []);

  useEffect(() => {
    document.title = `Abidin | ${titles[location.pathname] || "Kassa"}`;
  }, [location.pathname]);

  const currentTitle = useMemo(
    () => titles[location.pathname] || "Kassa",
    [location.pathname],
  );

  const items = useMemo(() => navItems(user, isAdmin), [user, isAdmin]);

  return (
    <div className="flex h-full bg-[#F5DEB3] text-[#1a1a1a]">
      <Sidebar
        navItems={items}
        appMeta={appMeta}
        user={user}
        storeSettings={storeSettings}
        lowStockCount={lowStockCount}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-[rgba(0,51,102,0.2)] bg-[#F5DEB3]/85 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#003366]/70">
                Abidin Retail POS
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#003366]">
                {currentTitle}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="rounded-[8px] border border-[rgba(0,51,102,0.2)] bg-white/55 px-4 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/60">
                    {user.role === "admin" ? "Admin" : "Kassir"}
                  </p>
                  <p className="text-sm font-semibold text-[#003366]">
                    {user.username}
                  </p>
                </div>
              )}
              <div className="rounded-[8px] border border-[rgba(0,51,102,0.2)] bg-white/55 px-4 py-2 text-right shadow-[0_2px_8px_rgba(0,51,102,0.1)]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/60">
                  Oflayn ishlash rejimi
                </p>
                <p className="text-sm font-semibold text-[#003366]">
                  {storeSettings.storeName || "Abidin"} {appMeta.version ? `v${appMeta.version}` : ""}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div key={location.pathname} className="animate-fadeUp">
            <Routes>
              <Route path="/" element={isAdmin ? <Cashier user={user} /> : <KassirDashboard user={user} onLogout={onLogout} />} />
              <Route path="/products" element={<Products isAdmin={isAdmin} />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/mijozlar" element={<Mijozlar />} />
              <Route path="/reports" element={isAdmin ? <Reports /> : <Navigate to="/" replace />} />
              <Route path="/nasiya" element={isAdmin ? <Nasiya /> : <Navigate to="/" replace />} />
              <Route path="/qaytarish" element={<Qaytarish />} />
              <Route path="/admin" element={isAdmin && adminVerified ? <AdminPanel user={user} onLogout={onLogout} /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>

      <AdminPasswordModal
        open={showAdminModal}
        onClose={closeAdminModal}
        onVerify={verifyAdminPassword}
        error={adminError}
        verifying={adminVerifying}
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("abidin_user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        const loginTime = new Date(userData.loginAt);
        const now = new Date();
        const hoursSince = (now - loginTime) / (1000 * 60 * 60);
        if (hoursSince > 8) {
          localStorage.removeItem("abidin_user");
        } else {
          setUser(userData);
        }
      } catch (e) {
        localStorage.removeItem("abidin_user");
      }
    }

    const checkLowStock = async () => {
      try {
        const products = await window.abidin.getLowStockProducts();
        setLowStockCount(products.length);
      } catch (e) {
        // ignore
      }
    };
    checkLowStock();

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("abidin_user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5DEB3]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#003366]/30 border-t-[#003366]"></div>
          <p className="mt-4 text-[#003366]">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      {user ? (
        <Shell user={user} onLogout={handleLogout} lowStockCount={lowStockCount} />
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
}