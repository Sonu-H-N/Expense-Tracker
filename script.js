const balance = document.getElementById("balance")
const income = document.getElementById("income")
const expense = document.getElementById("expense")
const list = document.getElementById("list")
const form = document.getElementById("form")
const text = document.getElementById("text")
const amount = document.getElementById("amount")
const category = document.getElementById("category")

let transactions = JSON.parse(localStorage.getItem("transactions")) || []

function updateValues(){

const amounts = transactions.map(t => t.amount)

const total = amounts.reduce((acc,item)=>acc+item,0)

const inc = amounts
.filter(item => item > 0)
.reduce((acc,item)=>acc+item,0)

const exp = amounts
.filter(item => item < 0)
.reduce((acc,item)=>acc+item,0)

balance.innerText = `₹${total}`
income.innerText = `₹${inc}`
expense.innerText = `₹${Math.abs(exp)}`
}

function addTransactionDOM(transaction){

const item = document.createElement("li")

item.innerHTML = `
${transaction.text} (${transaction.category})
<span>₹${transaction.amount}</span>

<button onclick="editTransaction(${transaction.id})">✏️</button>

<button onclick="removeTransaction(${transaction.id})">❌</button>
`

list.appendChild(item)

}

function removeTransaction(id){

transactions = transactions.filter(t => t.id !== id)

localStorage.setItem("transactions",JSON.stringify(transactions))

init()
}
function editTransaction(id){

const transaction = transactions.find(t => t.id === id)

text.value = transaction.text
amount.value = transaction.amount
category.value = transaction.category

removeTransaction(id)

}

function addTransaction(e){

e.preventDefault()

const transaction = {
id:Date.now(),
text:text.value,
amount:+amount.value,
category:category.value
}

transactions.push(transaction)

localStorage.setItem("transactions",JSON.stringify(transactions))

init()

text.value=""
amount.value=""
}

function init(){

list.innerHTML=""

transactions.forEach(addTransactionDOM)

updateValues()
}

form.addEventListener("submit",addTransaction)

init()
updateChart()
function updateChart(){

const ctx = document.getElementById("expenseChart")

const categories = {}
  
transactions.forEach(t=>{
  
if(!categories[t.category]){
categories[t.category] = 0
}

categories[t.category] += Math.abs(t.amount)

})

const labels = Object.keys(categories)
const data = Object.values(categories)

new Chart(ctx,{
type:'pie',

data:{
labels:labels,
datasets:[{
label:'Expenses',
data:data
}]
}

})
}