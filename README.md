# ABIDiN — Retail POS System

> A fast, offline-first Point of Sale desktop application built for retail stores in Uzbekistan.

![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)

---

## What is ABIDiN?

ABIDiN is a lightweight desktop POS (Point of Sale) system designed for small retail shops. It runs fully offline, works with barcode scanners and thermal printers, and keeps everything — products, sales, and stock — in one place.

Built with love in Uzbekistan. 🇺🇿

---

## Features

### 🛒 Cashier / Kassa
- Instant barcode scan → product appears in cart
- Add multiple items, calculate total automatically
- Complete sale with one click
- Print thermal receipt (ESC/POS)
- Clear cart instantly

### 📦 Product Management
- Add, edit, and delete products
- Fields: name, barcode, price, stock quantity
- Barcode can be scanned or typed manually
- Search by name or barcode

### 🏭 Stock / Sklad
- Live stock levels for all products
- Red alert when stock drops below 5 units
- Add incoming stock with one click
- Track last restock date

### 📊 Reports
- Today's total revenue
- Number of transactions per day
- Top 5 best-selling products
- Full daily sales log with timestamps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron.js |
| Frontend | React + Tailwind CSS |
| Database | SQLite (via better-sqlite3) |
| Packaging | electron-builder (NSIS installer) |
| Hardware | USB barcode scanner (HID) + ESC/POS thermal printer |

---

## Design

| Color | Hex | Usage |
|---|---|---|
| Ocean Deep | `#003366` | Sidebar, primary actions |
| Warm Sand | `#F5DEB3` | Background, cards |
| Success | `#2E7D32` | Confirm, sold |
| Danger | `#C62828` | Delete, low stock |

---

## Getting Started

### Requirements
- Windows 10 or 11
- Node.js v18+
- USB Barcode Scanner
- Thermal Printer (optional)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/akmaljonpolatov8/Abidin.git
cd Abidin

# Install dependencies
npm install

# Start in development mode
npm start
```

### Build .exe Installer

```bash
npm run build
```

Output will be in `dist/ABIDiN Setup 1.0.0.exe`

---

## How to Use

1. **Add products** — Go to "Mahsulotlar", scan barcode, enter name + price + stock
2. **Sell** — Go to "Kassa", scan product barcodes, press "Sotish"
3. **Monitor stock** — Check "Sklad" for low stock alerts
4. **View reports** — Open "Hisobot" for daily sales summary

---

## Project Structure

```
abadin/
├── main.js              ← Electron main process
├── preload.js           ← Context bridge (IPC)
├── package.json
└── src/
    ├── App.jsx          ← Root + routing
    ├── db.js            ← SQLite setup + queries
    ├── pages/
    │   ├── Cashier.jsx
    │   ├── Products.jsx
    │   ├── Stock.jsx
    │   └── Reports.jsx
    └── components/
        ├── Sidebar.jsx
        ├── ProductCard.jsx
        └── ReceiptModal.jsx
```

---

## Roadmap

- [ ] Multi-store support
- [ ] Cloud sync / backup
- [ ] Customer loyalty system
- [ ] Mobile companion app (Android)
- [ ] Automatic daily email reports

---

## License

MIT © 2025 [akmaljonpolatov8](https://github.com/akmaljonpolatov8)

---

> Built with Electron + React · Runs on Windows · Works offline · Made for Uzbekistan 🇺🇿
