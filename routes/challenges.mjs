import express from "express";
import Challenge from "../models/Challenge.mjs";
import Course from "../models/Course.mjs";
import Reward from "../models/Reward.mjs";

const router = express.Router();

// GET all challenges with optional filtering
router.get("/", async (req, res) => {
  try {
    const { course, isActive } = req.query;
    const filter = {};

    if (course) filter.course = course;
    if (isActive) filter.isActive = isActive === "true";

    const challenges = await Challenge.find(filter)
      .populate("course", "title instructor")
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: challenges.length,
      data: challenges,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    });
  }
});

// GET single challenge by ID
router.get("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate(
      "course",
      "title description pointsValue"
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    res.json({
      success: true,
      data: challenge,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    });
  }
});

// POST create new challenge
router.post("/", async (req, res) => {
  try {
    // Validate course exists
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID",
      });
    }

    const challenge = new Challenge({
      title: req.body.title,
      description: req.body.description,
      course: req.body.course,
      points: req.body.points || course.pointsValue * 0.2, // Default to 20% of course points
      dueDate: req.body.dueDate,
      isActive: req.body.isActive !== false, // Default true
      completionCriteria: req.body.completionCriteria,
    });

    await challenge.save();

    // Add challenge to course's challenges array
    course.challenges.push(challenge._id);
    await course.save();

    res.status(201).json({
      success: true,
      data: challenge,
      message: "Challenge created successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Validation Error: " + err.message,
    });
  }
});

// PUT update challenge
router.put("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        points: req.body.points,
        dueDate: req.body.dueDate,
        isActive: req.body.isActive,
        completionCriteria: req.body.completionCriteria,
      },
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    res.json({
      success: true,
      data: challenge,
      message: "Challenge updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Validation Error: " + err.message,
    });
  }
});

// DELETE challenge
router.delete("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    // Remove challenge from course's challenges array
    await Course.findByIdAndUpdate(challenge.course, {
      $pull: { challenges: challenge._id },
    });

    res.json({
      success: true,
      message: "Challenge deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    });
  }
});

// PATCH toggle challenge active status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    challenge.isActive = !challenge.isActive;
    await challenge.save();

    res.json({
      success: true,
      data: challenge,
      message: `Challenge marked as ${
        challenge.isActive ? "active" : "inactive"
      }`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + err.message,
    });
  }
});

export default router;
