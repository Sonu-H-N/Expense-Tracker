const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const list = document.getElementById("list");

const balance = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const budgetEl = document.getElementById("budget");
const remainingEl = document.getElementById("remaining");
const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudget");

const toggle = document.getElementById("toggle");
const searchInput = document.getElementById("search");

const downloadCSVBtn = document.getElementById("downloadCSV");
const backupDataBtn = document.getElementById("backupData");
const restoreFile = document.getElementById("restoreFile");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = parseFloat(localStorage.getItem("budget")) || 0;

let chart;

/* ---------------- UTIL ---------------- */

const generateID = () => Date.now();

function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2500);
}

/* ---------------- INIT ---------------- */

function init() {
    loadTheme();
    updateUI();
    updateChart();
}

function loadTheme() {
    const mode = localStorage.getItem("mode") || "light";
    if (mode === "dark") document.body.classList.add("dark");
}

/* ---------------- TRANSACTION ---------------- */

function addTransaction(e) {
    e.preventDefault();

    if (!text.value.trim() || !amount.value || !category.value) {
        showToast("⚠️ Fill all fields");
        return;
    }

    const transaction = {
        id: generateID(),
        text: text.value.trim(),
        amount: +amount.value,
        category: category.value,
        date: new Date().toLocaleDateString()
    };

    transactions.push(transaction);
    updateLocalStorage();
    updateUI();

    form.reset();
    showToast("✅ Transaction Added");
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    updateUI();
    showToast("❌ Transaction Deleted");
}

/* ---------------- UI ---------------- */

function updateUI() {
    list.innerHTML = "";

    let income = 0, expense = 0;

    transactions.forEach(t => {
        if (t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);

        const li = document.createElement("li");
        li.className = t.amount > 0 ? "plus" : "minus";

        li.innerHTML = `
            <div>
                <b>${t.text}</b><br>
                <small>${t.category} • ${t.date}</small>
            </div>
            <span>₹${Math.abs(t.amount)}</span>
            <button onclick="deleteTransaction(${t.id})">x</button>
        `;

        list.appendChild(li);
    });

    balance.innerText = `₹${(income - expense).toFixed(2)}`;
    incomeEl.innerText = `₹${income.toFixed(2)}`;
    expenseEl.innerText = `₹${expense.toFixed(2)}`;

    budgetEl.innerText = budget.toFixed(2);
    remainingEl.innerText = `₹${(budget - expense).toFixed(2)}`;

    updateChart();
}

/* ---------------- STORAGE ---------------- */

function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("budget", budget);
}

/* ---------------- BUDGET ---------------- */

setBudgetBtn.addEventListener("click", () => {
    const val = parseFloat(budgetInput.value);

    if (!val || val < 0) {
        showToast("⚠️ Invalid budget");
        return;
    }

    budget = val;
    updateLocalStorage();
    updateUI();
    budgetInput.value = "";

    showToast("💰 Budget Updated");
});

/* ---------------- SEARCH ---------------- */

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    document.querySelectorAll("#list li").forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(query) ? "" : "none";
    });
});

/* ---------------- THEME ---------------- */

toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const mode = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("mode", mode);

    showToast("🎨 Theme Changed");
});

/* ---------------- CSV EXPORT ---------------- */

downloadCSVBtn.addEventListener("click", () => {
    if (!transactions.length) {
        showToast("No data to export");
        return;
    }

    let csv = "Date,Description,Category,Amount,Type\n";

    transactions.forEach(t => {
        const type = t.amount > 0 ? "Income" : "Expense";
        csv += `${t.date},${t.text},${t.category},${Math.abs(t.amount)},${type}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
});

/* ---------------- BACKUP ---------------- */

backupDataBtn.addEventListener("click", () => {
    if (!transactions.length) {
        showToast("No data to backup");
        return;
    }

    const data = {
        transactions,
        budget,
        date: new Date()
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "backup.json";
    link.click();
});

/* ---------------- RESTORE ---------------- */

restoreFile.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            transactions = data.transactions || [];
            budget = data.budget || 0;

            updateLocalStorage();
            updateUI();

            showToast("✅ Data Restored");
        } catch {
            showToast("❌ Invalid file");
        }
    };

    reader.readAsText(file);
});

/* ---------------- CHART ---------------- */

function updateChart() {
    const map = {};

    transactions.forEach(t => {
        map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    });

    const ctx = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(map),
            datasets: [{
                data: Object.values(map),
                backgroundColor: [
                    "#6366f1", "#8b5cf6", "#ec4899",
                    "#f59e0b", "#10b981", "#06b6d4"
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

/* ---------------- EVENTS ---------------- */

form.addEventListener("submit", addTransaction);

/* ---------------- START ---------------- */

init();