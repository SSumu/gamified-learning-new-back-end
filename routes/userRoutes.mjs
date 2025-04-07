// routes/userRoutes.js
import express from "express";
import { getDb } from "../config/db.js";

const router = express.Router();

// Example route using the database
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
