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

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = parseFloat(localStorage.getItem("budget")) || 0;

function updateUI() {
    list.innerHTML = "";
    let income = 0;
    let expense = 0;

    transactions.forEach((t, index) => {
        const amt = Number(t.amount);
        if (amt > 0) {
            income += amt;
        } else {
            expense += Math.abs(amt);
        }

        const li = document.createElement("li");
        li.classList.add(amt > 0 ? "plus" : "minus");

        li.innerHTML = `
            ${t.text} (${t.category})
            <span>₹${amt}</span>
            <button onclick="deleteTransaction(${index})">❌</button>
        `;

        list.appendChild(li);
    });

    balance.innerText = income - expense;
    incomeEl.innerText = income;
    expenseEl.innerText = expense;
    budgetEl.innerText = budget;
    remainingEl.innerText = budget - expense;
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

form.addEventListener("submit", e => {
    e.preventDefault();

    transactions.push({
        text: text.value,
        amount: amount.value,
        category: category.value
    });

    text.value = "";
    amount.value = "";
    category.value = "";

    updateUI();
});

setBudgetBtn.addEventListener("click", () => {
    const newBudget = parseFloat(budgetInput.value);
    if (newBudget >= 0) {
        budget = newBudget;
        localStorage.setItem("budget", budget);
        updateUI();
        budgetInput.value = "";
    }
});

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const lis = list.querySelectorAll("li");
    lis.forEach(li => {
        const text = li.textContent.toLowerCase();
        li.style.display = text.includes(query) ? "" : "none";
    });
});

const downloadCSVBtn = document.getElementById("downloadCSV");

downloadCSVBtn.addEventListener("click", () => {
    let csv = "Description,Category,Amount\n";
    transactions.forEach(t => {
        csv += `${t.text},${t.category},${t.amount}\n`;
    });
    let blob = new Blob([csv], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
});

updateUI();
let chart;

function updateChart() {
    const categoryTotals = {};

    transactions.forEach(t => {
        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += Math.abs(t.amount);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById("chart").getContext("2d");

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        }
    });
}
updateChart();
const toggle = document.getElementById("toggle");

// Load saved mode
if (localStorage.getItem("mode") === "dark") {
    document.body.classList.add("dark");
}

toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("mode", "dark");
        toggle.innerText = "☀️ Light Mode";
    } else {
        localStorage.setItem("mode", "light");
        toggle.innerText = "🌙 Dark Mode";
    }
});
if (document.body.classList.contains("dark")) {
    toggle.innerText = "☀️ Light Mode";
}
function exportData(){
    let data = localStorage.getItem("transactions");
    if(!data){
        alert("No data to backup");
        return;
    }
    let blob = new Blob([data], { type: "application/json" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "finance_backup.json";
    link.click();
}
function importData(event){
    let file = event.target.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = function(e){
        try {
            let data = JSON.parse(e.target.result);
            localStorage.setItem("transactions", JSON.stringify(data));
            transactions = data;
            updateUI();
            updateChart();
            alert("Data restored successfully!");
        } catch (error) {
            alert("Invalid file format");
        }
    };
    reader.readAsText(file);
}