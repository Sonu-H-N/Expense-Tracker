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
const recurringList = document.getElementById("recurringList");
const isRecurringInput = document.getElementById("isRecurring");
const recurringOptions = document.getElementById("recurringOptions");
const recurringFrequencyInput = document.getElementById("recurringFrequency");
const recurringEndDateInput = document.getElementById("recurringEndDate");

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
let transactions = readArray("transactions");
let recurringTransactions = readArray("recurringTransactions");
let budget = parseFloat(localStorage.getItem("budget")) || 0;
let chart;

function readArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

/* ── FORMAT ── */
function formatAmount(n) {
    return "₹" + Math.abs(n).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getTodayISO() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function formatISODate(isoDate) {
    return new Date(isoDate + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric"
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
    processDueRecurringTransactions();
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
    dateInput.value = getTodayISO();
}

/* ── ADD TRANSACTION / SCHEDULE ── */
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const desc   = textInput.value.trim();
    const amt    = parseFloat(amountInput.value);
    const cat    = categoryInput.value;
    const txDate = dateInput.value;
    const endDate = recurringEndDateInput.value;

    if (!desc || !Number.isFinite(amt) || !cat || !txDate) {
        showToast("⚠️ Please fill all fields");
        return;
    }

    if (amt === 0) {
        showToast("⚠️ Amount cannot be zero");
        return;
    }

    if (isRecurringInput.checked && endDate && endDate < txDate) {
        showToast("⚠️ End date must be on or after the start date");
        return;
    }

    if (isRecurringInput.checked) {
        recurringTransactions.push({
            id: createId(recurringTransactions),
            text: desc,
            amount: amt,
            category: cat,
            frequency: recurringFrequencyInput.value,
            nextDate: txDate,
            endDate: endDate || null,
            anchorDay: Number(txDate.slice(8, 10)),
            active: true
        });
        processDueRecurringTransactions();
        showToast("✅ Recurring transaction scheduled");
    } else {
        transactions.push({
            id: createId(transactions),
            text: desc,
            amount: amt,
            category: cat,
            date: formatISODate(txDate)
        });
        saveToStorage();
        showToast("✅ Transaction added");
    }

    updateUI();
    form.reset();
    recurringOptions.hidden = true;
    setDefaultDate();
});

function createId(items) {
    let id = Date.now();
    while (items.some(item => String(item.id) === String(id))) id += 1;
    return id;
}

/* ── RECURRING SCHEDULES ── */
function nextOccurrence(dateString, frequency, anchorDay) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (frequency === "weekly") {
        date.setUTCDate(date.getUTCDate() + 7);
    } else if (frequency === "monthly") {
        const nextMonth = date.getUTCMonth() + 1;
        const nextYear = date.getUTCFullYear() + Math.floor(nextMonth / 12);
        const normalizedMonth = nextMonth % 12;
        const lastDay = new Date(Date.UTC(nextYear, normalizedMonth + 1, 0)).getUTCDate();
        date.setUTCFullYear(nextYear, normalizedMonth, Math.min(anchorDay || day, lastDay));
    } else {
        const nextYear = date.getUTCFullYear() + 1;
        const lastDay = new Date(Date.UTC(nextYear, date.getUTCMonth() + 1, 0)).getUTCDate();
        date.setUTCFullYear(nextYear, date.getUTCMonth(), Math.min(day, lastDay));
    }

    return date.toISOString().slice(0, 10);
}

function processDueRecurringTransactions() {
    const today = getTodayISO();
    let changed = false;

    recurringTransactions.forEach(schedule => {
        if (!schedule.active || !schedule.nextDate) return;

        let occurrences = 0;
        while (schedule.nextDate <= today && (!schedule.endDate || schedule.nextDate <= schedule.endDate)) {
            // The marker makes processing safe to repeat after reloads or backup restores.
            const alreadyAdded = transactions.some(tx =>
                String(tx.recurringId) === String(schedule.id) && tx.recurringDate === schedule.nextDate
            );
            if (!alreadyAdded) {
                transactions.push({
                    id: createId(transactions),
                    text: schedule.text,
                    amount: Number(schedule.amount),
                    category: schedule.category,
                    date: formatISODate(schedule.nextDate),
                    recurringId: schedule.id,
                    recurringDate: schedule.nextDate
                });
            }

            schedule.nextDate = nextOccurrence(schedule.nextDate, schedule.frequency, schedule.anchorDay);
            changed = true;
            occurrences += 1;
            // Protect against malformed legacy data causing an unbounded loop.
            if (occurrences > 5000) {
                schedule.active = false;
                break;
            }
        }

        if (schedule.endDate && schedule.nextDate > schedule.endDate) {
            schedule.active = false;
            changed = true;
        }
    });

    if (changed) saveToStorage();
}

function toggleRecurringSchedule(id) {
    const schedule = recurringTransactions.find(item => String(item.id) === String(id));
    if (!schedule) return;
    schedule.active = !schedule.active;
    saveToStorage();
    renderRecurringList();
    showToast(schedule.active ? "▶️ Schedule resumed" : "⏸️ Schedule paused");
}

