// src/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
const AUTH_USERNAME = process.env.AUTH_USERNAME || "SuperAdmin1";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "SuperAdmin1";

/**
 * POST /api/auth/login
 * body: { username, password }
 * returns: { ok: true, token, user }
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "username and password required" });
  }

  // Simple check - replace with DB for production
  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    const payload = { sub: username, name: username, role: "admin" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      ok: true,
      token,
      user: { username, name: username, role: "admin" },
    });
  }

  return res.status(401).json({ ok: false, message: "Invalid credentials" });
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 * returns: decoded token payload if valid
 */
router.get("/me", (req, res) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return res.status(401).json({ ok: false, message: "Missing token" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ ok: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
});

module.exports = router;
