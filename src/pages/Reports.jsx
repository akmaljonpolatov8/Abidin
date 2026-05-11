import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CreditCard,
  Smartphone,
  FileText,
  Undo2,
  Clock,
  User,
  Lock,
  X,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#2E7D32", "#003366", "#E65100", "#C62828", "#F57C00"];

const REPORT_SESSION_KEY = "abidin_reports_unlocked";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
}

function formatTime(value) {
  if (!value) return "-";
  return value.substring(0, 5);
}

function DateRangePicker({ startDate, endDate, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
        className="field text-sm"
      />
      <span className="text-[#003366]/60">-</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
        className="field text-sm"
      />
    </div>
  );
}

function PasswordModal({ open, onClose, onSubmit, error, loading }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/75 backdrop-blur-sm">
      <div className="w-full max-w-sm">
        <div className="panel border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3] p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#003366]">
              <Lock className="text-[#F5DEB3]" size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#003366]">Hisobot — Admin kirishi</h2>
            <p className="text-sm text-[#003366]/70 mt-1">Parolni tasdiqlang</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="rounded-[8px] bg-[#C62828]/10 px-4 py-3 text-sm font-medium text-[#C62828]">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-[#003366]">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field mt-1"
                placeholder="••••••••"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={() => onSubmit(password)}
              disabled={loading || !password}
              className="btn-primary w-full"
            >
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </button>

            <button type="button" onClick={onClose} className="btn-ghost w-full">
              Bekor qilish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShiftModal({ open, shift, onClose, onSave, saving }) {
  const [totals, setTotals] = useState({
    total_sales: 0,
    naqt: 0,
    plastik: 0,
    click: 0,
    nasiya: 0,
    transaction_count: 0,
    profit: 0,
  });

  useEffect(() => {
    if (open && shift) {
      setTotals({
        total_sales: shift.total_sales || 0,
        naqt: shift.naqt || 0,
        plastik: shift.plastik || 0,
        click: shift.click || 0,
        nasiya: shift.nasiya || 0,
        transaction_count: shift.transaction_count || 0,
        profit: shift.profit || 0,
      });
    }
  }, [open, shift]);

  if (!open || !shift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/55 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-lg overflow-hidden border border-[rgba(0,51,102,0.18)] bg-[#F5DEB3]">
        <div className="flex items-center justify-between border-b border-[rgba(0,51,102,0.14)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#003366]/60">Smena</p>
            <h2 className="text-xl font-bold text-[#003366]">Smena yopish</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-3 py-2 text-sm">Yopish</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3">
            <p className="text-sm text-[#003366]/70">Smena boshlanish</p>
            <p className="font-semibold text-[#003366]">{new Date(shift.started_at).toLocaleString("uz-UZ")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[8px] bg-[#003366] px-4 py-3 text-[#F5DEB3]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#F5DEB3]/70">Jami tushum</p>
              <p className="text-xl font-bold">{formatMoney(totals.total_sales)}</p>
            </div>
            <div className="rounded-[8px] bg-[#2E7D32] px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Foyda</p>
              <p className="text-xl font-bold">{formatMoney(totals.profit)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2 text-center">
              <p className="text-xs text-[#003366]/60">Naqt</p>
              <p className="font-semibold text-[#2E7D32]">{formatMoney(totals.naqt)}</p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2 text-center">
              <p className="text-xs text-[#003366]/60">Karta</p>
              <p className="font-semibold text-[#003366]">{formatMoney(totals.plastik)}</p>
            </div>
            <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-3 py-2 text-center">
              <p className="text-xs text-[#003366]/60">Click</p>
              <p className="font-semibold text-[#E65100]">{formatMoney(totals.click)}</p>
            </div>
          </div>
          <div className="rounded-[8px] border border-[rgba(0,51,102,0.14)] bg-white/70 px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium text-[#003366]">Tranzaksiyalar</span>
            <span className="text-lg font-bold text-[#003366]">{totals.transaction_count}</span>
          </div>
        </div>
        <div className="flex gap-3 border-t border-[rgba(0,51,102,0.14)] px-5 py-4">
          <button type="button" onClick={() => onSave(shift.id, totals)} disabled={saving} className="btn-success flex-1">
            {saving ? "Saqlanmoqda..." : "Smena yopish"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">Bekor</button>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("today");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalDiscount: 0,
    transactionCount: 0,
    paymentStats: { naqt: 0, karta: 0, click: 0, nasiya: 0 },
    profit: 0,
  });
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [creditsSummary, setCreditsSummary] = useState({ active: 0, collected: 0, overdue: 0 });
  const [returnsCount, setReturnsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [shiftModal, setShiftModal] = useState({ open: false, shift: null });
  const [saving, setSaving] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem(REPORT_SESSION_KEY);
      if (sessionData) {
        try {
          const { timestamp } = JSON.parse(sessionData);
          if (Date.now() - timestamp < SESSION_DURATION) {
            setIsUnlocked(true);
          } else {
            localStorage.removeItem(REPORT_SESSION_KEY);
          }
        } catch (e) {
          localStorage.removeItem(REPORT_SESSION_KEY);
        }
      }
      setCheckingAuth(false);
    };
    checkSession();
  }, []);

  const handlePasswordSubmit = async (password) => {
    setPasswordError("");
    try {
      const user = await window.abidin.login("admin", password);
      if (user && user.role === "admin") {
        setIsUnlocked(true);
        localStorage.setItem(REPORT_SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      } else {
        setPasswordError("Parol noto'g'ri");
      }
    } catch (error) {
      setPasswordError("Parol noto'g'ri");
    }
  };

  const lockReports = () => {
    setIsUnlocked(false);
    localStorage.removeItem(REPORT_SESSION_KEY);
  };

  const loadReports = async () => {
    setLoading(true);
    setNotice("");
    try {
      let summaryData, salesData, topProductsData, hourlyDataRaw, dailyDataRaw, creditsData, returnsData;

      if (activeTab === "custom") {
        if (!customStart || !customEnd) {
          setNotice("Iltimos, sanalarni tanlang");
          setLoading(false);
          return;
        }
        [summaryData, salesData, topProductsData, dailyDataRaw, creditsData, returnsData] = await Promise.all([
          window.abidin.getCustomSummary(customStart, customEnd),
          window.abidin.getTransactionsList("custom", 100),
          window.abidin.getTopProductsByRevenue(10, "custom"),
          window.abidin.getDailySales(30),
          window.abidin.getCreditsSummary(),
          window.abidin.getReturnsCount("custom"),
        ]);
      } else if (activeTab === "today") {
        [summaryData, salesData, topProductsData, hourlyDataRaw, creditsData, returnsData] = await Promise.all([
          window.abidin.getTodaySummary(),
          window.abidin.getTodaySales(),
          window.abidin.getTopProducts(10),
          window.abidin.getHourlySales(),
          window.abidin.getCreditsSummary(),
          window.abidin.getTodayReturnsCount(),
        ]);
      } else if (activeTab === "week") {
        [summaryData, salesData, topProductsData, dailyDataRaw, creditsData, returnsData] = await Promise.all([
          window.abidin.getWeekSummary(),
          window.abidin.getWeekSales(),
          window.abidin.getTopProductsWeek(10),
          window.abidin.getDailySales(7),
          window.abidin.getCreditsSummary(),
          window.abidin.getReturnsCount("week"),
        ]);
      } else {
        [summaryData, salesData, topProductsData, dailyDataRaw, creditsData, returnsData] = await Promise.all([
          window.abidin.getMonthSummary(),
          window.abidin.getMonthSales(),
          window.abidin.getTopProductsMonth(10),
          window.abidin.getDailySales(30),
          window.abidin.getCreditsSummary(),
          window.abidin.getReturnsCount("month"),
        ]);
      }

      setSummary(summaryData);
      setSales(salesData);
      setTopProducts(topProductsData);
      setCreditsSummary(creditsData || { totalActive: 0, collectedToday: 0, overdueCount: 0, overdueAmount: 0 });
      setReturnsCount(returnsData?.count || 0);

      if (hourlyDataRaw) {
        const hourlyFormatted = hourlyDataRaw.map(h => ({
          time: `${h.hour}:00`,
          sales: h.total || 0,
          transactions: h.count || 0,
        }));
        setHourlyData(hourlyFormatted);
      }

      if (dailyDataRaw) {
        const dailyFormatted = dailyDataRaw.map(d => ({
          date: formatDate(d.date),
          sales: d.total || 0,
          transactions: d.count || 0,
          profit: d.profit || 0,
        }));
        setDailyData(dailyFormatted);
      }
    } catch (error) {
      setNotice(error.message || "Hisobotlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadReports();
    }
  }, [isUnlocked, activeTab, customStart, customEnd]);

  const averageCheck = useMemo(() => {
    if (!summary.transactionCount) return 0;
    return summary.totalSales / summary.transactionCount;
  }, [summary]);

  const paymentPieData = useMemo(() => {
    const data = [];
    if (summary.paymentStats?.naqt) data.push({ name: "Naqt", value: summary.paymentStats.naqt });
    if (summary.paymentStats?.karta) data.push({ name: "Karta", value: summary.paymentStats.karta });
    if (summary.paymentStats?.click) data.push({ name: "Click", value: summary.paymentStats.click });
    if (summary.paymentStats?.nasiya) data.push({ name: "Nasiya", value: summary.paymentStats.nasiya });
    return data;
  }, [summary]);

  const exportToExcel = async () => {
    try {
      const data = await window.abidin.getExportData();
      if (!data || data.length === 0) {
        setNotice("Eksport uchun ma'lumot yo'q");
        return;
      }
      let csvContent = "Дата|Маҳсулот|Миқдор| Нарх|Жами|Foyda\n";
      data.forEach((row) => {
        csvContent += `${row.sold_date || ""}|${row.product_name || ""}|${row.quantity || 0}|${row.price_at_sale || 0}|${row.total || 0}|${row.profit || 0}\n`;
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

  const openShiftModal = async () => {
    try {
      const openShift = await window.abidin.getOpenShift();
      if (openShift) {
        setShiftModal({ open: true, shift: openShift });
      } else {
        setNotice("Ochiq smena topilmadi");
      }
    } catch (error) {
      setNotice("Smena ma'lumotlarini olishda xatolik");
    }
  };

  const closeShiftModal = () => setShiftModal({ open: false, shift: null });

  const saveShift = async (shiftId, totals) => {
    setSaving(true);
    try {
      await window.abidin.closeShift(shiftId, totals);
      setNotice("Smena muvaffaqiyatli yopildi");
      closeShiftModal();
    } catch (error) {
      setNotice("Smena yopishda xatolik: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();
  const tabLabels = { today: "Bugun", week: "Hafta", month: "Oy", custom: "Davr" };

  if (checkingAuth) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-[#003366]">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex h-96 items-center justify-center">
        <PasswordModal
          open={true}
          onClose={() => window.history.back()}
          onSubmit={handlePasswordSubmit}
          error={passwordError}
          loading={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <section className="panel px-5 py-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#003366]/55">Sotuv hisoboti</p>
            <h2 className="text-2xl font-bold text-[#003366]">Statistika va tahlil</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={lockReports} className="btn-ghost">
              <Lock size={16} /> Qulflash
            </button>
            <button type="button" onClick={loadReports} className="btn-ghost">
              <RefreshCw size={16} /> Yangilash
            </button>
            <button type="button" onClick={exportToExcel} className="btn-primary flex items-center gap-2">
              <Download size={16} /> Excel
            </button>
            <button type="button" onClick={handlePrint} className="btn-ghost flex items-center gap-2">
              <Printer size={16} /> Chop etish
            </button>
            <button type="button" onClick={openShiftModal} className="btn-success flex items-center gap-2">
              <Clock size={16} /> Smena yopish
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setActiveTab(key); if (key === "custom") { const today = new Date().toISOString().split("T")[0]; if (!customStart) setCustomStart(today); if (!customEnd) setCustomEnd(today); }}}
              className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === key
                  ? "bg-[#003366] text-[#F5DEB3]"
                  : "bg-white text-[#003366] border border-[rgba(0,51,102,0.2)]"
              }`}
            >
              {label}
            </button>
          ))}
          {activeTab === "custom" && (
            <DateRangePicker startDate={customStart} endDate={customEnd} onChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }} />
          )}
        </div>

        {notice ? (
          <p className={`mt-4 text-sm font-medium ${notice.includes("xatolik") || notice.includes("xatosi") ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
            {notice}
          </p>
        ) : null}
      </section>

      {/* Row 1: Summary Cards */}
      <section className="grid gap-4 md:grid-cols-4 print:grid-cols-4">
        <div className="panel px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Jami tushum</p>
              <p className="mt-1 text-xl font-bold text-[#003366]">{formatMoney(summary.totalSales)}</p>
            </div>
            <TrendingUp className="text-[#2E7D32]" size={20} />
          </div>
        </div>
        <div className="panel px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Tranzaksiyalar</p>
              <p className="mt-1 text-xl font-bold text-[#003366]">{summary.transactionCount}</p>
            </div>
            <BarChart3 className="text-[#003366]" size={20} />
          </div>
        </div>
        <div className="panel px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">O'rtacha chek</p>
              <p className="mt-1 text-xl font-bold text-[#003366]">{formatMoney(averageCheck)}</p>
            </div>
            <FileText className="text-[#003366]" size={20} />
          </div>
        </div>
        <div className="panel px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Jami foyda</p>
              <p className="mt-1 text-xl font-bold text-[#2E7D32]">{formatMoney(summary.profit || 0)}</p>
            </div>
            <TrendingUp className="text-[#2E7D32]" size={20} />
          </div>
        </div>
      </section>

      {/* Row 2: Payment Breakdown */}
      <section className="grid gap-4 md:grid-cols-4 print:grid-cols-4">
        <div className="panel px-4 py-5 bg-[#2E7D32] text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} />
            <p className="text-sm font-semibold">Naqt</p>
          </div>
          <p className="text-2xl font-bold">{formatMoney(summary.paymentStats?.naqt || 0)}</p>
        </div>
        <div className="panel px-4 py-5 bg-[#003366] text-[#F5DEB3]">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={18} />
            <p className="text-sm font-semibold">Karta</p>
          </div>
          <p className="text-2xl font-bold">{formatMoney(summary.paymentStats?.karta || 0)}</p>
        </div>
        <div className="panel px-4 py-5 bg-[#E65100] text-white">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={18} />
            <p className="text-sm font-semibold">Click/Payme</p>
          </div>
          <p className="text-2xl font-bold">{formatMoney(summary.paymentStats?.click || 0)}</p>
        </div>
        <div className="panel px-4 py-5 bg-[#C62828] text-white">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} />
            <p className="text-sm font-semibold">Nasiya</p>
          </div>
          <p className="text-2xl font-bold">{formatMoney(summary.paymentStats?.nasiya || 0)}</p>
        </div>
      </section>

      {/* Nasiya Summary */}
      <section className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
        <div className="panel px-4 py-4 border-l-4 border-l-[#F57C00]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Nasiya (faol)</p>
          <p className="mt-1 text-xl font-bold text-[#F57C00]">{formatMoney(creditsSummary.totalActive || 0)}</p>
        </div>
        <div className="panel px-4 py-4 border-l-4 border-l-[#2E7D32]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Qarzdorlar soni</p>
          <p className="mt-1 text-xl font-bold text-[#2E7D32]">{creditsSummary.overdueCount || 0}</p>
        </div>
        <div className="panel px-4 py-4 border-l-4 border-l-[#C62828]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#003366]/55">Qaytarishlar</p>
              <p className="mt-1 text-xl font-bold text-[#C62828]">{returnsCount}</p>
            </div>
            <Undo2 className="text-[#C62828]" size={20} />
          </div>
        </div>
      </section>

      {/* Charts Row */}
      <section className="grid gap-6 xl:grid-cols-2 print:grid-cols-2">
        <div className="table-shell">
          <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
            <h3 className="text-lg font-bold text-[#003366]">To'lov turlari %</h3>
          </div>
          <div className="px-5 py-4">
            {loading ? (
              <div className="h-48 flex items-center justify-center text-[#003366]/70">Yuklanmoqda...</div>
            ) : paymentPieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-[#003366]/50">Ma'lumot yo'q</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value) + " so'm"} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="table-shell">
          <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
            <h3 className="text-lg font-bold text-[#003366]">Soatlik sotuvlar</h3>
          </div>
          <div className="px-5 py-4">
            {loading ? (
              <div className="h-48 flex items-center justify-center text-[#003366]/70">Yuklanmoqda...</div>
            ) : hourlyData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-[#003366]/50">Ma'lumot yo'q</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,51,102,0.1)" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#003366" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#003366" />
                  <Tooltip formatter={(value) => formatMoney(value)} />
                  <Bar dataKey="sales" fill="#003366" name="Tushum" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Daily Trend */}
      <section className="table-shell">
        <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
          <h3 className="text-lg font-bold text-[#003366]">Kunlik dinamika</h3>
        </div>
        <div className="px-5 py-4">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-[#003366]/70">Yuklanmoqda...</div>
          ) : dailyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#003366]/50">Ma'lumot yo'q</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,51,102,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#003366" />
                <YAxis tick={{ fontSize: 11 }} stroke="#003366" />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#003366" strokeWidth={2} name="Tushum" />
                <Line type="monotone" dataKey="profit" stroke="#2E7D32" strokeWidth={2} name="Foyda" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Top Products */}
      <section className="table-shell">
        <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
          <h3 className="text-lg font-bold text-[#003366]">Top 10 mahsulot</h3>
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
                <tr><td className="px-5 py-10 text-center text-[#003366]/70" colSpan={4}>Yuklanmoqda...</td></tr>
              ) : topProducts.length === 0 ? (
                <tr><td className="px-5 py-10 text-center text-[#003366]/70" colSpan={4}>Sotuv yo'q</td></tr>
              ) : (
                topProducts.map((item, index) => (
                  <tr key={item.id} className="border-t border-[rgba(0,51,102,0.1)] bg-white/45">
                    <td className="px-5 py-4">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-[#F5DEB3]">
                        {index + 1}
                      </span>
                      {item.name || item.product_name}
                    </td>
                    <td className="px-5 py-4">{item.quantitySold || item.quantity || 0}</td>
                    <td className="px-5 py-4 text-right">{formatMoney(item.revenue || item.total || 0)} so'm</td>
                    <td className="px-5 py-4 text-right font-medium text-[#2E7D32]">{formatMoney(item.profit || 0)} so'm</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transactions List */}
      <section className="table-shell">
        <div className="border-b border-[rgba(0,51,102,0.12)] px-5 py-4">
          <h3 className="text-lg font-bold text-[#003366]">{tabLabels[activeTab]}gi sotuvlar</h3>
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
                <tr><td className="px-5 py-10 text-center text-[#003366]/70" colSpan={6}>Yuklanmoqda...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td className="px-5 py-10 text-center text-[#003366]/70" colSpan={6}>Sotuv yo'q</td></tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-t border-[rgba(0,51,102,0.1)] bg-white/45">
                    {activeTab !== "today" && (
                      <td className="px-5 py-4">{sale.sold_date ? new Date(sale.sold_date).toLocaleDateString("uz-UZ") : "-"}</td>
                    )}
                    {activeTab === "today" && (
                      <td className="px-5 py-4">{sale.sold_time || formatTime(sale.sold_at)}</td>
                    )}
                    <td className="px-5 py-4 font-semibold text-[#003366]">#{sale.id}</td>
                    <td className="px-5 py-4">{sale.customer_name || "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        sale.sale_type === "credit" ? "bg-[#F57C00]/15 text-[#F57C00]" : "bg-[#2E7D32]/15 text-[#2E7D32]"
                      }`}>
                        {sale.sale_type === "credit" ? "Nasiya" : "Naqd"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">{formatMoney(sale.total)} so'm</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ShiftModal open={shiftModal.open} shift={shiftModal.shift} onClose={closeShiftModal} onSave={saveShift} saving={saving} />
    </div>
  );
}