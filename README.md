# 💰 Expense Tracker Pro

> A modern personal finance tracker with income/expense logging, budget management, category charts, CSV/JSON export, recurring transactions, and offline support — built with vanilla HTML, CSS, and JavaScript.

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

### 🔁 Recurring transactions
- Schedule weekly, monthly, or yearly income and expenses
- Optional end date, with controls to pause, resume, or delete a schedule
- Due transactions are generated when the app is opened and saved locally
- Monthly and yearly dates are clamped to valid calendar dates (for example, the 31st becomes the last day of shorter months)
- Recurring schedules are included in JSON backups; older backups without schedules continue to restore

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
- **Export CSV** — all transactions in a spreadsheet-ready format
- **Backup JSON** — transactions, recurring schedules, and budget setting
- **Restore** — restore current and legacy backup files

### 🎨 Interface
- Dark/light theme toggle with correct label (