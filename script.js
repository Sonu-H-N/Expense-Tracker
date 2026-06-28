/* ==========================================================
   Expense Tracker Pro — App Logic
   ========================================================== */

/* ── DOM REFS ── */
const form        = document.getElementById("form");
const textInput   = document.getElementById("text");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput   = document.getElementById("date");
const list        = document.getElementById("list");

const balanceEl   = document.getElementById("balance");
const incomeEl    = document.getElementById("income");
const expenseEl   = document.getElementById("expense");

const budgetEl    = document.getElementById("budget");
const budgetSpent = document.getElementById("budgetSpent");
const remainingEl = document.getElementById("remaining");
const budgetBar   = document.getElementById("budgetBar");
const budgetStatus= document.getElementById("budgetStatus");
const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn= document.getElementById("setBudget");

const toggle        = document.getElementById("toggle");
const toggleIcon    = document.getElementById("toggleIcon");
const toggleText    = document.getElementById("toggleText");
const searchInput   = document.getElementById("search");

const downloadCSVBtn = document.getElementById("downloadCSV");
const backupDataBtn  = document.getElementById("backupData");
const restoreFile    = document.getElementById("restoreFile");

const chartCanvas  = document.getElementById("chart");
const chartEmptyEl = document.getElementById("chartEmpty");

/* ── STATE ── */
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = parseFloat(localStorage.getItem("budget")) || 0;
let chart;

/* ── FORMAT ── */
function formatAmount(n) {
    return "₹" + Math.abs(n).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* ── TOAST ── */
function showToast(msg) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.4s ease";
        setTimeout(() => toast.remove(), 400);
    }, 2200);
}

/* ── INIT ── */
function init() {
    loadTheme();
    setDefaultDate();
    updateUI();
}

function loadTheme() {
    if (localStorage.getItem("mode") === "dark") {
        document.body.classList.add("dark");
        toggleIcon.textContent = "☀️";
        toggleText.textContent = "Light Mode";
    }
}

function setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
}

/* ── ADD TRANSACTION ── */
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const desc   = textInput.value.trim();
    const amt    = parseFloat(amountInput.value);
    const cat    = categoryInput.value;
    const txDate = dateInput.value;

    if (!desc || isNaN(amt) || !cat || !txDate) {
        showToast("⚠️ Please fill all fields");
        return;
    }

    if (amt === 0) {
        showToast("⚠️ Amount cannot be zero");
        return;
    }

    const transaction = {
        id:       Date.now(),
        text:     desc,
        amount:   amt,
        category: cat,
        date:     new Date(txDate + "T00:00:00").toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric"
                  })
    };

    transactions.push(transaction);
    saveToStorage();
    updateUI();
    form.reset();
    setDefaultDate();
    showToast("✅ Transaction added");
});

/* ── DELETE TRANSACTION ── */
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToStorage();
    updateUI();
    showToast("🗑️ Transaction deleted");
}

/* ── STORAGE ── */
function saveToStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("budget", budget);
}

/* ── UPDATE UI ── */
function updateUI() {
    renderList(transactions);
    updateSummary();
    updateBudget();
    updateChart();
}

function renderList(txns) {
    list.innerHTML = "";

    if (txns.length === 0) {
        list.innerHTML = '<li class="empty-state">No transactions yet — add your first one above.</li>';
        return;
    }

    // Newest first
    const sorted = [...txns].sort((a, b) => b.id - a.id);

    sorted.forEach(t => {
        const li = document.createElement("li");
        li.className = "tx-item " + (t.amount > 0 ? "plus" : "minus");
        li.dataset.id = t.id;

        const sign = t.amount > 0 ? "+" : "−";
        li.innerHTML = `
            <div class="tx-info">
                <div class="tx-desc">${escapeHtml(t.text)}</div>
                <div class="tx-meta">${escapeHtml(t.category)} · ${escapeHtml(t.date)}</div>
            </div>
            <span class="tx-amount">${sign}${formatAmount(t.amount)}</span>
            <button class="tx-delete" onclick="deleteTransaction(${t.id})" title="Delete">✕</button>
        `;

        list.appendChild(li);
    });
}

function updateSummary() {
    let income = 0, expense = 0;

    transactions.forEach(t => {
        if (t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);
    });

    const bal = income - expense;

    balanceEl.textContent = formatAmount(bal);
    incomeEl.textContent  = formatAmount(income);
    expenseEl.textContent = formatAmount(expense);
}

