const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld("abidin", {
  getAppMeta: () => invoke("app:get-meta"),
  getStoreSettings: () => invoke("app:get-store-settings"),
  setStoreSettings: (settings) => invoke("app:set-store-settings", settings),
  saveLogo: (logoData) => invoke("app:save-logo", logoData),

  listProducts: () => invoke("products:list"),
  searchProducts: (searchTerm) => invoke("products:search", searchTerm),
  createProduct: (payload) => invoke("products:create", payload),
  updateProduct: (id, payload) => invoke("products:update", id, payload),
  deleteProduct: (id) => invoke("products:delete", id),
  getProductByBarcode: (barcode) => invoke("products:get-by-barcode", barcode),
  restockProduct: (id, quantity) => invoke("products:restock", id, quantity),

  createSale: (cartItems, cashierId) => invoke("sales:create", cartItems, cashierId),
  getTodaySummary: () => invoke("sales:today-summary"),
  getWeekSummary: () => invoke("sales:week-summary"),
  getMonthSummary: () => invoke("sales:month-summary"),
  getTodaySales: () => invoke("sales:today-list"),
  getWeekSales: () => invoke("sales:week-list"),
  getMonthSales: () => invoke("sales:month-list"),
  getTopProducts: (limit = 5) => invoke("sales:top-products", limit),
  getTopProductsWeek: (limit = 5) => invoke("sales:top-products-week", limit),
  getTopProductsMonth: (limit = 5) => invoke("sales:top-products-month", limit),
  getReceipt: (saleId) => invoke("sales:receipt", saleId),
  getSaleForReturn: (saleId) => invoke("sales:for-return", saleId),

  getStockList: () => invoke("stock:list"),
  getRestockHistory: () => invoke("stock:history"),
  getLowStockProducts: () => invoke("stock:low-stock"),
  getExpiredProducts: () => invoke("stock:expired"),
  getExpiringSoonProducts: () => invoke("stock:expiring-soon"),
  getExpiringMonthProducts: () => invoke("stock:expiring-month"),

  getCreditList: () => invoke("credits:list"),
  getCreditById: (id) => invoke("credits:get", id),
  addCreditPayment: (id, amount) => invoke("credits:payment", id, amount),

  createReturn: (saleId, productId, quantity, price, reason) =>
    invoke("returns:create", saleId, productId, quantity, price, reason),

  login: (username, password) => invoke("auth:login", username, password),
  createUser: (username, password, role) => invoke("auth:create-user", username, password, role),
  listUsers: () => invoke("auth:list-users"),
  deleteUser: (id) => invoke("auth:delete-user", id),
  changePassword: (username, currentPassword, newPassword) =>
    invoke("auth:change-password", username, currentPassword, newPassword),

  getExportData: () => invoke("reports:get-export-data"),

  searchCustomers: (searchTerm) => invoke("customers:search", searchTerm),
  getCustomerByPhone: (phone) => invoke("customers:get-by-phone", phone),
  getCustomerById: (id) => invoke("customers:get-by-id", id),
  createCustomer: (name, phone) => invoke("customers:create", name, phone),
  updateCustomer: (id, name, phone) => invoke("customers:update", id, name, phone),
  deleteCustomer: (id) => invoke("customers:delete", id),
  getCustomerStats: (customerId) => invoke("customers:stats", customerId),
  getCustomerHistory: (customerId) => invoke("customers:history", customerId),

  createShift: (cashierId) => invoke("shifts:create", cashierId),
  getOpenShift: () => invoke("shifts:get-open"),
  getShiftById: (id) => invoke("shifts:get-by-id", id),
  closeShift: (id, totals) => invoke("shifts:close", id, totals),
  getShiftHistory: (limit = 20) => invoke("shifts:history", limit),

  getReturnsCount: (period) => invoke("reports:returns-count", period),
  getTodayReturnsCount: () => invoke("reports:today-returns"),
  getCreditsSummary: () => invoke("reports:credits-summary"),
  getHourlySales: () => invoke("reports:hourly-sales"),
  getDailySales: (days = 30) => invoke("reports:daily-sales", days),
  getTopProductsByRevenue: (limit = 10, period = "today") =>
    invoke("reports:top-products-revenue", limit, period),
  getTransactionsList: (period = "today", limit = 50) =>
    invoke("reports:transactions-list", period, limit),
  getProductsSales: (period = "today") => invoke("reports:products-sales", period),
  getCreditsList: () => invoke("reports:credits-list"),
  getCustomSummary: (startDate, endDate) =>
    invoke("reports:custom-summary", startDate, endDate),
  getCustomPaymentBreakdown: (startDate, endDate) =>
    invoke("reports:custom-payment-breakdown", startDate, endDate),
});