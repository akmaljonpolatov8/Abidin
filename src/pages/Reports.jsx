import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, RefreshCw, TrendingUp } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function SimpleBarChart({ data, dataKey = "total", labelKey = "sold_date" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-[#003366]/50">
        Ma'lumot yo'q
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d[dataKey] || 0));

  return (
    <div className="flex h-40 items-end gap-2 px-2">
      {data.map((item, index) => {
        const value = item[dataKey] || 0;
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const label = item[labelKey] ? new Date(item[labelKey]).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }) : `${index + 1}`;

        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-[#003366] transition-all duration-300"
              style={{ height: `${height}%`, minHeight: value > 0 ? "4px" : "0" }}
              title={`${formatMoney(value)} so'm`}
            />
            <span className="text-[10px] text-[#003366]/60">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("today");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalDiscount: 0,
    transactionCount: 0,
    paymentStats: { naqt: 0, karta: 0, click: 0 },
  });
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setNotice("");
    try {
      let summaryData, salesData, topProductsData;

      if (activeTab === "today") {
        [summaryData, salesData, topProductsData] = await Promise.all([
          window.abidin.getTodaySummary(),
          window.abidin.getTodaySales(),
          window.abidin.getTopProducts(5),
        ]);
      } else if (activeTab === "week") {
        [summaryData, salesData, topProductsData] = await Promise.all([
          window.abidin.getWeekSummary(),
          window.abidin.getWeekSales(),
          window.abidin.getTopProductsWeek(5),
        ]);
      } else {
        [summaryData, salesData, topProductsData] = await Promise.all([
          window.abidin.getMonthSummary(),
          window.abidin.getMonthSales(),
          window.abidin.getTopProductsMonth(5),
        ]);
      }

      setSummary(summaryData);
      setSales(salesData);
      setTopProducts(topProductsData);
    } catch (error) {
      setNotice(error.message || "Hisobotlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const averageCheck = useMemo(() => {
    if (!summary.transactionCount) return 0;
    return summary.totalSales / summary.transactionCount;
  }, [summary]);

  const totalProfit = useMemo(() => {
    return topProducts.reduce((sum, p) => sum + (p.profit || 0), 0);
  }, [topProducts]);

  const exportToExcel = async () => {
    try {
      const data = await window.abidin.getExportData();
      if (!data || data.length === 0) {
        setNotice("Eksport uchun ma'lumot yo'q");
        return;
      }

      let csvContent = "﻿Дата | Маҳсулот | Миқдор | Нарх | Жами | Фойда\n";
      data.forEach((row) => {
        csvContent += `${row.sold_date || ""} | ${row.product_name || ""} | ${row.quantity || 0} | ${row.price_at_sale || 0} | ${row.total || 0} | ${row.profit || 0}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `abidin_hisobot_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotice("Hisobot muvaffaqiyatli eksport qilindi");
    } catch (error) {
      setNotice("Eksport xatosi: " + (error.message || "Noma'lum xato"));
    }
  };

  const tabLabels = {
    today: "Bugun",
    week: "Hafta",
    month: "Oy",
  };

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Sotuv hisoboti
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Statistika va tahlil
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={loadReports} className="btn-ghost">
              <RefreshCw size={16} /> Yangilash
            </button>
            <button type="button" onClick={exportToExcel} className="btn-primary flex items-center gap-2">
              <Download size={16} /> Excel ga eksport
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === key
                  ? "bg-[#003366] text-[#F5DEB3]"
                  : "bg-white text-[#003366] border border-[rgba(0,51,102,0.2)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {notice ? (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") || notice.includes("xatosi") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                Jami tushum
              </p>
              <p className="mt-2 text-2xl font-bold text-[#003366]">
                {formatMoney(summary.totalSales)} so'm
              </p>
              {summary.totalDiscount > 0 && (
                <p className="mt-1 text-xs text-[#2E7D32]">
                  Chegirma: {formatMoney(summary.totalDiscount)} so'm
                </p>
              )}
            </div>
            <TrendingUp className="text-[#2E7D32]" />
          </div>
        </div>
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                Tranzaksiyalar
              </p>
              <p className="mt-2 text-2xl font-bold text-[#003366]">
                {summary.transactionCount}
              </p>
            </div>
            <BarChart3 className="text-[#003366]" />
          </div>
        </div>
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                O'rtacha chek
              </p>
              <p className="mt-2 text-2xl font-bold text-[#003366]">
                {formatMoney(averageCheck)} so'm
              </p>
            </div>
            <BarChart3 className="text-[#003366]" />
          </div>
        </div>
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                Jami foyda
              </p>
              <p className="mt-2 text-2xl font-bold text-[#2E7D32]">
                {formatMoney(totalProfit)} so'm
              </p>
            </div>
            <TrendingUp className="text-[#2E7D32]" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                💵 Naqt
              </p>
              <p className="mt-1 text-xl font-bold text-[#2E7D32]">
                {formatMoney(summary.paymentStats?.naqt || 0)} so'm
              </p>
            </div>
          </div>
        </div>
        <div className="panel px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                💳 Karta
              </p>
              <p className="mt-1 text-xl font-bold text-[#003366]">
                {formatMoney(summary.paymentStats?.karta || 0)} so'm
              </p>
            </div>
          </div>
        </div>
        <div className="panel px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                📱 Click/Payme
              </p>
              <p className="mt-1 text-xl font-bold text-[#E65100]">
                {formatMoney(summary.paymentStats?.click || 0)} so'm
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="table-shell">
          <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
            <h3 className="text-lg font-bold text-[#003366]">Top 5 mahsulot</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#003366]/5 text-[#003366]">
                <tr>
                  <th className="px-5 py-3">Nomi</th>
                  <th className="px-5 py-3">Soni</th>
                  <th className="px-5 py-3 text-right">Tushum</th>
                  <th className="px-5 py-3 text-right">Foyda</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-[#003366]/70"
                      colSpan={4}
                    >
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : topProducts.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-[#003366]/70"
                      colSpan={4}
                    >
                      Sotuv yo'q
                    </td>
                  </tr>
                ) : (
                  topProducts.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                    >
                      <td className="px-5 py-4 font-semibold text-[#003366]">
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-[#F5DEB3]">
                          {index + 1}
                        </span>
                        {item.name}
                      </td>
                      <td className="px-5 py-4">{item.quantitySold}</td>
                      <td className="px-5 py-4 text-right">
                        {formatMoney(item.revenue)} so'm
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-[#2E7D32]">
                        {formatMoney(item.profit || 0)} so'm
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-shell">
          <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
            <h3 className="text-lg font-bold text-[#003366]">
              Kunlik diagramma
            </h3>
          </div>
          <div className="px-5 py-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-[#003366]/70">
                Yuklanmoqda...
              </div>
            ) : (
              <SimpleBarChart data={sales} />
            )}
          </div>
        </div>
      </section>

      <section className="table-shell">
        <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
          <h3 className="text-lg font-bold text-[#003366]">
            {tabLabels[activeTab]}gi sotuvlar
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#003366]/5 text-[#003366]">
              <tr>
                {activeTab !== "today" && <th className="px-5 py-3">Sana</th>}
                {activeTab === "today" && <th className="px-5 py-3">Vaqt</th>}
                <th className="px-5 py-3">Chek</th>
                <th className="px-5 py-3">Mijoz</th>
                <th className="px-5 py-3">Holat</th>
                <th className="px-5 py-3 text-right">Summa</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-[#003366]/70"
                    colSpan={6}
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-[#003366]/70"
                    colSpan={6}
                  >
                    Sotuv yo'q
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                  >
                    {activeTab !== "today" && (
                      <td className="px-5 py-4">
                        {sale.sold_date
                          ? new Date(sale.sold_date).toLocaleDateString("uz-UZ")
                          : "-"}
                      </td>
                    )}
                    {activeTab === "today" && (
                      <td className="px-5 py-4">{sale.sold_time}</td>
                    )}
                    <td className="px-5 py-4 font-semibold text-[#003366]">
                      #{sale.id}
                    </td>
                    <td className="px-5 py-4">
                      {sale.customer_name || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          sale.sale_type === "credit"
                            ? "bg-[#F57C00]/15 text-[#F57C00]"
                            : "bg-[#2E7D32]/15 text-[#2E7D32]"
                        }`}
                      >
                        {sale.sale_type === "credit" ? "Nasiya" : "Naqd"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatMoney(sale.total)} so'm
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}