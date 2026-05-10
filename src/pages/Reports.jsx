import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw, ReceiptText, TrendingUp } from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

export default function Reports() {
  const [summary, setSummary] = useState({
    totalSales: 0,
    transactionCount: 0,
  });
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setNotice("");
    try {
      const [summaryData, salesData, topProductsData] = await Promise.all([
        window.abidin.getTodaySummary(),
        window.abidin.getTodaySales(),
        window.abidin.getTopProducts(5),
      ]);
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
  }, []);

  const averageCheck = useMemo(() => {
    if (!summary.transactionCount) return 0;
    return summary.totalSales / summary.transactionCount;
  }, [summary]);

  return (
    <div className="space-y-6">
      <section className="panel px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
              Bugungi hisobot
            </p>
            <h2 className="text-2xl font-bold text-[#003366]">
              Sotuv statistikasi
            </h2>
          </div>
          <button type="button" onClick={loadReports} className="btn-ghost">
            <RefreshCw size={16} /> Yangilash
          </button>
        </div>
        {notice ? (
          <p className="mt-4 text-sm font-medium text-[#003366]">{notice}</p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                Bugungi savdo
              </p>
              <p className="mt-2 text-3xl font-bold text-[#003366]">
                {formatMoney(summary.totalSales)} so'm
              </p>
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
              <p className="mt-2 text-3xl font-bold text-[#003366]">
                {summary.transactionCount}
              </p>
            </div>
            <ReceiptText className="text-[#003366]" />
          </div>
        </div>
        <div className="panel px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">
                O'rtacha chek
              </p>
              <p className="mt-2 text-3xl font-bold text-[#003366]">
                {formatMoney(averageCheck)} so'm
              </p>
            </div>
            <BarChart3 className="text-[#003366]" />
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-[#003366]/70"
                      colSpan={3}
                    >
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : topProducts.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-[#003366]/70"
                      colSpan={3}
                    >
                      Bugun savdo yo'q
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
              Bugungi sotuvlar
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#003366]/5 text-[#003366]">
                <tr>
                  <th className="px-5 py-3">Vaqt</th>
                  <th className="px-5 py-3">Chek</th>
                  <th className="px-5 py-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-[#003366]/70"
                      colSpan={3}
                    >
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-[#003366]/70"
                      colSpan={3}
                    >
                      Bugun sotuv yo'q
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-t border-[rgba(0,51,102,0.1)] bg-white/45"
                    >
                      <td className="px-5 py-4">{sale.sold_time}</td>
                      <td className="px-5 py-4 font-semibold text-[#003366]">
                        #{sale.id}
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
        </div>
      </section>
    </div>
  );
}
