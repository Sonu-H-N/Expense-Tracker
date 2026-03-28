const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const list = document.getElementById("list");
const balance = document.getElementById("balance");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateUI() {
    list.innerHTML = "";
    let total = 0;

    transactions.forEach((t, index) => {
        total += Number(t.amount);

        const li = document.createElement("li");
        li.classList.add(t.amount > 0 ? "plus" : "minus");

        li.innerHTML = `
            ${t.text} (${t.category})
            <span>₹${t.amount}</span>
            <button onclick="deleteTransaction(${index})">❌</button>
        `;

        list.appendChild(li);
    });

    balance.innerText = total;
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

function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

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

let data = localStorage.getItem("financeData")

if(!data){
alert("No data to backup")
return
}

let blob = new Blob([data], { type: "application/json" })

let link = document.createElement("a")

link.href = URL.createObjectURL(blob)
link.download = "finance_backup.json"

link.click()

}
function importData(event){

let file = event.target.files[0]

if(!file) return

let reader = new FileReader()

reader.onload = function(e){

localStorage.setItem("financeData", e.target.result)

alert("Data restored successfully!")

loadHistory()
createMonthlyChart()
updateSummary()
createCategoryChart()
generateInsights()
generateCalendar()

}

reader.readAsText(file)

}