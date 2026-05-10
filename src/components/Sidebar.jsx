import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Package2, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function Sidebar({ navItems, appMeta, user, storeSettings, lowStockCount = 0 }) {
  const [stockAlerts, setStockAlerts] = useState({ low: 0, expired: 0 });

  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        const [lowStock, expired] = await Promise.all([
          window.abidin.getLowStockProducts(),
          window.abidin.getExpiredProducts(),
        ]);
        setStockAlerts({
          low: lowStock.length,
          expired: expired.length,
        });
      } catch (e) {
        // ignore
      }
    };
    loadStockAlerts();
  }, []);

  const totalAlerts = stockAlerts.low + stockAlerts.expired;
  const storeName = storeSettings?.storeName || "Abidin";
  const storeLogo = storeSettings?.storeLogo;

  return (
    <aside className="flex w-[278px] flex-col bg-[#003366] px-4 py-5 text-[#F5DEB3] shadow-[0_2px_8px_rgba(0,51,102,0.1)]">
      <div className="panel-dark mb-6 px-4 py-4">
        <div className="flex items-center gap-3">
          {storeLogo ? (
            <img
              src={`file://${storeLogo}`}
              alt="Logo"
              className="h-11 w-11 rounded-[8px] object-contain bg-white"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#F5DEB3] text-[#003366]">
              <Package2 size={22} />
            </div>
          )}
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#F5DEB3]/80">
              Abidin
            </p>
            <h2 className="text-lg font-bold">{storeName}</h2>
          </div>
        </div>
        <div className="mt-4 rounded-[8px] border border-white/10 bg-white/8 px-3 py-2 text-sm leading-5 text-[#F5DEB3]/90">
          <p className="font-semibold">{storeName}</p>
          <p className="text-xs text-[#F5DEB3]/75">
            Versiya {appMeta?.version || "1.0.0"}
          </p>
        </div>
        {user && (
          <div className="mt-3 rounded-[8px] border border-white/10 bg-white/5 px-3 py-2 text-xs">
            <p className="text-[#F5DEB3]/70">{user.role === "admin" ? "Admin" : "Kassir"}</p>
            <p className="font-semibold text-[#F5DEB3]">{user.username}</p>
          </div>
        )}
      </div>

      {totalAlerts > 0 && (
        <div className="mb-4 rounded-[8px] bg-[#C62828]/20 px-3 py-2">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle size={14} className="text-[#C62828]" />
            <span className="font-medium text-[#F5DEB3]">
              {stockAlerts.low > 0 && `${stockAlerts.low} ta kam qoldiq`}
              {stockAlerts.low > 0 && stockAlerts.expired > 0 && ", "}
              {stockAlerts.expired > 0 && `${stockAlerts.expired} ta muddati o'tgan`}
            </span>
          </div>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const showBadge = item.badge && item.badge() > 0;
          const badgeCount = item.badge ? item.badge() : 0;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center justify-between rounded-[8px] px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#F5DEB3] text-[#003366] shadow-[0_2px_8px_rgba(0,51,102,0.1)]"
                    : "text-[#F5DEB3]/85 hover:bg-white/10 hover:text-[#F5DEB3]"
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {showBadge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C62828] px-1.5 text-[10px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[8px] border border-white/10 bg-white/10 px-4 py-3 text-xs leading-5 text-[#F5DEB3]/80">
        <p className="font-semibold text-[#F5DEB3]">Oflayn rejim</p>
        <p>
          Internet talab qilinmaydi. Ma'lumotlar lokal SQLite bazada saqlanadi.
        </p>
      </div>
    </aside>
  );
}