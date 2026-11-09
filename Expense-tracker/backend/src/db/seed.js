/* eslint-disable no-console */
// Creates (or resets) a demo account so reviewers can log in immediately
// without registering. Safe to re-run.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./index");

const DEMO_EMAIL = "demo@expensetracker.app";
const DEMO_PASSWORD = "demo1234";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function run() {
  let user = db.prepare("SELECT id FROM users WHERE email = ?").get(DEMO_EMAIL);

  if (user) {
    db.prepare("DELETE FROM transactions WHERE user_id = ?").run(user.id);
    console.log(`Reset existing demo user (id=${user.id}).`);
  } else {
    const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 12);
    const info = db
      .prepare("INSERT INTO users (name, email, password_hash, monthly_budget) VALUES (?, ?, ?, ?)")
      .run("Demo User", DEMO_EMAIL, passwordHash, 15000);
    user = { id: info.lastInsertRowid };
    console.log(`Created demo user (id=${user.id}).`);
  }

  const insertTx = db.prepare(`
    INSERT INTO transactions (user_id, description, amount, type, category, occurred_on)
    VALUES (@user_id, @description, @amount, @type, @category, @occurred_on)
  `);

  const sample = [
    { description: "Monthly salary", amount: 65000, type: "income", category: "Salary", occurred_on: daysAgo(88) },
    { description: "Freelance project", amount: 9000, type: "income", category: "Salary", occurred_on: daysAgo(60) },
    { description: "Monthly salary", amount: 65000, type: "income", category: "Salary", occurred_on: daysAgo(58) },
    { description: "Monthly salary", amount: 65000, type: "income", category: "Salary", occurred_on: daysAgo(28) },
    { description: "Grocery shopping", amount: 3200, type: "expense", category: "Food", occurred_on: daysAgo(85) },
    { description: "Dinner out", amount: 1450, type: "expense", category: "Food", occurred_on: daysAgo(52) },
    { description: "Groceries", amount: 2800, type: "expense", category: "Food", occurred_on: daysAgo(20) },
    { description: "Lunch with team", amount: 900, type: "expense", category: "Food", occurred_on: daysAgo(3) },
    { description: "Flight tickets", amount: 8200, type: "expense", category: "Travel", occurred_on: daysAgo(70) },
    { description: "Cab rides", amount: 650, type: "expense", category: "Travel", occurred_on: daysAgo(10) },
    { description: "Electricity bill", amount: 2100, type: "expense", category: "Bills", occurred_on: daysAgo(55) },
    { description: "Internet bill", amount: 999, type: "expense", category: "Bills", occurred_on: daysAgo(25) },
    { description: "Phone bill", amount: 599, type: "expense", category: "Bills", occurred_on: daysAgo(2) },
    { description: "New headphones", amount: 3500, type: "expense", category: "Shopping", occurred_on: daysAgo(45) },
    { description: "Clothes shopping", amount: 2800, type: "expense", category: "Shopping", occurred_on: daysAgo(15) },
    { description: "Movie night", amount: 800, type: "expense", category: "Entertainment", occurred_on: daysAgo(18) },
    { description: "Streaming subscription", amount: 499, type: "expense", category: "Entertainment", occurred_on: daysAgo(5) },
    { description: "Gym membership", amount: 1200, type: "expense", category: "Health", occurred_on: daysAgo(27) },
    { description: "Pharmacy", amount: 450, type: "expense", category: "Health", occurred_on: daysAgo(6) },
    { description: "Book purchase", amount: 599, type: "expense", category: "Other", occurred_on: daysAgo(1) },
  ];

  for (const t of sample) insertTx.run({ user_id: user.id, ...t });

  console.log(`Seeded ${sample.length} transactions and a ₹15,000 monthly budget.`);
  console.log(`\nDemo login:\n  Email:    ${DEMO_EMAIL}\n  Password: ${DEMO_PASSWORD}`);
}

run();
