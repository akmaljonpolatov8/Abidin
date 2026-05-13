import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Package2, AlertTriangle, Lock } from "lucide-react";
import clsx from "clsx";

const ADMIN_SESSION_KEY = "abidin_admin_session";
const SESSION_DURATION = 30 * 60 * 1000;

export default function Sidebar({
  navItems,
  appMeta,
  user,
  storeSettings,
  lowStockCount = 0,
  onLogout,
}) {
  const [stockAlerts, setStockAlerts] = useState({ low: 0, expired: 0 });

  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        const [lowStock, expired] = await Promise.all([
          window.abidin.getLowStockProducts(),
          window.abidin.getExpiredProducts(),
        ]);
        setStockAlerts({ low: lowStock.length, expired: expired.length });
      } catch (e) {}
    };
    loadStockAlerts();
  }, []);

  const { storeLogo, storeName } = storeSettings || {};
  const totalAlerts = (stockAlerts.low || 0) + (stockAlerts.expired || 0);

  return (
    <aside className="flex w-[280px] flex-col sidebar-glass px-5 py-6 text-[#F5DEB3]">
      {/* Logo Area - Glassmorphism Card */}
      <div className="mb-6 rounded-[16px] bg-white/10 backdrop-blur-sm border border-white/10 p-4">
        <div className="flex items-center gap-4">
          {storeLogo ? (
            <div className="relative flex items-center justify-center">
              <img
                src={`file://${storeLogo}`}
                alt="Logo"
                className="h-16 w-auto max-w-[100px] object-contain rounded-[12px] shadow-lg"
              />
            </div>
          ) : (
            <div className="glass flex h-14 w-14 items-center justify-center rounded-[12px]">
              <Package2 size={28} className="text-white" />
            </div>
          )}
          <div>
            <p className="text-2xl font-black tracking-widest gradient-text-white">
              ABIDIN
            </p>
            <p className="text-xs text-white/70">Retail POS</p>
          </div>
        </div>

        <div className="mt-4 rounded-[12px] bg-white/5 p-3">
          <p className="font-bold text-white text-sm">{storeName}</p>
          <p className="text-xs text-white/60 mt-1">
            Versiya {appMeta?.version || "1.0.0"}
          </p>
        </div>

        {user && (
          <div className="mt-3 rounded-[12px] bg-gradient-to-r from-white/10 to-transparent px-3 py-3 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-white/60">
              {user.role === "admin" ? "Administrator" : "Kassir"}
            </p>
            <p className="font-bold text-white mt-1">{user.username}</p>
          </div>
        )}
      </div>

      {/* Stock Alerts */}
      {totalAlerts > 0 && (
        <div className="mb-4 rounded-[12px] bg-gradient-to-r from-red-500/20 to-transparent border border-red-500/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/30 animate-pulse">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-300">
                {stockAlerts.low > 0 && `${stockAlerts.low} ta kam qoldiq`}
                {stockAlerts.low > 0 && stockAlerts.expired > 0 && ", "}
                {stockAlerts.expired > 0 && `${stockAlerts.expired} ta muddati o'tgan`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const showBadge = item.badge && item.badge() > 0;
          const badgeCount = item.badge ? item.badge() : 0;

          return (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              {({ isActive }) => (
                <div
                  className={clsx(
                    "sidebar-item group",
                    isActive
                      ? "sidebar-item-active"
                      : "text-white/80 hover:text-white hover:border-l-transparent"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full sidebar-indicator" />
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    <Icon
                      size={20}
                      className={clsx(
                        "transition-all duration-300 group-hover:scale-110",
                        isActive
                          ? "text-amber-300 scale-110"
                          : "text-white/70 group-hover:text-white"
                      )}
                    />
                    <span className="flex items-center gap-2 font-semibold">
                      {item.label}
                      {item.to === "/admin" &&
                        (() => {
                          const ts = Number(
                            localStorage.getItem(ADMIN_SESSION_KEY) || 0,
                          );
                          const unlocked = ts && Date.now() - ts < SESSION_DURATION;
                          return (
                            <Lock
                              size={14}
                              className={unlocked ? "text-emerald-400" : "text-red-400"}
                            />
                          );
                        })()}
                    </span>
                  </div>

                  {showBadge && (
                    <span
                      className={clsx(
                        "flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold text-white shadow-lg transition-all duration-300 z-10",
                        isActive
                          ? "bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/50 animate-glow-pulse"
                          : "bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30"
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Offline Mode Info */}
      <div className="rounded-[12px] bg-gradient-to-r from-white/10 to-transparent border border-white/10 px-4 py-3 mb-4">
        <p className="font-semibold text-white text-xs">Oflayn rejim</p>
        <p className="text-xs text-white/60 mt-1 leading-relaxed">
          Internet talab qilinmaydi. Ma'lumotlar lokal SQLite bazada saqlanadi.
        </p>
      </div>

      {/* Logout Button */}
      {onLogout ? (
        <button
          type="button"
          onClick={onLogout}
          className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1 logout-btn"
          aria-label="Chiqish"
        >
          <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
            <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white" aria-hidden="true">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
          </div>
          <span className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Chiqish
          </span>
        </button>
      ) : null}
    </aside>
  );
}