# 💰 Expense Tracker Pro

> A modern personal finance tracker with income/expense logging, budget management, category charts, CSV/JSON export, and offline support — built with vanilla HTML, CSS, and JavaScript.

![PWA Ready](https://img.shields.io/badge/PWA-Installable-6366f1?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

🔗 **Live Demo:** https://Sonu-H-N.github.io/Expense-Tracker

---

## ✨ Features

### 💵 Transactions
- Add income and expense transactions with **description, category, amount, and date**
- Choose any past or future date (not locked to today)
- Amounts formatted with Indian rupee notation (₹1,23,456.00)
- Delete any transaction
- Newest transactions shown first

### 📊 Dashboard
- **Summary strip** — Income, Balance, and Expense totals with colour-coded indicators
- **Expense breakdown doughnut chart** (Chart.js) — shows category split for expenses only, not income
- Chart legend automatically recolours for dark/light mode

### 🎯 Budget
- Set a monthly budget and track remaining balance
- **Visual progress bar** that shifts from green → amber → red as you approach the limit
- Status messages: on track / watch your spending / almost at limit / over budget
- Over-budget remaining shown in red with exact amount

### 🔍 Search
- Real-time search across description, category, and date
- List filters instantly as you type

### 📂 Data Management
- **Export CSV** — all transactions in a spreadsheet-ready format (fields properly quoted)
- **Backup JSON** — full backup including budget setting
- **Restore** — restore any previous backup file; validates format before applying

### 🎨 Interface
- Dark/light theme toggle with correct label ("Dark Mode" / "Light Mode"), **persisted** across sessions
- Responsive grid layout for desktop, tablet, and mobile
- Toast notifications with smooth fade-out for all actions
- Accessible focus indicators on all interactive elements

### 📱 PWA
- Installable to home screen
- Full offline support via Service Worker (cache-first for app shell + Chart.js)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | App markup |
| CSS3 | CSS-variable theming, responsive grid, animations |
| Vanilla JavaScript (ES6+) | All logic, no frameworks |
| [Chart.js](https://www.chartjs.org/) | Category expense doughnut chart |
| localStorage | Transactions, budget, and theme persistence |
| Service Worker | PWA offline caching |

---

## 📂 Project Structure

```
Expense-Tracker/
├── index.html           # Full app — header, summary strip, grid, form, chart, history
├── style.css              # Complete design system (light + dark, responsive)
├── script.js                # All app logic: transactions, budget, chart, export, search
├── service-worker.js          # PWA offline caching with activate cleanup
├── manifest.json                # PWA manifest (installable, standalone)
└── README.md                      # This file
```

> **No build tools. No npm. No backend.** Open `index.html` in a browser — it works immediately.

---

## ⚙️ How to Run

### Option 1 — Open directly
```
Double-click index.html
```

### Option 2 — Live Server (recommended for Service Worker)
```bash
# VS Code: Install "Live Server" → Right-click index.html → Open with Live Server

# Or Python:
python -m http.server 8080
# Visit: http://localhost:8080
```

---

## 🗂️ Data Storage

| Key | Contents |
|---|---|
| `transactions` | JSON array of `{ id, text, amount, category, date }` |
| `budget` | Monthly budget amount |
| `mode` | `dark` or `light` |

**No data leaves your device.** All storage is in `localStorage` in your browser.

---

## 🔮 Future Enhancements

- ✏️ Edit transactions in place
- 🔐 User authentication (Firebase)
- ☁️ Cloud sync across devices
- 📊 Monthly trend charts and spending analytics
- 🤖 AI-based spending insights

---

## 👨‍💻 Author

**Sonu H N**
GitHub: https://github.com/Sonu-H-N

⭐ If you like this project, star it on GitHub!

---

## 📜 License

This project is open-source under the MIT License.
