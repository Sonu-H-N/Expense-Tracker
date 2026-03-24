let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {}
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
updateBudget()
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
updateMonthlyChart()

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
const toggleBtn = document.getElementById("toggleTheme")

toggleBtn.addEventListener("click",()=>{

document.body.classList.toggle("dark")

})
const search = document.getElementById("search")

search.addEventListener("keyup", filterTransactions)

function filterTransactions(){

const textValue = search.value.toLowerCase()

const items = list.getElementsByTagName("li")

Array.from(items).forEach(function(item){

const text = item.textContent.toLowerCase()

if(text.indexOf(textValue) != -1){

item.style.display = "flex"

}else{

item.style.display = "none"

}

})

}
const downloadBtn = document.getElementById("downloadCSV")

downloadBtn.addEventListener("click", downloadCSV)

function downloadCSV(){

let csv = "Description,Category,Amount\n"

transactions.forEach(t => {

csv += `${t.text},${t.category},${t.amount}\n`

})

const blob = new Blob([csv], { type: "text/csv" })

const url = window.URL.createObjectURL(blob)

const a = document.createElement("a")

a.setAttribute("href", url)

a.setAttribute("download", "expense-report.csv")

a.click()

}
function updateMonthlyChart(){

const ctx = document.getElementById("monthlyChart")

const months = {}

transactions.forEach(t => {

const date = new Date(t.id)

const month = date.toLocaleString('default', { month: 'short' })

if(!months[month]){
months[month] = 0
}

if(t.amount < 0){
months[month] += Math.abs(t.amount)
}

})

const labels = Object.keys(months)
const data = Object.values(months)

new Chart(ctx,{

type:'bar',

data:{
labels:labels,
datasets:[{
label:'Monthly Expenses',
data:data
}]
}

})

}
const budgetInput = document.getElementById("budgetInput")
const setBudgetBtn = document.getElementById("setBudget")
const budgetDisplay = document.getElementById("budget")
const remainingDisplay = document.getElementById("remaining")

let budget = localStorage.getItem("budget") || 0

budgetDisplay.innerText = budget

setBudgetBtn.addEventListener("click", () => {

budget = budgetInput.value

localStorage.setItem("budget", budget)

budgetDisplay.innerText = budget

updateBudget()

})
function updateBudget(){

const totalExpense = transactions
.filter(t => t.amount < 0)
.reduce((acc,t)=>acc + Math.abs(t.amount),0)

const remaining = budget - totalExpense

remainingDisplay.innerText = `Remaining: ₹${remaining}`

if(remaining < 0){
remainingDisplay.style.color = "red"
remainingDisplay.innerText += " ⚠️ Budget Exceeded!"
}else{
remainingDisplay.style.color = "lightgreen"
}

}
const backupBtn = document.getElementById("backupData")

backupBtn.addEventListener("click", backupData)

function backupData(){

const data = JSON.stringify(transactions)

const blob = new Blob([data], { type: "application/json" })

const url = URL.createObjectURL(blob)

const a = document.createElement("a")

a.href = url
a.download = "expense-backup.json"

a.click()

}
const restoreFile = document.getElementById("restoreFile")

restoreFile.addEventListener("change", restoreData)

function restoreData(e){

const file = e.target.files[0]

const reader = new FileReader()

reader.onload = function(event){

transactions = JSON.parse(event.target.result)

localStorage.setItem("transactions", JSON.stringify(transactions))

init()
updateCategoryBudget()

}

reader.readAsText(file)

}
const budgetCategory = document.getElementById("budgetCategory")
const categoryBudgetInput = document.getElementById("categoryBudgetInput")
const setCategoryBudgetBtn = document.getElementById("setCategoryBudget")

setCategoryBudgetBtn.addEventListener("click", () => {

const category = budgetCategory.value
const amount = categoryBudgetInput.value

categoryBudgets[category] = amount

localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets))

alert("Category budget set!")

updateCategoryBudget()

})
function updateCategoryBudget(){

const spent = {}

transactions.forEach(t => {

if(t.amount < 0){

if(!spent[t.category]){
spent[t.category] = 0
}

spent[t.category] += Math.abs(t.amount)

}

})

for(let cat in categoryBudgets){

if(spent[cat] > categoryBudgets[cat]){

alert(`⚠️ Budget exceeded for ${cat}!`)

}

}

}
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js")
}