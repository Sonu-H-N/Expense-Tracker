const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const list = document.getElementById("list");
const balance = document.getElementById("balance");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateUI() {
    list.innerHTML = "";
    let total = 0;

    transactions.forEach((t, index) => {
        total += Number(t.amount);

        const li = document.createElement("li");
        li.innerHTML = `
            ${t.text} <span>₹${t.amount}</span>
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
        amount: amount.value
    });

    text.value = "";
    amount.value = "";

    updateUI();
});

function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

updateUI();