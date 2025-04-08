import express from "express";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getUser,
} from "../controllers/userController.mjs";

const router = express.Router();

router.get("/", getUsers);
router.post("/", addUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
