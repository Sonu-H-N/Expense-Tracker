require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./src/routes/auth.routes");
const transactionRoutes = require("./src/routes/transactions.routes");
const budgetRoutes = require("./src/routes/budget.routes");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("replace_this")) {
  console.error("FATAL: JWT_SECRET is not set (or still the placeholder) in your .env file.");
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(express.json({ limit: "150kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// API responses are never cacheable — this app's data changes on every write,
// and a stale GET served from a shared or browser cache would show the
// wrong balance/list right after an edit or delete.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);

app.use("/api", notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
  console.log(`Expense Tracker Pro API listening on http://localhost:${PORT}`);
});
