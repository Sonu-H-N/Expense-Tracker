const express = require("express");
const { body } = require("express-validator");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { handleValidation } = require("../middleware/errorHandler");

const router = express.Router();
router.use(requireAuth);

router.put(
  "/",
  [body("monthly_budget").isFloat({ min: 0 }).withMessage("Enter a valid budget amount.")],
  handleValidation,
  (req, res, next) => {
    try {
      db.prepare("UPDATE users SET monthly_budget = ? WHERE id = ?").run(req.body.monthly_budget, req.user.id);
      res.json({ monthly_budget: req.body.monthly_budget });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
