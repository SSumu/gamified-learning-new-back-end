import express from "express";
import Reward from "../models/Reward.mjs";

const router = express.Router();

// Middleware to validate reward ID
const validateRewardId = (req, res, next) => {
  if (!Reward.isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reward ID format",
    });
  }
  next();
};

// Get all rewards
router.get("/", async (req, res) => {
  try {
    const rewards = await Reward.findAll();
    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rewards",
      error: error.message,
    });
  }
});

// Get single reward
router.get("/:id", validateRewardId, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reward,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reward",
      error: error.message,
    });
  }
});

// Create new reward
router.post("/", async (req, res) => {
  try {
    // Validate input
    const validationErrors = Reward.validateReward(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const rewardData = {
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon,
      pointsRequired: req.body.pointsRequired,
      rarity: req.body.rarity || "common",
    };

    const result = await Reward.create(rewardData);

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...rewardData,
        createdAt: new Date(),
      },
      message: "Reward created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create reward",
      error: error.message,
    });
  }
});

// Update reward
router.put("/:id", validateRewardId, async (req, res) => {
  try {
    // Validate input
    const validationErrors = Reward.validateReward(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const updates = {
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon,
      pointsRequired: req.body.pointsRequired,
      rarity: req.body.rarity || "common",
    };

    const result = await Reward.update(req.params.id, updates);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    const updatedReward = await Reward.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: updatedReward,
      message: "Reward updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update reward",
      error: error.message,
    });
  }
});

// Delete reward
router.delete("/:id", validateRewardId, async (req, res) => {
  try {
    const result = await Reward.delete(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete reward",
      error: error.message,
    });
  }
});

export default router;