function updateBudget() {
    let expense = 0;
    transactions.forEach(t => {
        if (t.amount < 0) expense += Math.abs(t.amount);
    });

    const remaining = budget - expense;
    const pct = budget > 0 ? Math.min((expense / budget) * 100, 100) : 0;

    budgetEl.textContent    = budget.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    budgetSpent.textContent = formatAmount(expense);
    remainingEl.textContent = formatAmount(remaining);

    // Color-code remaining
    remainingEl.className = "budget-value " + (remaining < 0 ? "over-budget" : "on-budget");

    // Budget bar
    budgetBar.style.width = pct + "%";
    budgetBar.style.background = pct >= 90 ? "var(--danger)" :
                                  pct >= 70 ? "var(--warning)" : "var(--success)";

    // Status message
    if (budget === 0) {
        budgetStatus.textContent = "Set a monthly budget to track your spending";
        budgetStatus.style.color = "";
    } else if (remaining < 0) {
        budgetStatus.textContent = `⚠️ Over budget by ${formatAmount(Math.abs(remaining))}`;
        budgetStatus.style.color = "var(--danger)";
    } else if (pct >= 90) {
        budgetStatus.textContent = `🔴 ${Math.round(pct)}% spent — almost at limit`;
        budgetStatus.style.color = "var(--danger)";
    } else if (pct >= 70) {
        budgetStatus.textContent = `🟡 ${Math.round(pct)}% spent — watch your spending`;
        budgetStatus.style.color = "var(--warning)";
    } else {
        budgetStatus.textContent = `🟢 ${Math.round(pct)}% spent — on track`;
        budgetStatus.style.color = "var(--success)";
    }
}

/* ── CHART (expenses only) ── */
function updateChart() {
    const expenseMap = {};

    transactions.forEach(t => {
        if (t.amount < 0) {
            expenseMap[t.category] = (expenseMap[t.category] || 0) + Math.abs(t.amount);
        }
    });

    const hasData = Object.keys(expenseMap).length > 0;

    chartCanvas.style.display  = hasData ? "block" : "none";
    chartEmptyEl.style.display = hasData ? "none"  : "block";

    if (!hasData) {
        if (chart) { chart.destroy(); chart = null; }
        return;
    }

    const isDark = document.body.classList.contains("dark");

    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(expenseMap),
            datasets: [{
                data: Object.values(expenseMap),
                backgroundColor: [
                    "#6366f1", "#8b5cf6", "#ec4899",
                    "#f59e0b", "#10b981", "#06b6d4",
                    "#f97316", "#84cc16"
                ],
                borderWidth: 2,
                borderColor: isDark ? "#1e293b" : "#ffffff"
            }]
        },
        options: {
            cutout: "65%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: isDark ? "#f1f5f9" : "#0f172a",
                        font: { size: 12 },
                        padding: 14,
                        boxWidth: 12
                    }
                }
            }
        }
    });
}

/* ── SET BUDGET ── */
setBudgetBtn.addEventListener("click", () => {
    const val = parseFloat(budgetInput.value);

    if (!budgetInput.value || isNaN(val) || val < 0) {
        showToast("⚠️ Enter a valid budget");
        return;
    }

    budget = val;
    saveToStorage();
    updateBudget();
    budgetInput.value = "";
    showToast("💰 Budget updated");
});

/* ── SEARCH ── */
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        renderList(transactions);
        return;
    }

    const filtered = transactions.filter(t =>
        t.text.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.date.toLowerCase().includes(query)
    );

    renderList(filtered);
});

/* ── THEME ── */
toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("mode", isDark ? "dark" : "light");

    toggleIcon.textContent = isDark ? "☀️" : "🌙";
    toggleText.textContent = isDark ? "Light Mode" : "Dark Mode";

    // Re-render chart with correct legend color
    updateChart();
    showToast(isDark ? "🌙 Dark mode" : "☀️ Light mode");
});

/* ── CSV EXPORT ── */
downloadCSVBtn.addEventListener("click", () => {
    if (!transactions.length) {
        showToast("No transactions to export");
        return;
    }

    let csv = "Date,Description,Category,Amount,Type\n";

    const sorted = [...transactions].sort((a, b) => b.id - a.id);
    sorted.forEach(t => {
        const type = t.amount > 0 ? "Income" : "Expense";
        // Quote fields that may contain commas
        csv += `"${t.date}","${t.text}","${t.category}",${Math.abs(t.amount)},${type}\n`;
    });

    triggerDownload(csv, "text/csv", "transactions.csv");
    showToast("📥 CSV downloaded");
});

/* ── BACKUP ── */
backupDataBtn.addEventListener("click", () => {
    if (!transactions.length) {
        showToast("No data to backup");
        return;
    }

    const data = JSON.stringify({ transactions, budget, date: new Date() }, null, 2);
    triggerDownload(data, "application/json", "expense-tracker-backup.json");
    showToast("💾 Backup saved");
});

/* ── RESTORE ── */
restoreFile.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const data = JSON.parse(ev.target.result);

            if (!Array.isArray(data.transactions)) throw new Error("Invalid format");

            transactions = data.transactions;
            budget = parseFloat(data.budget) || 0;

            saveToStorage();
            updateUI();
            showToast("✅ Data restored from backup");
        } catch {
            showToast("❌ Invalid backup file");
        }
    };
    reader.readAsText(file);

    // Reset so same file can be re-selected if needed
    restoreFile.value = "";
});

/* ── HELPERS ── */
function triggerDownload(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
}

/* ── START ── */
init();
