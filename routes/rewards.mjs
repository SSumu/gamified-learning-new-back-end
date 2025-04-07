import express from "express";
import Reward from "../models/Reward.mjs";

const router = express.Router();

// Get all rewards
router.get("/", async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json(rewards);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rewards",
      error: err.message,
    });
  }
});

// Get single reward
router.get("/:id", async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }
    res.json({
      success: true,
      data: reward,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reward",
      error: err.message,
    });
  }
});

// Create new reward
router.post("/", async (req, res) => {
  try {
    const reward = new Reward({
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon,
      pointsRequired: req.body.pointsRequired,
      rarity: req.body.rarity || "common",
    });

    // Validate required fields
    if (
      !reward.name ||
      !reward.description ||
      !reward.icon ||
      reward.pointsRequired === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (name, description, icon, pointsRequired)",
      });
    }

    const savedReward = await reward.save();
    res.status(201).json({
      success: true,
      data: savedReward,
      message: "Reward created successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create reward",
      error: err.message,
    });
  }
});

// Update reward
router.put("/:id", async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          icon: req.body.icon,
          pointsRequired: req.body.pointsRequired,
          rarity: req.body.rarity,
        },
      },
      { new: true, runValidators: true }
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.json({
      success: true,
      data: reward,
      message: "Reward updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update reward",
      error: err.message,
    });
  }
});

// Delete reward
router.delete("/:id", async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete reward",
      error: err.message,
    });
  }
});

export default router;
