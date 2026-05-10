const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld("abidin", {
  getAppMeta: () => invoke("app:get-meta"),
  listProducts: () => invoke("products:list"),
  searchProducts: (searchTerm) => invoke("products:search", searchTerm),
  createProduct: (payload) => invoke("products:create", payload),
  updateProduct: (id, payload) => invoke("products:update", id, payload),
  deleteProduct: (id) => invoke("products:delete", id),
  getProductByBarcode: (barcode) => invoke("products:get-by-barcode", barcode),
  restockProduct: (id, quantity) => invoke("products:restock", id, quantity),
  createSale: (cartItems) => invoke("sales:create", cartItems),
  getTodaySummary: () => invoke("sales:today-summary"),
  getTodaySales: () => invoke("sales:today-list"),
  getTopProducts: (limit = 5) => invoke("sales:top-products", limit),
  getReceipt: (saleId) => invoke("sales:receipt", saleId),
  getStockList: () => invoke("stock:list"),
  getRestockHistory: () => invoke("stock:history"),
});
