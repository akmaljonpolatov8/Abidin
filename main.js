const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
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
    title: "ABIDiN",
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

  ipcMain.handle("sales:create", (_event, cartItems) =>
    database.createSale(cartItems),
  );
  ipcMain.handle("sales:today-summary", () => database.getTodaySummary());
  ipcMain.handle("sales:today-list", () => database.getTodaySales());
  ipcMain.handle("sales:top-products", (_event, limit = 5) =>
    database.getTopProductsToday(limit),
  );
  ipcMain.handle("sales:receipt", (_event, saleId) =>
    database.getReceiptBySaleId(saleId),
  );

  ipcMain.handle("stock:list", () => database.getStockList());
  ipcMain.handle("stock:history", () => database.getRestockHistory());
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
