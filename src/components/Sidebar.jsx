import React from "react";
import { NavLink } from "react-router-dom";
import { Package2 } from "lucide-react";
import clsx from "clsx";

export default function Sidebar({ navItems, appMeta }) {
  return (
    <aside className="flex w-[278px] flex-col bg-[#003366] px-4 py-5 text-[#F5DEB3] shadow-[0_2px_8px_rgba(0,51,102,0.1)]">
      <div className="panel-dark mb-6 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#F5DEB3] text-[#003366]">
            <Package2 size={22} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#F5DEB3]/80">
              ABIDiN
            </p>
            <h2 className="text-lg font-bold">Retail POS</h2>
          </div>
        </div>
        <div className="mt-4 rounded-[8px] border border-white/10 bg-white/8 px-3 py-2 text-sm leading-5 text-[#F5DEB3]/90">
          <p className="font-semibold">{appMeta?.name || "ABIDiN"}</p>
          <p className="text-xs text-[#F5DEB3]/75">
            Versiya {appMeta?.version || "1.0.0"}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#F5DEB3] text-[#003366] shadow-[0_2px_8px_rgba(0,51,102,0.1)]"
                    : "text-[#F5DEB3]/85 hover:bg-white/10 hover:text-[#F5DEB3]",
                )
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
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