function deleteRecurringSchedule(id) {
    recurringTransactions = recurringTransactions.filter(item => String(item.id) !== String(id));
    saveToStorage();
    renderRecurringList();
    showToast("🗑️ Recurring schedule deleted");
}

function renderRecurringList() {
    recurringList.innerHTML = "";
    if (!recurringTransactions.length) {
        recurringList.innerHTML = '<li class="empty-state">No recurring transactions yet.</li>';
        return;
    }

    recurringTransactions.forEach(schedule => {
        const li = document.createElement("li");
        li.className = "recurring-item";
        const frequency = schedule.frequency ? schedule.frequency[0].toUpperCase() + schedule.frequency.slice(1) : "Monthly";
        const nextDate = schedule.nextDate ? formatISODate(schedule.nextDate) : "Complete";
        const status = schedule.active ? "Active" : "Paused";
        const sign = Number(schedule.amount) > 0 ? "+" : "−";
        li.innerHTML = `
            <div class="tx-info">
                <div class="tx-desc">${escapeHtml(schedule.text || "Untitled")}</div>
                <div class="tx-meta">${escapeHtml(schedule.category || "Other")} · ${escapeHtml(frequency)} · Next: ${escapeHtml(nextDate)} · ${status}</div>
            </div>
            <span class="tx-amount ${Number(schedule.amount) > 0 ? "income-text" : "expense-text"}">${sign}${formatAmount(Number(schedule.amount) || 0)}</span>
            <button class="schedule-action" type="button" data-action="toggle" data-id="${escapeHtml(String(schedule.id))}" aria-label="${schedule.active ? "Pause" : "Resume"} schedule">${schedule.active ? "⏸" : "▶"}</button>
            <button class="tx-delete" type="button" data-action="delete" data-id="${escapeHtml(String(schedule.id))}" aria-label="Delete recurring schedule">✕</button>
        `;
        recurringList.appendChild(li);
    });
}

recurringList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "toggle") toggleRecurringSchedule(button.dataset.id);
    if (button.dataset.action === "delete") deleteRecurringSchedule(button.dataset.id);
});

isRecurringInput.addEventListener("change", () => {
    recurringOptions.hidden = !isRecurringInput.checked;
    recurringEndDateInput.required = false;
});

/* ── DELETE TRANSACTION ── */
function deleteTransaction(id) {
    transactions = transactions.filter(t => String(t.id) !== String(id));
    saveToStorage();
    updateUI();
    showToast("🗑️ Transaction deleted");
}

/* ── STORAGE ── */
function saveToStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("recurringTransactions", JSON.stringify(recurringTransactions));
    localStorage.setItem("budget", budget);
}

/* ── UPDATE UI ── */
function updateUI() {
    renderList(transactions);
    renderRecurringList();
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

    const sorted = [...txns].sort((a, b) => b.id - a.id);

    sorted.forEach(t => {
        const li = document.createElement("li");
        li.className = "tx-item " + (t.amount > 0 ? "plus" : "minus");
        li.dataset.id = t.id;

        const sign = t.amount > 0 ? "+" : "−";
        const recurringLabel = t.recurringId ? " · 🔁 Recurring" : "";
        li.innerHTML = `
            <div class="tx-info">
                <div class="tx-desc">${escapeHtml(t.text)}</div>
                <div class="tx-meta">${escapeHtml(t.category)} · ${escapeHtml(t.date)}${recurringLabel}</div>
            </div>
            <span class="tx-amount">${sign}${formatAmount(t.amount)}</span>
            <button class="tx-delete" onclick="deleteTransaction('${escapeHtml(String(t.id))}')" title="Delete" aria-label="Delete transaction">✕</button>
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

    remainingEl.className = "budget-value " + (remaining < 0 ? "over-budget" : "on-budget");
    budgetBar.style.width = pct + "%";
    budgetBar.style.background = pct >= 90 ? "var(--danger)" :
                                  pct >= 70 ? "var(--warning)" : "var(--success)";

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

    if (!budgetInput.value || !Number.isFinite(val) || val < 0) {
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
        t.date.toLowerCase().includes(query) ||
        (t.recurringId && "recurring".includes(query))
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
        const quote = value => `"${String(value).replace(/"/g, '""')}"`;
        csv += `${quote(t.date)},${quote(t.text)},${quote(t.category)},${Math.abs(t.amount)},${type}\n`;
    });

    triggerDownload(csv, "text/csv", "transactions.csv");
    showToast("📥 CSV downloaded");
});

/* ── BACKUP ── */
backupDataBtn.addEventListener("click", () => {
    if (!transactions.length && !recurringTransactions.length) {
        showToast("No data to backup");
        return;
    }

    const data = JSON.stringify({ transactions, recurringTransactions, budget, date: new Date() }, null, 2);
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
            recurringTransactions = Array.isArray(data.recurringTransactions) ? data.recurringTransactions : [];
            budget = parseFloat(data.budget) || 0;

            processDueRecurringTransactions();
            saveToStorage();
            updateUI();
            showToast("✅ Data restored from backup");
        } catch {
            showToast("❌ Invalid backup file");
        }
    };
    reader.readAsText(file);
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
