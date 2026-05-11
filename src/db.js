const Database = require("better-sqlite3");
const { format } = require("date-fns");
const path = require("path");
const fs = require("fs");

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
      unit TEXT DEFAULT 'dona' CHECK(unit IN ('dona', 'kg')),
      cost_price REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      expiry_date TEXT,
      is_archived INTEGER DEFAULT 0,
      last_restock_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      discount_total REAL DEFAULT 0,
      sale_type TEXT DEFAULT 'cash',
      customer_name TEXT,
      customer_phone TEXT,
      payment_type TEXT DEFAULT 'naqt',
      customer_id INTEGER,
      sold_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      quantity REAL,
      price_at_sale REAL,
      discount_percent REAL DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      remaining REAL,
      sale_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      customer_code TEXT,
      FOREIGN KEY(sale_id) REFERENCES sales(id)
    );

    CREATE TABLE IF NOT EXISTS credit_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credit_id INTEGER,
      type TEXT,
      amount REAL,
      balance_after REAL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(credit_id) REFERENCES credits(id)
    );

    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      quantity REAL,
      price REAL,
      reason TEXT,
      returned_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sale_id) REFERENCES sales(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'kassir' CHECK(role IN ('admin', 'kassir')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cashier_id INTEGER,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ended_at TEXT,
      total_sales REAL DEFAULT 0,
      naqt REAL DEFAULT 0,
      plastik REAL DEFAULT 0,
      click REAL DEFAULT 0,
      nasiya REAL DEFAULT 0,
      transaction_count INTEGER DEFAULT 0,
      profit REAL DEFAULT 0,
      status TEXT DEFAULT 'open'
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

  const hasUnit = columns.some((column) => column.name === "unit");
  if (!hasUnit) {
    db.prepare(
      "ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'dona' CHECK(unit IN ('dona', 'kg'))",
    ).run();
  }

  const hasDiscount = columns.some((column) => column.name === "discount_percent");
  if (!hasDiscount) {
    db.prepare(
      "ALTER TABLE products ADD COLUMN discount_percent REAL DEFAULT 0",
    ).run();
  }

  const hasCostPrice = columns.some((column) => column.name === "cost_price");
  if (!hasCostPrice) {
    db.prepare(
      "ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0",
    ).run();
  }

  const hasExpiryDate = columns.some((column) => column.name === "expiry_date");
  if (!hasExpiryDate) {
    db.prepare(
      "ALTER TABLE products ADD COLUMN expiry_date TEXT",
    ).run();
  }

  const saleColumns = db.prepare("PRAGMA table_info(sale_items)").all();
  const hasRealQuantity = saleColumns.some((column) => column.name === "quantity");
  if (hasRealQuantity) {
    const typeInfo = saleColumns.find((c) => c.name === "quantity");
    if (typeInfo && typeInfo.type === "INTEGER") {
      db.prepare("ALTER TABLE sale_items RENAME TO sale_items_old").run();
      db.prepare(`
        CREATE TABLE sale_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id INTEGER,
          product_id INTEGER,
          quantity REAL,
          price_at_sale REAL,
          discount_percent REAL DEFAULT 0,
          FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
          FOREIGN KEY(product_id) REFERENCES products(id)
        );
      `).run();
      db.prepare("INSERT INTO sale_items (id, sale_id, product_id, quantity, price_at_sale, discount_percent) SELECT id, sale_id, product_id, CAST(quantity AS REAL), price_at_sale, 0 FROM sale_items_old").run();
      db.prepare("DROP TABLE sale_items_old").run();
    }
  }

  const salesColumns = db.prepare("PRAGMA table_info(sales)").all();
  const hasDiscountTotal = salesColumns.some((column) => column.name === "discount_total");
  if (!hasDiscountTotal) {
    db.prepare("ALTER TABLE sales ADD COLUMN discount_total REAL DEFAULT 0").run();
  }
  const hasSaleType = salesColumns.some((column) => column.name === "sale_type");
  if (!hasSaleType) {
    db.prepare("ALTER TABLE sales ADD COLUMN sale_type TEXT DEFAULT 'cash'").run();
  }
  const hasCustomerName = salesColumns.some((column) => column.name === "customer_name");
  if (!hasCustomerName) {
    db.prepare("ALTER TABLE sales ADD COLUMN customer_name TEXT").run();
  }
  const hasCustomerPhone = salesColumns.some((column) => column.name === "customer_phone");
  if (!hasCustomerPhone) {
    db.prepare("ALTER TABLE sales ADD COLUMN customer_phone TEXT").run();
  }
  const hasPaymentType = salesColumns.some((column) => column.name === "payment_type");
  if (!hasPaymentType) {
    db.prepare("ALTER TABLE sales ADD COLUMN payment_type TEXT DEFAULT 'naqt'").run();
  }
  const hasCustomerId = salesColumns.some((column) => column.name === "customer_id");
  if (!hasCustomerId) {
    db.prepare("ALTER TABLE sales ADD COLUMN customer_id INTEGER").run();
  }
  const hasCashierId = salesColumns.some((column) => column.name === "cashier_id");
  if (!hasCashierId) {
    db.prepare("ALTER TABLE sales ADD COLUMN cashier_id INTEGER").run();
  }

  const users = db.prepare("SELECT COUNT(*) as cnt FROM users").get();
  if (users.cnt === 0) {
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "abidin2025", "admin");
  }

  const settings = db.prepare("SELECT COUNT(*) as cnt FROM settings").get();
  if (settings.cnt === 0) {
    const defaults = [
      ["store_name", "Blokpost"],
      ["store_phone", ""],
      ["store_address", ""],
      ["receipt_footer", "Rahmat! Yana keling 😊"],
    ];
    const insert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [key, value] of defaults) {
      insert.run(key, value);
    }
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
    getProductByIdRaw: db.prepare("SELECT * FROM products WHERE id = ? LIMIT 1"),
    insertProduct: db.prepare(`
      INSERT INTO products (name, barcode, price, stock, unit, cost_price, discount_percent, expiry_date, last_restock_at, is_archived)
      VALUES (@name, @barcode, @price, @stock, @unit, @cost_price, @discount_percent, @expiry_date, @last_restock_at, 0)
    `),
    updateProduct: db.prepare(`
      UPDATE products
      SET name = @name,
          barcode = @barcode,
          price = @price,
          stock = @stock,
          unit = @unit,
          cost_price = @cost_price,
          discount_percent = @discount_percent,
          expiry_date = @expiry_date,
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
    insertSale: db.prepare("INSERT INTO sales (total, discount_total, sale_type, customer_name, customer_phone, payment_type, customer_id, sold_at, cashier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"),
    insertSaleItem: db.prepare(`
      INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale, discount_percent)
      VALUES (?, ?, ?, ?, ?)
    `),
    reduceStock: db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
    ),
    restoreStock: db.prepare(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
    ),
    getSaleById: db.prepare("SELECT * FROM sales WHERE id = ? LIMIT 1"),
    getSaleItemsBySaleId: db.prepare(`
      SELECT
        sale_items.id,
        sale_items.sale_id,
        sale_items.product_id,
        sale_items.quantity,
        sale_items.price_at_sale,
        sale_items.discount_percent,
        products.name,
        products.barcode,
        products.cost_price
      FROM sale_items
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE sale_items.sale_id = ?
      ORDER BY sale_items.id ASC
    `),
    todaySummary: db.prepare(`
      SELECT
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_total), 0) AS total_discount,
        COUNT(*) AS transaction_count
      FROM sales
      WHERE date(sold_at, 'localtime') = date('now', 'localtime')
    `),
    todaySales: db.prepare(`
      SELECT
        id,
        total,
        discount_total,
        sale_type,
        customer_name,
        payment_type,
        customer_id,
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
        products.cost_price,
        SUM(sale_items.quantity) AS quantity_sold,
        SUM(sale_items.quantity * sale_items.price_at_sale) AS revenue,
        SUM(sale_items.quantity * (sale_items.price_at_sale - COALESCE(products.cost_price, 0))) AS profit
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
        cost_price,
        stock,
        unit,
        discount_percent,
        expiry_date,
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
        products.last_restock_at,
        products.expiry_date
      FROM products
      WHERE COALESCE(is_archived, 0) = 0
      ORDER BY COALESCE(products.last_restock_at, products.created_at) DESC, products.name COLLATE NOCASE ASC
    `),
    lowStockProducts: db.prepare(`
      SELECT id, name, barcode, stock FROM products
      WHERE COALESCE(is_archived, 0) = 0 AND stock < 5
      ORDER BY stock ASC
    `),
    expiredProducts: db.prepare(`
      SELECT id, name, barcode, stock, expiry_date FROM products
      WHERE COALESCE(is_archived, 0) = 0 AND expiry_date IS NOT NULL AND date(expiry_date) <= date('now')
      ORDER BY expiry_date ASC
    `),
    expiringSoonProducts: db.prepare(`
      SELECT id, name, barcode, stock, expiry_date FROM products
      WHERE COALESCE(is_archived, 0) = 0 AND expiry_date IS NOT NULL
      AND date(expiry_date) > date('now')
      AND date(expiry_date) <= date('now', '+7 days')
      ORDER BY expiry_date ASC
    `),
    expiringMonthProducts: db.prepare(`
      SELECT id, name, barcode, stock, expiry_date FROM products
      WHERE COALESCE(is_archived, 0) = 0 AND expiry_date IS NOT NULL
      AND date(expiry_date) > date('now', '+7 days')
      AND date(expiry_date) <= date('now', '+30 days')
      ORDER BY expiry_date ASC
    `),
    creditList: db.prepare(`
      SELECT * FROM credits ORDER BY created_at DESC
    `),
    getCreditById: db.prepare("SELECT * FROM credits WHERE id = ? LIMIT 1"),
    insertCredit: db.prepare(`
      INSERT INTO credits (customer_name, customer_phone, total_amount, paid_amount, remaining, sale_id, status)
      VALUES (@customer_name, @customer_phone, @total_amount, @paid_amount, @remaining, @sale_id, 'active')
    `),
    updateCredit: db.prepare(`
      UPDATE credits SET paid_amount = @paid_amount, remaining = @remaining, status = @status WHERE id = @id
    `),
    insertCreditTransaction: db.prepare(`
      INSERT INTO credit_transactions (credit_id, type, amount, balance_after, note)
      VALUES (@credit_id, @type, @amount, @balance_after, @note)
    `),
    getCreditTransactions: db.prepare(`
      SELECT * FROM credit_transactions WHERE credit_id = ? ORDER BY created_at DESC
    `),
    getLastCustomerCode: db.prepare(`
      SELECT customer_code FROM credits WHERE customer_code IS NOT NULL ORDER BY id DESC LIMIT 1
    `),
    updateCreditCode: db.prepare(`
      UPDATE credits SET customer_code = ? WHERE id = ?
    `),
    insertReturn: db.prepare(`
      INSERT INTO returns (sale_id, product_id, quantity, price, reason)
      VALUES (@sale_id, @product_id, @quantity, @price, @reason)
    `),
    getSaleByIdForReturn: db.prepare(`
      SELECT sales.*, sale_items.product_id, sale_items.quantity as sold_quantity,
             sale_items.price_at_sale, products.name as product_name, products.barcode
      FROM sales
      LEFT JOIN sale_items ON sale_items.sale_id = sales.id
      LEFT JOIN products ON products.id = sale_items.product_id
      WHERE sales.id = ?
    `),
    weekSummary: db.prepare(`
      SELECT
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_total), 0) AS total_discount,
        COUNT(*) AS transaction_count
      FROM sales
      WHERE date(sold_at, 'localtime') >= date('now', '-7 days')
    `),
    monthSummary: db.prepare(`
      SELECT
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_total), 0) AS total_discount,
        COUNT(*) AS transaction_count
      FROM sales
      WHERE date(sold_at, 'localtime') >= date('now', '-30 days')
    `),
    weekSales: db.prepare(`
      SELECT
        date(sold_at) as sold_date,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') >= date('now', '-7 days')
      GROUP BY date(sold_at)
      ORDER BY sold_date ASC
    `),
    monthSales: db.prepare(`
      SELECT
        date(sold_at) as sold_date,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') >= date('now', '-30 days')
      GROUP BY date(sold_at)
      ORDER BY sold_date ASC
    `),
    weekTopProducts: db.prepare(`
      SELECT
        products.id,
        products.name,
        products.barcode,
        products.cost_price,
        SUM(sale_items.quantity) AS quantity_sold,
        SUM(sale_items.quantity * sale_items.price_at_sale) AS revenue,
        SUM(sale_items.quantity * (sale_items.price_at_sale - COALESCE(products.cost_price, 0))) AS profit
      FROM sale_items
      INNER JOIN sales ON sales.id = sale_items.sale_id
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE date(sales.sold_at, 'localtime') >= date('now', '-7 days')
      GROUP BY products.id
      ORDER BY quantity_sold DESC
      LIMIT 5
    `),
    monthTopProducts: db.prepare(`
      SELECT
        products.id,
        products.name,
        products.barcode,
        products.cost_price,
        SUM(sale_items.quantity) AS quantity_sold,
        SUM(sale_items.quantity * sale_items.price_at_sale) AS revenue,
        SUM(sale_items.quantity * (sale_items.price_at_sale - COALESCE(products.cost_price, 0))) AS profit
      FROM sale_items
      INNER JOIN sales ON sales.id = sale_items.sale_id
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE date(sales.sold_at, 'localtime') >= date('now', '-30 days')
      GROUP BY products.id
      ORDER BY quantity_sold DESC
      LIMIT 5
    `),
    userLogin: db.prepare("SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1"),
    createUser: db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)"),
    listUsers: db.prepare("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"),
    deleteUser: db.prepare("DELETE FROM users WHERE id = ?"),
    getAllSalesForExport: db.prepare(`
      SELECT
        date(sales.sold_at) as sold_date,
        products.name as product_name,
        sale_items.quantity,
        sale_items.price_at_sale,
        (sale_items.quantity * sale_items.price_at_sale) as total,
        (sale_items.quantity * (sale_items.price_at_sale - COALESCE(products.cost_price, 0))) as profit
      FROM sale_items
      INNER JOIN sales ON sales.id = sale_items.sale_id
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE date(sales.sold_at, 'localtime') >= date('now', '-30 days')
      ORDER BY sales.sold_at DESC
    `),
    getSetting: db.prepare("SELECT value FROM settings WHERE key = ?"),
    setSetting: db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"),
    searchCustomers: db.prepare(`
      SELECT * FROM customers
      WHERE phone LIKE @query OR name LIKE @query
      ORDER BY name COLLATE NOCASE ASC
    `),
    getCustomerByPhone: db.prepare("SELECT * FROM customers WHERE phone = ? LIMIT 1"),
    getCustomerById: db.prepare("SELECT * FROM customers WHERE id = ? LIMIT 1"),
    insertCustomer: db.prepare("INSERT INTO customers (name, phone) VALUES (?, ?)"),
    updateCustomer: db.prepare("UPDATE customers SET name = ?, phone = ? WHERE id = ?"),
    deleteCustomer: db.prepare("DELETE FROM customers WHERE id = ?"),
    getCustomerSales: db.prepare(`
      SELECT sales.*, time(sales.sold_at, 'localtime') as sold_time
      FROM sales
      WHERE customer_id = ?
      ORDER BY sales.sold_at DESC
    `),
    getCustomerStats: db.prepare(`
      SELECT
        COUNT(*) as purchase_count,
        COALESCE(SUM(total), 0) as total_spent,
        MAX(sold_at) as last_visit
      FROM sales
      WHERE customer_id = ?
    `),
    getPaymentBreakdown: db.prepare(`
      SELECT
        payment_type,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') = date('now', 'localtime')
      GROUP BY payment_type
    `),
    getPaymentBreakdownWeek: db.prepare(`
      SELECT
        payment_type,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') >= date('now', '-7 days')
      GROUP BY payment_type
    `),
    getPaymentBreakdownMonth: db.prepare(`
      SELECT
        payment_type,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') >= date('now', '-30 days')
      GROUP BY payment_type
    `),
    insertShift: db.prepare(`
      INSERT INTO shifts (cashier_id, started_at, status)
      VALUES (@cashier_id, @started_at, 'open')
    `),
    getOpenShift: db.prepare("SELECT * FROM shifts WHERE status = 'open' LIMIT 1"),
    getShiftById: db.prepare("SELECT * FROM shifts WHERE id = ? LIMIT 1"),
    closeShift: db.prepare(`
      UPDATE shifts SET
        ended_at = @ended_at,
        total_sales = @total_sales,
        naqt = @naqt,
        plastik = @plastik,
        click = @click,
        nasiya = @nasiya,
        transaction_count = @transaction_count,
        profit = @profit,
        status = @status
      WHERE id = @id
    `),
    shiftHistory: db.prepare(`
      SELECT * FROM shifts WHERE status = 'closed' ORDER BY ended_at DESC LIMIT ?
    `),
    returnsCount: db.prepare(`
      SELECT COUNT(*) as count FROM returns
      WHERE date(returned_at, 'localtime') BETWEEN date(?) AND date(?)
    `),
    todayReturnsCount: db.prepare(`
      SELECT COUNT(*) as count FROM returns
      WHERE date(returned_at, 'localtime') = date('now', 'localtime')
    `),
    creditsTotalActive: db.prepare(`
      SELECT COALESCE(SUM(remaining), 0) as total FROM credits WHERE status = 'active'
    `),
    creditsCollectedToday: db.prepare(`
      SELECT COALESCE(SUM(total_amount - remaining), 0) as total FROM credits
      WHERE status = 'paid' AND date(created_at) = date('now')
    `),
    overdueCredits: db.prepare(`
      SELECT * FROM credits
      WHERE status = 'active' AND date(created_at, 'localtime') < date('now', '-7 days')
      ORDER BY remaining DESC
    `),
    hourlySales: db.prepare(`
      SELECT
        CAST(strftime('%H', sold_at) AS INTEGER) as hour,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') BETWEEN date(?) AND date(?)
      GROUP BY hour
      ORDER BY hour ASC
    `),
    dailySales: db.prepare(`
      SELECT
        date(sold_at) as sold_date,
        SUM(total) as total,
        SUM(CASE WHEN payment_type = 'naqt' THEN total ELSE 0 END) as naqt,
        SUM(CASE WHEN sale_type = 'credit' THEN total ELSE 0 END) as nasiya,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') BETWEEN date(?) AND date(?)
      GROUP BY date(sold_at)
      ORDER BY sold_date ASC
    `),
    topProductsRevenue: db.prepare(`
      SELECT
        products.id,
        products.name,
        SUM(sale_items.quantity) as quantity_sold,
        SUM(sale_items.quantity * sale_items.price_at_sale) as revenue,
        SUM(sale_items.quantity * (sale_items.price_at_sale - COALESCE(products.cost_price, 0))) as profit
      FROM sale_items
      INNER JOIN sales ON sales.id = sale_items.sale_id
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE date(sales.sold_at, 'localtime') BETWEEN date(?) AND date(?)
      GROUP BY products.id
      ORDER BY revenue DESC
      LIMIT ?
    `),
    transactionsList: db.prepare(`
      SELECT
        sales.id,
        sales.sold_at,
        time(sales.sold_at, 'localtime') as sold_time,
        sales.cashier_id,
        sales.total,
        sales.payment_type,
        sales.sale_type,
        SUM(sale_items.quantity * (sale_items.price_at_sale - COALESCE(products.cost_price, 0))) as profit
      FROM sales
      LEFT JOIN sale_items ON sale_items.sale_id = sales.id
      LEFT JOIN products ON products.id = sale_items.product_id
      WHERE date(sales.sold_at, 'localtime') BETWEEN date(?) AND date(?)
      GROUP BY sales.id
      ORDER BY sales.sold_at DESC
      LIMIT ?
    `),
    productsSales: db.prepare(`
      SELECT
        products.name as product_name,
        sale_items.quantity,
        sale_items.price_at_sale,
        SUM(sale_items.quantity * sale_items.price_at_sale) as total,
        SUM(sale_items.quantity * (sale_items.price_at_sale - COALESCE(products.cost_price, 0))) as profit,
        date(sales.sold_at) as sold_date
      FROM sale_items
      INNER JOIN sales ON sales.id = sale_items.sale_id
      INNER JOIN products ON products.id = sale_items.product_id
      WHERE date(sales.sold_at, 'localtime') BETWEEN date(?) AND date(?)
      GROUP BY sale_items.id
      ORDER BY sales.sold_at DESC
    `),
    creditsList: db.prepare(`
      SELECT * FROM credits ORDER BY created_at DESC
    `),
    customSummary: db.prepare(`
      SELECT
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_total), 0) AS total_discount,
        COUNT(*) AS transaction_count
      FROM sales
      WHERE date(sold_at, 'localtime') BETWEEN date(?) AND date(?)
    `),
    customPaymentBreakdown: db.prepare(`
      SELECT
        COALESCE(payment_type, 'naqt') as payment_type,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales
      WHERE date(sold_at, 'localtime') BETWEEN date(?) AND date(?)
      GROUP BY payment_type
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
      const existing = statements.getProductByIdRaw.get(Number(id));
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
        throw new Error("Qo'shiladigan miqdor musbat butun son bo'lishi kerak");
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

    createSale(cartItems, cashierId = null) {
      const items = Array.isArray(cartItems) ? cartItems : [];
      if (items.length === 0) {
        throw new Error("Savat bo'sh");
      }

      const saleItems = items.map((item) => {
        const productId = Number(item.product_id ?? item.id);
        const quantity = Number(item.quantity ?? 0);
        const priceAtSale = Number(item.price_at_sale ?? item.price ?? 0);
        const discountPercent = Number(item.discount_percent ?? 0);
        const unit = item.unit || "dona";
        if (quantity <= 0) {
          throw new Error("Miqdor noto'g'ri");
        }
        return { productId, quantity, priceAtSale, discountPercent, unit };
      });

      const transaction = db.transaction((rows) => {
        const subtotal = rows.reduce(
          (sum, row) => sum + row.quantity * row.priceAtSale,
          0,
        );
        const discountTotal = rows.reduce(
          (sum, row) => sum + (row.quantity * row.priceAtSale * row.discountPercent / 100),
          0,
        );
        const total = subtotal - discountTotal;
        const soldAt = new Date().toISOString();
        const saleType = cartItems[0]?.sale_type || "cash";
        const customerName = cartItems[0]?.customer_name || null;
        const customerPhone = cartItems[0]?.customer_phone || null;
        const paymentType = cartItems[0]?.payment_type || "naqt";
        const customerId = cartItems[0]?.customer_id || null;

        const saleResult = statements.insertSale.run(total, discountTotal, saleType, customerName, customerPhone, paymentType, customerId, soldAt, cashierId);
        const saleId = saleResult.lastInsertRowid;

        let creditId = null;
        if (saleType === "credit") {
          const paidAmount = Number(cartItems[0]?.paid_amount || 0);
          const remainingAmount = total - paidAmount;
          const creditResult = statements.insertCredit.run({
            customer_name: customerName,
            customer_phone: customerPhone,
            total_amount: total,
            paid_amount: paidAmount,
            remaining: remainingAmount,
            sale_id: saleId,
          });
          creditId = creditResult.lastInsertRowid;
        }

        for (const row of rows) {
          let stockToReduce = row.quantity;
          if (row.unit === "kg") {
            stockToReduce = Math.ceil(row.quantity);
          }
          const stockUpdate = statements.reduceStock.run(
            stockToReduce,
            row.productId,
            stockToReduce,
          );
          if (stockUpdate.changes !== 1) {
            throw new Error("Sklad yetarli emas");
          }
          statements.insertSaleItem.run(
            saleId,
            row.productId,
            row.quantity,
            row.priceAtSale,
            row.discountPercent,
          );
        }

        return { saleId, creditId };
      });

      const { saleId } = transaction(saleItems);
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
          discount_percent: item.discount_percent,
          subtotal: item.quantity * item.price_at_sale * (1 - (item.discount_percent || 0) / 100),
          cost_price: item.cost_price,
        })),
      };
    },

    getTodaySummary() {
      const summary = statements.todaySummary.get();
      const breakdown = statements.getPaymentBreakdown.all();
      const paymentStats = {
        naqt: 0,
        karta: 0,
        click: 0,
      };
      breakdown.forEach((b) => {
        if (b.payment_type === "naqt") paymentStats.naqt = b.total;
        else if (b.payment_type === "karta") paymentStats.karta = b.total;
        else if (b.payment_type === "click") paymentStats.click = b.total;
      });
      return {
        totalSales: Number(summary.total_sales || 0),
        totalDiscount: Number(summary.total_discount || 0),
        transactionCount: Number(summary.transaction_count || 0),
        paymentStats,
      };
    },

    getWeekSummary() {
      const summary = statements.weekSummary.get();
      const breakdown = statements.getPaymentBreakdownWeek.all();
      const paymentStats = {
        naqt: 0,
        karta: 0,
        click: 0,
      };
      breakdown.forEach((b) => {
        if (b.payment_type === "naqt") paymentStats.naqt = b.total;
        else if (b.payment_type === "karta") paymentStats.karta = b.total;
        else if (b.payment_type === "click") paymentStats.click = b.total;
      });
      return {
        totalSales: Number(summary.total_sales || 0),
        totalDiscount: Number(summary.total_discount || 0),
        transactionCount: Number(summary.transaction_count || 0),
        paymentStats,
      };
    },

    getMonthSummary() {
      const summary = statements.monthSummary.get();
      const breakdown = statements.getPaymentBreakdownMonth.all();
      const paymentStats = {
        naqt: 0,
        karta: 0,
        click: 0,
      };
      breakdown.forEach((b) => {
        if (b.payment_type === "naqt") paymentStats.naqt = b.total;
        else if (b.payment_type === "karta") paymentStats.karta = b.total;
        else if (b.payment_type === "click") paymentStats.click = b.total;
      });
      return {
        totalSales: Number(summary.total_sales || 0),
        totalDiscount: Number(summary.total_discount || 0),
        transactionCount: Number(summary.transaction_count || 0),
        paymentStats,
      };
    },

    getTodaySales() {
      return statements.todaySales.all().map((sale) => ({
        id: sale.id,
        total: sale.total,
        discount_total: sale.discount_total,
        sale_type: sale.sale_type,
        customer_name: sale.customer_name,
        payment_type: sale.payment_type,
        customer_id: sale.customer_id,
        sold_at: sale.sold_at,
        sold_time: sale.sold_time,
      }));
    },

    getWeekSales() {
      return statements.weekSales.all().map((row) => ({
        sold_date: row.sold_date,
        total: row.total,
        count: row.count,
      }));
    },

    getMonthSales() {
      return statements.monthSales.all().map((row) => ({
        sold_date: row.sold_date,
        total: row.total,
        count: row.count,
      }));
    },

    getTopProductsToday(limit = 5) {
      return statements.topProducts.all(Number(limit)).map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        quantitySold: Number(row.quantity_sold || 0),
        revenue: Number(row.revenue || 0),
        profit: Number(row.profit || 0),
      }));
    },

    getTopProductsWeek(limit = 5) {
      return statements.weekTopProducts.all(Number(limit)).map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        quantitySold: Number(row.quantity_sold || 0),
        revenue: Number(row.revenue || 0),
        profit: Number(row.profit || 0),
      }));
    },

    getTopProductsMonth(limit = 5) {
      return statements.monthTopProducts.all(Number(limit)).map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        quantitySold: Number(row.quantity_sold || 0),
        revenue: Number(row.revenue || 0),
        profit: Number(row.profit || 0),
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
        expiryDate: row.expiry_date,
      }));
    },

    getLowStockProducts() {
      return statements.lowStockProducts.all().map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        stock: row.stock,
      }));
    },

    getExpiredProducts() {
      return statements.expiredProducts.all().map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        stock: row.stock,
        expiryDate: row.expiry_date,
      }));
    },

    getExpiringSoonProducts() {
      return statements.expiringSoonProducts.all().map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        stock: row.stock,
        expiryDate: row.expiry_date,
      }));
    },

    getExpiringMonthProducts() {
      return statements.expiringMonthProducts.all().map((row) => ({
        id: row.id,
        name: row.name,
        barcode: row.barcode,
        stock: row.stock,
        expiryDate: row.expiry_date,
      }));
    },

    getCreditList() {
      return statements.creditList.all().map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerCode: row.customer_code,
        totalAmount: row.total_amount,
        paidAmount: row.paid_amount,
        remaining: row.remaining,
        saleId: row.sale_id,
        createdAt: row.created_at,
        status: row.status,
      }));
    },

    getCreditById(id) {
      const row = statements.getCreditById.get(Number(id));
      if (!row) return null;
      return {
        id: row.id,
        customerCode: row.customer_code,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        totalAmount: row.total_amount,
        paidAmount: row.paid_amount,
        remaining: row.remaining,
        saleId: row.sale_id,
        createdAt: row.created_at,
        status: row.status,
      };
    },

    addCreditPayment(id, amount) {
      const credit = statements.getCreditById.get(Number(id));
      if (!credit) {
        throw new Error("Nasiya topilmadi");
      }
      const newPaid = credit.paid_amount + Number(amount);
      const newRemaining = credit.total_amount - newPaid;
      const newStatus = newRemaining <= 0 ? "paid" : "active";
      statements.updateCredit.run({
        id: Number(id),
        paid_amount: newPaid,
        remaining: newRemaining,
        status: newStatus,
      });
      statements.insertCreditTransaction.run({
        credit_id: Number(id),
        type: "payment",
        amount: Number(amount),
        balance_after: newRemaining,
        note: "To'lov",
      });
      return this.getCreditById(id);
    },

    addCreditDebt(id, amount, note = "") {
      const credit = statements.getCreditById.get(Number(id));
      if (!credit) {
        throw new Error("Nasiya topilmadi");
      }
      const newTotal = credit.total_amount + Number(amount);
      const newRemaining = newTotal - credit.paid_amount;
      statements.updateCredit.run({
        id: Number(id),
        paid_amount: credit.paid_amount,
        remaining: newRemaining,
        status: "active",
      });
      statements.insertCreditTransaction.run({
        credit_id: Number(id),
        type: "debt",
        amount: Number(amount),
        balance_after: newRemaining,
        note: note || "Yangi qarz",
      });
      return this.getCreditById(id);
    },

    getCreditTransactions(creditId) {
      return statements.getCreditTransactions.all(Number(creditId)).map((row) => ({
        id: row.id,
        creditId: row.credit_id,
        type: row.type,
        amount: row.amount,
        balanceAfter: row.balance_after,
        note: row.note,
        createdAt: row.created_at,
      }));
    },

    getOrCreateCredit(customerName, customerPhone, saleId) {
      if (customerPhone) {
        const existing = db.prepare("SELECT * FROM credits WHERE customer_phone = ? AND status = 'active' LIMIT 1").get(String(customerPhone));
        if (existing) {
          return this.getCreditById(existing.id);
        }
      }
      const lastCode = statements.getLastCustomerCode.get();
      let newCode = "#0001";
      if (lastCode && lastCode.customer_code) {
        const num = parseInt(lastCode.customer_code.replace("#", ""), 10);
        newCode = "#" + String(num + 1).padStart(4, "0");
      }
      const result = statements.insertCredit.run({
        customer_name: customerName,
        customer_phone: customerPhone || null,
        total_amount: 0,
        paid_amount: 0,
        remaining: 0,
        sale_id: saleId,
      });
      const creditId = result.lastInsertRowid;
      statements.updateCreditCode.run(newCode, creditId);
      return this.getCreditById(creditId);
    },

    createReturn(saleId, productId, quantity, price, reason) {
      const product = statements.getProductByIdRaw.get(Number(productId));
      if (!product) {
        throw new Error("Mahsulot topilmadi");
      }

      statements.insertReturn.run({
        sale_id: Number(saleId),
        product_id: Number(productId),
        quantity: Number(quantity),
        price: Number(price),
        reason: reason,
      });

      const productUnit = product.unit || "dona";
      let stockToRestore = Number(quantity);
      if (productUnit === "kg") {
        stockToRestore = Math.ceil(Number(quantity));
      }
      statements.restoreStock.run(stockToRestore, Number(productId));

      return { success: true };
    },

    getSaleForReturn(saleId) {
      const rows = statements.getSaleByIdForReturn.all(Number(saleId));
      if (rows.length === 0) return null;

      const saleInfo = rows[0];
      const items = rows.filter(r => r.product_id).map(r => ({
        productId: r.product_id,
        productName: r.product_name,
        barcode: r.barcode,
        quantity: r.sold_quantity,
        priceAtSale: r.price_at_sale,
      }));

      return {
        sale: {
          id: saleInfo.id,
          total: saleInfo.total,
          soldAt: saleInfo.sold_at,
          customerName: saleInfo.customer_name,
        },
        items,
      };
    },

    login(username, password) {
      const user = statements.userLogin.get(String(username), String(password));
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        username: user.username,
        role: user.role,
      };
    },

    createUser(username, password, role) {
      const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(String(username));
      if (existing) {
        throw new Error("Bunday foydalanuvchi mavjud");
      }
      const result = statements.createUser.run(String(username), String(password), role || "kassir");
      return { id: result.lastInsertRowid, username, role: role || "kassir" };
    },

    listUsers() {
      return statements.listUsers.all();
    },

    deleteUser(id) {
      const user = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'kassir'").get(Number(id));
      if (!user) {
        throw new Error("Foydalanuvchi topilmadi yoki o'chirib bo'lmaydi");
      }
      statements.deleteUser.run(Number(id));
      return { success: true };
    },

    changePassword(username, currentPassword, newPassword) {
      const user = statements.userLogin.get(String(username), String(currentPassword));
      if (!user) {
        throw new Error("Joriy parol noto'g'ri");
      }
      db.prepare("UPDATE users SET password = ? WHERE username = ?").run(String(newPassword), String(username));
      return { success: true };
    },

    getAllSalesForExport() {
      return statements.getAllSalesForExport.all();
    },

    getSetting(key) {
      const row = statements.getSetting.get(key);
      return row ? row.value : null;
    },

    setSetting(key, value) {
      statements.setSetting.run(key, value);
    },

    getStoreSettings() {
      return {
        storeName: this.getSetting("store_name") || "Blokpost",
        storePhone: this.getSetting("store_phone") || "",
        storeAddress: this.getSetting("store_address") || "",
        receiptFooter: this.getSetting("receipt_footer") || "Rahmat! Yana keling 😊",
        storeLogo: this.getSetting("store_logo"),
      };
    },

    setStoreSettings(settings) {
      if (settings.storeName !== undefined) {
        this.setSetting("store_name", settings.storeName);
      }
      if (settings.storePhone !== undefined) {
        this.setSetting("store_phone", settings.storePhone);
      }
      if (settings.storeAddress !== undefined) {
        this.setSetting("store_address", settings.storeAddress);
      }
      if (settings.receiptFooter !== undefined) {
        this.setSetting("receipt_footer", settings.receiptFooter);
      }
      if (settings.storeLogo !== undefined) {
        this.setSetting("store_logo", settings.storeLogo);
      }
    },

    searchCustomers(searchTerm = "") {
      const query = `%${String(searchTerm).trim()}%`;
      if (query === "%%") {
        return db.prepare("SELECT * FROM customers ORDER BY name COLLATE NOCASE ASC").all();
      }
      return statements.searchCustomers.all({ query });
    },

    getCustomerByPhone(phone) {
      if (!phone) return null;
      return statements.getCustomerByPhone.get(String(phone).trim()) || null;
    },

    getCustomerById(id) {
      return statements.getCustomerById.get(Number(id)) || null;
    },

    createCustomer(name, phone) {
      const existing = phone ? db.prepare("SELECT id FROM customers WHERE phone = ?").get(String(phone)) : null;
      if (existing) {
        throw new Error("Bu telefon raqamli mijoz mavjud");
      }
      const result = statements.insertCustomer.run(String(name), phone ? String(phone) : null);
      return statements.getCustomerById.get(result.lastInsertRowid);
    },

    updateCustomer(id, name, phone) {
      const existing = statements.getCustomerById.get(Number(id));
      if (!existing) {
        throw new Error("Mijoz topilmadi");
      }
      if (phone) {
        const phoneExists = db.prepare("SELECT id FROM customers WHERE phone = ? AND id != ?").get(String(phone), Number(id));
        if (phoneExists) {
          throw new Error("Bu telefon raqam boshqa mijozga tegishli");
        }
      }
      statements.updateCustomer.run(String(name), phone ? String(phone) : null, Number(id));
      return statements.getCustomerById.get(Number(id));
    },

    deleteCustomer(id) {
      statements.deleteCustomer.run(Number(id));
      return { success: true };
    },

    getCustomerStats(customerId) {
      const stats = statements.getCustomerStats.get(Number(customerId));
      return {
        purchaseCount: stats.purchase_count || 0,
        totalSpent: stats.total_spent || 0,
        lastVisit: stats.last_visit || null,
      };
    },

    getCustomerHistory(customerId) {
      return statements.getCustomerSales.all(Number(customerId)).map((sale) => ({
        id: sale.id,
        total: sale.total,
        soldAt: sale.sold_at,
        soldTime: sale.sold_time,
        paymentType: sale.payment_type,
      }));
    },

    createShift(cashierId) {
      const result = statements.insertShift.run({
        cashier_id: cashierId,
        started_at: new Date().toISOString(),
      });
      return this.getShiftById(result.lastInsertRowid);
    },

    getOpenShift() {
      const shift = statements.getOpenShift.get();
      if (!shift) return null;
      return {
        id: shift.id,
        cashierId: shift.cashier_id,
        startedAt: shift.started_at,
        status: shift.status,
      };
    },

    getShiftById(id) {
      const shift = statements.getShiftById.get(Number(id));
      if (!shift) return null;
      return {
        id: shift.id,
        cashierId: shift.cashier_id,
        startedAt: shift.started_at,
        endedAt: shift.ended_at,
        totalSales: shift.total_sales,
        naqt: shift.naqt,
        plastik: shift.plastik,
        click: shift.click,
        nasiya: shift.nasiya,
        transactionCount: shift.transaction_count,
        profit: shift.profit,
        status: shift.status,
      };
    },

    closeShift(shiftId, totals) {
      const shift = statements.getShiftById.get(Number(shiftId));
      if (!shift) {
        throw new Error("Smena topilmadi");
      }
      statements.closeShift.run({
        ended_at: new Date().toISOString(),
        total_sales: totals.totalSales,
        naqt: totals.naqt,
        plastik: totals.plastik,
        click: totals.click,
        nasiya: totals.nasiya,
        transaction_count: totals.transactionCount,
        profit: totals.profit,
        status: "closed",
        id: Number(shiftId),
      });
      return this.getShiftById(shiftId);
    },

    getShiftHistory(limit = 20) {
      return statements.shiftHistory.all(Number(limit)).map((s) => ({
        id: s.id,
        cashierId: s.cashier_id,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        totalSales: s.total_sales,
        naqt: s.naqt,
        plastik: s.plastik,
        click: s.click,
        nasiya: s.nasiya,
        transactionCount: s.transaction_count,
        profit: s.profit,
        status: s.status,
      }));
    },

    getReturnsCount(startDate, endDate) {
      const result = statements.returnsCount.get(startDate, endDate);
      return result?.count || 0;
    },

    getTodayReturnsCount() {
      const result = statements.todayReturnsCount.get();
      return result?.count || 0;
    },

    getCreditsSummary(startDate, endDate) {
      const totalActive = statements.creditsTotalActive.get();
      const collectedToday = statements.creditsCollectedToday.get();
      const overdueCredits = statements.overdueCredits.all();
      return {
        totalActive: totalActive?.total || 0,
        collectedToday: collectedToday?.total || 0,
        overdueCount: overdueCredits.length,
        overdueAmount: overdueCredits.reduce((sum, c) => sum + (c.remaining || 0), 0),
        topDebtors: overdueCredits.slice(0, 5).map((c) => ({
          name: c.customer_name,
          phone: c.customer_phone,
          amount: c.remaining,
        })),
      };
    },

    getHourlySales(startDate, endDate) {
      return statements.hourlySales.all(startDate, endDate).map((r) => ({
        hour: r.hour,
        total: r.total,
        count: r.count,
      }));
    },

    getDailySales(startDate, endDate) {
      return statements.dailySales.all(startDate, endDate).map((r) => ({
        date: r.sold_date,
        total: r.total,
        naqt: r.naqt || 0,
        nasiya: r.nasiya || 0,
        count: r.count,
      }));
    },

    getTopProductsByRevenue(startDate, endDate, limit = 10) {
      return statements.topProductsRevenue.all(startDate, endDate, Number(limit)).map((r) => ({
        id: r.id,
        name: r.name,
        quantitySold: r.quantity_sold,
        revenue: r.revenue,
        profit: r.profit,
      }));
    },

    getTransactionsList(startDate, endDate, limit = 100) {
      return statements.transactionsList.all(startDate, endDate, Number(limit)).map((t) => ({
        id: t.id,
        soldAt: t.sold_at,
        soldTime: t.sold_time,
        cashierId: t.cashier_id,
        total: t.total,
        profit: t.profit,
        paymentType: t.payment_type,
        saleType: t.sale_type,
      }));
    },

    getProductsSales(startDate, endDate) {
      return statements.productsSales.all(startDate, endDate).map((r) => ({
        productName: r.product_name,
        quantity: r.quantity,
        price: r.price_at_sale,
        total: r.total,
        profit: r.profit,
        date: r.sold_date,
      }));
    },

    getCreditsList(startDate, endDate) {
      return statements.creditsList.all().map((c) => ({
        id: c.id,
        customerName: c.customer_name,
        customerPhone: c.customer_phone,
        totalAmount: c.total_amount,
        paidAmount: c.paid_amount,
        remaining: c.remaining,
        createdAt: c.created_at,
        status: c.status,
      }));
    },

    getCustomSummary(startDate, endDate) {
      const summary = statements.customSummary.get(startDate, endDate);
      const breakdown = statements.customPaymentBreakdown.all(startDate, endDate);
      const paymentStats = { naqt: 0, plastik: 0, click: 0, nasiya: 0 };
      breakdown.forEach((b) => {
        if (b.payment_type === "naqt") paymentStats.naqt = b.total;
        else if (b.payment_type === "karta") paymentStats.plastik = b.total;
        else if (b.payment_type === "click") paymentStats.click = b.total;
        else if (b.payment_type === "credit") paymentStats.nasiya = b.total;
      });
      return {
        totalSales: Number(summary?.total_sales || 0),
        totalDiscount: Number(summary?.total_discount || 0),
        transactionCount: Number(summary?.transaction_count || 0),
        paymentStats,
      };
    },
  };
}

function normalizeProductPayload(payload, id = null) {
  const name = String(payload?.name || "").trim();
  const barcode = String(payload?.barcode || "").trim();
  const price = Number(payload?.price);
  const stock = Number(payload?.stock ?? 0);
  const unit = payload?.unit === "kg" ? "kg" : "dona";
  const costPrice = Number(payload?.cost_price ?? 0);
  const discountPercent = Math.min(100, Math.max(0, Number(payload?.discount_percent ?? 0)));
  const expiryDate = payload?.expiry_date || null;

  if (!name) {
    throw new Error("Mahsulot nomi kiritilmagan");
  }
  if (!barcode) {
    throw new Error("Shtrix-kod kiritilmagan");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Narx noto'g'ri");
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Boshlang'ich qolgan miqdor noto'g'ri");
  }

  return {
    name,
    barcode,
    price: Number(price.toFixed(2)),
    stock,
    unit,
    cost_price: costPrice,
    discount_percent: discountPercent,
    expiry_date: expiryDate,
  };
}

module.exports = {
  createPosDatabase,
};