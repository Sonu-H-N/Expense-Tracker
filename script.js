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
const searchInput = document.getElementById("search");
const backupDataBtn = document.getElementById("backupData");
const restoreFile = document.getElementById("restoreFile");
const toggle = document.getElementById("toggle");
const downloadCSVBtn = document.getElementById("downloadCSV");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = parseFloat(localStorage.getItem("budget")) || 0;

function init() {
    loadTheme();
    updateUI();
    updateChart();
}

function loadTheme() {
    const savedTheme = localStorage.getItem("mode") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme === "dark" ? "dark" : "light");
    updateThemeToggleButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("mode", newTheme);
    updateThemeToggleButton(newTheme);
    updateChart();
}

function updateThemeToggleButton(theme) {
    const toggleIcon = document.querySelector(".toggle-icon");
    const toggleText = document.querySelector(".toggle-text");
    if (theme === "dark") {
        toggleIcon.textContent = "☀️";
        toggleText.textContent = "Light Mode";
    } else {
        toggleIcon.textContent = "🌙";
        toggleText.textContent = "Dark Mode";
    }
}

function updateUI() {
    list.innerHTML = "";
    let income = 0;
    let expense = 0;

    transactions.forEach((t, index) => {
        const amt = parseFloat(t.amount);
        if (amt > 0) {
            income += amt;
        } else {
            expense += Math.abs(amt);
        }

        const li = document.createElement("li");
        li.className = amt > 0 ? "plus" : "minus";

        const sign = amt > 0 ? "+" : "";
        li.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">${t.text}</div>
                <div class="transaction-category">${t.category}</div>
            </div>
            <span class="transaction-amount ${amt > 0 ? 'plus' : 'minus'}">
                ${sign}₹${Math.abs(amt).toFixed(2)}
            </span>
            <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
        `;

        list.appendChild(li);
    });

    const totalBalance = income - expense;
    balance.textContent = `₹${totalBalance.toFixed(2)}`;
    incomeEl.textContent = `₹${income.toFixed(2)}`;
    expenseEl.textContent = `₹${expense.toFixed(2)}`;
    budgetEl.textContent = budget.toFixed(2);

    const remainingBudget = budget - expense;
    const percentage = budget > 0 ? ((remainingBudget / budget) * 100).toFixed(1) : 0;

    if (budget > 0) {
        remainingEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 500; color: var(--text-secondary);">Remaining</span>
                <span style="font-size: 1.25rem; font-weight: 700; color: ${remainingBudget >= 0 ? 'var(--success-color)' : 'var(--expense-color)'};">
                    ₹${remainingBudget.toFixed(2)} (${percentage}%)
                </span>
            </div>
        `;
    } else {
        remainingEl.innerHTML = '<span style="color: var(--text-secondary);">Set a budget to track spending</span>';
    }

    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function deleteTransaction(index) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions.splice(index, 1);
        updateUI();
        updateChart();
    }
}

form.addEventListener("submit", e => {
    e.preventDefault();

    if (!text.value.trim() || !amount.value || !category.value) {
        alert("Please fill in all fields");
        return;
    }

    transactions.push({
        text: text.value.trim(),
        amount: parseFloat(amount.value),
        category: category.value
    });

    text.value = "";
    amount.value = "";
    category.value = "";

    updateUI();
    updateChart();
});

setBudgetBtn.addEventListener("click", () => {
    const newBudget = parseFloat(budgetInput.value);
    if (newBudget && newBudget >= 0) {
        budget = newBudget;
        localStorage.setItem("budget", budget);
        updateUI();
        budgetInput.value = "";
    } else {
        alert("Please enter a valid budget amount");
    }
});

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const items = list.querySelectorAll("li");
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? "" : "none";
    });
});

toggle.addEventListener("click", toggleTheme);

downloadCSVBtn.addEventListener("click", () => {
    if (transactions.length === 0) {
        alert("No transactions to export");
        return;
    }

    let csv = "Date,Description,Category,Amount,Type\n";
    transactions.forEach(t => {
        const type = t.amount > 0 ? "Income" : "Expense";
        csv += `${new Date().toLocaleDateString()},${t.text},${t.category},${Math.abs(t.amount)},${type}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
});

backupDataBtn.addEventListener("click", () => {
    const data = localStorage.getItem("transactions");
    if (!data || transactions.length === 0) {
        alert("No data to backup");
        return;
    }

    const backup = {
        transactions,
        budget,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
});

restoreFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (confirm("This will replace all current data. Continue?")) {
                transactions = backup.transactions || backup;
                budget = backup.budget || 0;
                
                localStorage.setItem("transactions", JSON.stringify(transactions));
                localStorage.setItem("budget", budget);
                
                updateUI();
                updateChart();
                alert("Data restored successfully!");
            }
        } catch (error) {
            alert("Invalid file format. Please select a valid backup file.");
        }
    };
    reader.readAsText(file);
});

let chart;

function updateChart() {
    const categoryTotals = {};

    transactions.forEach(t => {
        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += Math.abs(parseFloat(t.amount));
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById("chart").getContext("2d");
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#cbd5e1" : "#64748b";

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: { 
                        color: textColor,
                        padding: 12,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

init();