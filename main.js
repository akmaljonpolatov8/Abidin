const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { createPosDatabase } = require("./src/db");

let mainWindow = null;
let database = null;

const isDev = !app.isPackaged;
const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    icon: path.join(__dirname, "build", "icon.ico"),
    backgroundColor: "#F5DEB3",
    title: "Abidin",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "renderer-dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerIpcHandlers() {
  ipcMain.handle("app:get-meta", () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
  }));

  ipcMain.handle("app:get-store-settings", () => database.getStoreSettings());
  ipcMain.handle("app:set-store-settings", (_event, settings) => database.setStoreSettings(settings));
  ipcMain.handle("app:save-logo", async (_event, logoData) => {
    try {
      const userDataPath = app.getPath("userData");
      const logoPath = path.join(userDataPath, "store-logo.png");
      const buffer = Buffer.from(logoData.replace(/^data:image\/\w+;base64,/, ""), "base64");
      fs.writeFileSync(logoPath, buffer);
      database.setSetting("store_logo", logoPath);
      return { success: true, path: logoPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("products:list", () => database.listProducts());
  ipcMain.handle("products:search", (_event, searchTerm) =>
    database.searchProducts(searchTerm),
  );
  ipcMain.handle("products:create", (_event, payload) =>
    database.createProduct(payload),
  );
  ipcMain.handle("products:update", (_event, id, payload) =>
    database.updateProduct(id, payload),
  );
  ipcMain.handle("products:delete", (_event, id) => database.deleteProduct(id));
  ipcMain.handle("products:get-by-barcode", (_event, barcode) =>
    database.getProductByBarcode(barcode),
  );
  ipcMain.handle("products:restock", (_event, id, quantity) =>
    database.addStock(id, quantity),
  );

  ipcMain.handle("sales:create", (_event, cartItems, cashierId) =>
    database.createSale(cartItems, cashierId),
  );
  ipcMain.handle("sales:today-summary", () => database.getTodaySummary());
  ipcMain.handle("sales:week-summary", () => database.getWeekSummary());
  ipcMain.handle("sales:month-summary", () => database.getMonthSummary());
  ipcMain.handle("sales:today-list", () => database.getTodaySales());
  ipcMain.handle("sales:week-list", () => database.getWeekSales());
  ipcMain.handle("sales:month-list", () => database.getMonthSales());
  ipcMain.handle("sales:top-products", (_event, limit = 5) =>
    database.getTopProductsToday(limit),
  );
  ipcMain.handle("sales:top-products-week", (_event, limit = 5) =>
    database.getTopProductsWeek(limit),
  );
  ipcMain.handle("sales:top-products-month", (_event, limit = 5) =>
    database.getTopProductsMonth(limit),
  );
  ipcMain.handle("sales:receipt", (_event, saleId) =>
    database.getReceiptBySaleId(saleId),
  );
  ipcMain.handle("sales:for-return", (_event, saleId) =>
    database.getSaleForReturn(saleId),
  );

  ipcMain.handle("stock:list", () => database.getStockList());
  ipcMain.handle("stock:history", () => database.getRestockHistory());
  ipcMain.handle("stock:low-stock", () => database.getLowStockProducts());
  ipcMain.handle("stock:expired", () => database.getExpiredProducts());
  ipcMain.handle("stock:expiring-soon", () => database.getExpiringSoonProducts());
  ipcMain.handle("stock:expiring-month", () => database.getExpiringMonthProducts());

  ipcMain.handle("credits:list", () => database.getCreditList());
  ipcMain.handle("credits:get", (_event, id) => database.getCreditById(id));
  ipcMain.handle("credits:payment", (_event, id, amount) =>
    database.addCreditPayment(id, amount),
  );

  ipcMain.handle("returns:create", (_event, saleId, productId, quantity, price, reason) =>
    database.createReturn(saleId, productId, quantity, price, reason),
  );

  ipcMain.handle("auth:login", (_event, username, password) =>
    database.login(username, password),
  );
  ipcMain.handle("auth:create-user", (_event, username, password, role) =>
    database.createUser(username, password, role),
  );
  ipcMain.handle("auth:list-users", () => database.listUsers());
  ipcMain.handle("auth:delete-user", (_event, id) => database.deleteUser(id));

  ipcMain.handle("reports:export", () => database.getAllSalesForExport());
  ipcMain.handle("reports:get-export-data", () => database.getAllSalesForExport());

  ipcMain.handle("customers:search", (_event, searchTerm) =>
    database.searchCustomers(searchTerm),
  );
  ipcMain.handle("customers:get-by-phone", (_event, phone) =>
    database.getCustomerByPhone(phone),
  );
  ipcMain.handle("customers:get-by-id", (_event, id) =>
    database.getCustomerById(id),
  );
  ipcMain.handle("customers:create", (_event, name, phone) =>
    database.createCustomer(name, phone),
  );
  ipcMain.handle("customers:update", (_event, id, name, phone) =>
    database.updateCustomer(id, name, phone),
  );
  ipcMain.handle("customers:delete", (_event, id) =>
    database.deleteCustomer(id),
  );
  ipcMain.handle("customers:stats", (_event, customerId) =>
    database.getCustomerStats(customerId),
  );
  ipcMain.handle("customers:history", (_event, customerId) =>
    database.getCustomerHistory(customerId),
  );

  // Shift Management
  ipcMain.handle("shifts:create", (_event, cashierId) => database.createShift(cashierId));
  ipcMain.handle("shifts:get-open", () => database.getOpenShift());
  ipcMain.handle("shifts:get-by-id", (_event, id) => database.getShiftById(id));
  ipcMain.handle("shifts:close", (_event, id, totals) => database.closeShift(id, totals));
  ipcMain.handle("shifts:history", (_event, limit = 20) => database.getShiftHistory(limit));

  // Enhanced Reports
  ipcMain.handle("reports:returns-count", (_event, period) => database.getReturnsCount(period));
  ipcMain.handle("reports:today-returns", () => database.getTodayReturnsCount());
  ipcMain.handle("reports:credits-summary", () => database.getCreditsSummary());
  ipcMain.handle("reports:hourly-sales", () => database.getHourlySales());
  ipcMain.handle("reports:daily-sales", (_event, days = 30) => database.getDailySales(days));
  ipcMain.handle("reports:top-products-revenue", (_event, limit = 10, period = "today") =>
    database.getTopProductsByRevenue(limit, period));
  ipcMain.handle("reports:transactions-list", (_event, period = "today", limit = 50) =>
    database.getTransactionsList(period, limit));
  ipcMain.handle("reports:products-sales", (_event, period = "today") =>
    database.getProductsSales(period));
  ipcMain.handle("reports:credits-list", () => database.getCreditsList());
  ipcMain.handle("reports:custom-summary", (_event, startDate, endDate) =>
    database.getCustomSummary(startDate, endDate));
  ipcMain.handle("reports:custom-payment-breakdown", (_event, startDate, endDate) =>
    database.getCustomPaymentBreakdown(startDate, endDate));
}

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath("userData"), "abidin-pos.sqlite");
  database = createPosDatabase(dbPath);
  registerIpcHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});