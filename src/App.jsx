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

const navItems = (user, isAdmin) => [
  { label: "Kassa", to: "/", icon: ScanLine },
  { label: "Mahsulotlar", to: "/products", icon: Store },
  { label: "Sklad", to: "/stock", icon: ShoppingCart },
  { label: "Mijozlar", to: "/mijozlar", icon: Users },
  { label: "Nasiya", to: "/nasiya", icon: CreditCard },
  { label: "Qaytarish", to: "/qaytarish", icon: ArrowLeftReturn },
  { label: "Hisobot", to: "/reports", icon: BarChart3 },
  ...(isAdmin ? [{ label: "Admin", to: "/admin", icon: Settings }] : []),
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

  const isAdmin = user?.role === "admin";

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
              <Route path="/admin" element={isAdmin ? <AdminPanel user={user} onLogout={onLogout} /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>
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