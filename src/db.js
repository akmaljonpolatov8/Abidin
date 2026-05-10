const Database = require("better-sqlite3");
const { format } = require("date-fns");

function createPosDatabase(dbPath) {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initializeSchema(db);

  const statements = createStatements(db);

  return statements;
}

function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      last_restock_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      sold_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price_at_sale REAL,
      FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS restocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  const columns = db.prepare("PRAGMA table_info(products)").all();
  const hasLastRestock = columns.some(
    (column) => column.name === "last_restock_at",
  );
  if (!hasLastRestock) {
    db.prepare("ALTER TABLE products ADD COLUMN last_restock_at TEXT").run();
  }

  const hasArchivedFlag = columns.some(
    (column) => column.name === "is_archived",
  );
  if (!hasArchivedFlag) {
    db.prepare(
      "ALTER TABLE products ADD COLUMN is_archived INTEGER DEFAULT 0",
    ).run();
  }
}

function createStatements(db) {
  const statements = {
    listProducts: db.prepare(
      "SELECT * FROM products WHERE COALESCE(is_archived, 0) = 0 ORDER BY name COLLATE NOCASE ASC",
    ),
    searchProducts: db.prepare(`
      SELECT *
      FROM products
      WHERE (name LIKE @query OR barcode LIKE @query) AND COALESCE(is_archived, 0) = 0
      ORDER BY name COLLATE NOCASE ASC
    `),
    getProductByBarcode: db.prepare(
      "SELECT * FROM products WHERE barcode = ? AND COALESCE(is_archived, 0) = 0 LIMIT 1",
    ),
    getProductById: db.prepare(
      "SELECT * FROM products WHERE id = ? AND COALESCE(is_archived, 0) = 0 LIMIT 1",
    ),
    insertProduct: db.prepare(`
      INSERT INTO products (name, barcode, price, stock, last_restock_at, is_archived)
      VALUES (@name, @barcode, @price, @stock, @last_restock_at, 0)
    `),
    updateProduct: db.prepare(`
      UPDATE products
      SET name = @name,
          barcode = @barcode,
          price = @price,
          stock = @stock,
          last_restock_at = @last_restock_at,
          is_archived = 0
      WHERE id = @id
    `),
    deleteProduct: db.prepare(
      "UPDATE products SET is_archived = 1 WHERE id = ?",
    ),
    adjustStock: db.prepare(
      "UPDATE products SET stock = stock + ?, last_restock_at = ? WHERE id = ?",
    ),
    insertSale: db.prepare("INSERT INTO sales (total, sold_at) VALUES (?, ?)"),
    insertSaleItem: db.prepare(`
      INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale)
      VALUES (?, ?, ?, ?)
    `),
    reduceStock: db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
    ),
    getSaleById: db.prepare("SELECT * FROM sales WHERE id = ? LIMIT 1"),
    getSaleItemsBySaleId: db.prepare(`
      SELECT
        sale_items.id,
        sale_items.sale_id,
        sale_items.product_id,
        sale_items.quantity,
        sale_items.price_at_sale,
        products.name,
        products.barcode
      FROM sale_items
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE sale_items.sale_id = ?
      ORDER BY sale_items.id ASC
    `),
    todaySummary: db.prepare(`
      SELECT
        COALESCE(SUM(total), 0) AS total_sales,
        COUNT(*) AS transaction_count
      FROM sales
      WHERE date(sold_at, 'localtime') = date('now', 'localtime')
    `),
    todaySales: db.prepare(`
      SELECT
        id,
        total,
        sold_at,
        time(sold_at, 'localtime') AS sold_time
      FROM sales
      WHERE date(sold_at, 'localtime') = date('now', 'localtime')
      ORDER BY sold_at DESC, id DESC
    `),
    topProducts: db.prepare(`
      SELECT
        products.id,
        products.name,
        products.barcode,
        SUM(sale_items.quantity) AS quantity_sold,
        SUM(sale_items.quantity * sale_items.price_at_sale) AS revenue
      FROM sale_items
      INNER JOIN sales ON sales.id = sale_items.sale_id
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE date(sales.sold_at, 'localtime') = date('now', 'localtime')
      GROUP BY products.id, products.name, products.barcode
      ORDER BY quantity_sold DESC, revenue DESC
      LIMIT ?
    `),
    stockList: db.prepare(`
      SELECT
        id,
        name,
        barcode,
        price,
        stock,
        last_restock_at,
        created_at
      FROM products
      WHERE COALESCE(is_archived, 0) = 0
      ORDER BY stock ASC, name COLLATE NOCASE ASC
    `),
    restockHistory: db.prepare(`
      SELECT
        products.id,
        products.name,
        products.barcode,
        products.stock,
        products.last_restock_at
      FROM products
      WHERE COALESCE(is_archived, 0) = 0
      ORDER BY COALESCE(products.last_restock_at, products.created_at) DESC, products.name COLLATE NOCASE ASC
    `),
  };

  return {
    listProducts() {
      return statements.listProducts.all();
    },

    searchProducts(searchTerm = "") {
      const query = `%${String(searchTerm).trim()}%`;
      if (query === "%%") {
        return statements.listProducts.all();
      }
      return statements.searchProducts.all({ query });
    },

    getProductByBarcode(barcode) {
      if (!barcode) {
        return null;
      }
      return statements.getProductByBarcode.get(String(barcode).trim()) || null;
    },

    createProduct(payload) {
      const normalized = normalizeProductPayload(payload);
      const result = statements.insertProduct.run({
        ...normalized,
        last_restock_at: normalized.stock > 0 ? new Date().toISOString() : null,
      });
      return statements.getProductById.get(result.lastInsertRowid);
    },

    updateProduct(id, payload) {
      const existing = db
        .prepare("SELECT * FROM products WHERE id = ? LIMIT 1")
        .get(Number(id));
      if (!existing || Number(existing.is_archived || 0) === 1) {
        throw new Error("Mahsulot topilmadi");
      }
      const normalized = normalizeProductPayload(payload, id);
      const nextRestockAt =
        normalized.stock > 0
          ? existing.last_restock_at || new Date().toISOString()
          : existing.last_restock_at;
      statements.updateProduct.run({
        ...normalized,
        id: Number(id),
        last_restock_at: nextRestockAt,
      });
      return statements.getProductById.get(Number(id));
    },

    deleteProduct(id) {
      const existing = db
        .prepare(
          "SELECT id FROM products WHERE id = ? AND COALESCE(is_archived, 0) = 0 LIMIT 1",
        )
        .get(Number(id));
      if (!existing) {
        return { success: false, message: "Mahsulot topilmadi" };
      }
      statements.deleteProduct.run(Number(id));
      return { success: true };
    },

    addStock(id, quantity) {
      const productId = Number(id);
      const amount = Number(quantity);
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Qo‘shiladigan miqdor musbat butun son bo‘lishi kerak");
      }
      const existing = db
        .prepare(
          "SELECT id FROM products WHERE id = ? AND COALESCE(is_archived, 0) = 0 LIMIT 1",
        )
        .get(productId);
      if (!existing) {
        throw new Error("Mahsulot topilmadi");
      }
      const timestamp = new Date().toISOString();
      statements.adjustStock.run(amount, timestamp, productId);
      db.prepare(
        "INSERT INTO restocks (product_id, quantity, created_at) VALUES (?, ?, ?)",
      ).run(productId, amount, timestamp);
      return statements.getProductById.get(productId);
    },

    createSale(cartItems) {
      const items = Array.isArray(cartItems) ? cartItems : [];
      if (items.length === 0) {
        throw new Error("Savat bo‘sh");
      }

      const saleItems = items.map((item) => {
        const productId = Number(item.product_id ?? item.id);
        const quantity = Number(item.quantity ?? 0);
        const priceAtSale = Number(item.price_at_sale ?? item.price ?? 0);
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Miqdor noto‘g‘ri");
        }
        return { productId, quantity, priceAtSale };
      });

      const transaction = db.transaction((rows) => {
        const total = rows.reduce(
          (sum, row) => sum + row.quantity * row.priceAtSale,
          0,
        );
        const soldAt = new Date().toISOString();
        const saleResult = statements.insertSale.run(total, soldAt);
        const saleId = saleResult.lastInsertRowid;

        for (const row of rows) {
          const stockUpdate = statements.reduceStock.run(
            row.quantity,
            row.productId,
            row.quantity,
          );
          if (stockUpdate.changes !== 1) {
            throw new Error("Sklad yetarli emas");
          }
          statements.insertSaleItem.run(
            saleId,
            row.productId,
            row.quantity,
            row.priceAtSale,
          );
        }

        return saleId;
      });

      const saleId = transaction(saleItems);
      return this.getReceiptBySaleId(saleId);
    },

    getReceiptBySaleId(saleId) {
      const sale = statements.getSaleById.get(Number(saleId));
      if (!sale) {
        return null;
      }
      const items = statements.getSaleItemsBySaleId.all(Number(saleId));
      return {
        sale,
        items: items.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          barcode: item.barcode,
          quantity: item.quantity,
          price_at_sale: item.price_at_sale,
          subtotal: item.quantity * item.price_at_sale,
        })),
      };
    },

    getTodaySummary() {
      const summary = statements.todaySummary.get();
      return {
        totalSales: Number(summary.total_sales || 0),
        transactionCount: Number(summary.transaction_count || 0),
      };
    },

    getTodaySales() {
      return statements.todaySales.all().map((sale) => ({
        id: sale.id,
        total: sale.total,
        sold_at: sale.sold_at,
        sold_time: sale.sold_time,
      }));
    },

    getTopProductsToday(limit = 5) {
      return statements.topProducts.all(Number(limit)).map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        quantitySold: Number(row.quantity_sold || 0),
        revenue: Number(row.revenue || 0),
      }));
    },

    getStockList() {
      return statements.stockList.all();
    },

    getRestockHistory() {
      return statements.restockHistory.all().map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        stock: row.stock,
        lastRestockAt: row.last_restock_at,
      }));
    },
  };
}

function normalizeProductPayload(payload, id = null) {
  const name = String(payload?.name || "").trim();
  const barcode = String(payload?.barcode || "").trim();
  const price = Number(payload?.price);
  const stock = Number(payload?.stock ?? 0);

  if (!name) {
    throw new Error("Mahsulot nomi kiritilmagan");
  }
  if (!barcode) {
    throw new Error("Shtrix-kod kiritilmagan");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Narx noto‘g‘ri");
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Boshlang‘ich qolgan miqdor noto‘g‘ri");
  }

  return {
    name,
    barcode,
    price: Number(price.toFixed(2)),
    stock,
  };
}

module.exports = {
  createPosDatabase,
};
