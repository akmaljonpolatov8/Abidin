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
  ActivitySquare,
  BarChart3,
  ScanLine,
  ShoppingCart,
  Store,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Cashier from "./pages/Cashier";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";

const navItems = [
  { label: "Kassa", to: "/", icon: ScanLine },
  { label: "Mahsulotlar", to: "/products", icon: Store },
  { label: "Sklad", to: "/stock", icon: ShoppingCart },
  { label: "Hisobot", to: "/reports", icon: BarChart3 },
];

const titles = {
  "/": "Kassa",
  "/products": "Mahsulotlar",
  "/stock": "Sklad",
  "/reports": "Hisobot",
};

function Shell() {
  const location = useLocation();
  const [appMeta, setAppMeta] = useState({ name: "ABIDiN", version: "1.0.0" });

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
    document.title = `ABIDiN | ${titles[location.pathname] || "Kassa"}`;
  }, [location.pathname]);

  const currentTitle = useMemo(
    () => titles[location.pathname] || "Kassa",
    [location.pathname],
  );

  return (
    <div className="flex h-full bg-[#F5DEB3] text-[#1a1a1a]">
      <Sidebar navItems={navItems} appMeta={appMeta} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-[rgba(0,51,102,0.2)] bg-[#F5DEB3]/85 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#003366]/70">
                ABIDiN Retail POS
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#003366]">
                {currentTitle}
              </h1>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.2)] bg-white/55 px-4 py-2 text-right shadow-[0_2px_8px_rgba(0,51,102,0.1)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/60">
                Oflayn ishlash rejimi
              </p>
              <p className="text-sm font-semibold text-[#003366]">
                {appMeta.name} {appMeta.version ? `v${appMeta.version}` : ""}
              </p>
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div key={location.pathname} className="animate-fadeUp">
            <Routes location={location}>
              <Route path="/" element={<Cashier />} />
              <Route path="/products" element={<Products />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
