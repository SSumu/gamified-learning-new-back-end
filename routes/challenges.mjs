import express from "express";
import Challenge from "../models/Challenge.mjs";
import Course from "../models/Course.mjs";

const router = express.Router();

// Middleware to validate challenge ID
const validateChallengeId = (req, res, next) => {
  if (!Challenge.isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid challenge ID format",
    });
  }
  next();
};

// GET all challenges with optional filtering
router.get("/", async (req, res) => {
  try {
    const { course, isActive } = req.query;
    const filter = {};

    if (course && Challenge.isValidId(course)) {
      filter.course = course;
    }
    if (isActive) {
      filter.isActive = isActive === "true";
    }

    const challenges = await Challenge.findAll(filter);

    // For native driver, we need to manually populate course data
    const populatedChallenges = await Promise.all(
      challenges.map(async (challenge) => {
        if (challenge.course) {
          const course = await Course.findById(challenge.course);
          return {
            ...challenge,
            course: {
              _id: course._id,
              title: course.title,
              instructor: course.instructor,
            },
          };
        }
        return challenge;
      })
    );

    res.status(200).json({
      success: true,
      count: populatedChallenges.length,
      data: populatedChallenges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
});

// GET single challenge by ID
router.get("/:id", validateChallengeId, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    // Manually populate course data
    if (challenge.course) {
      const course = await Course.findById(challenge.course);
      challenge.course = {
        _id: course._id,
        title: course.title,
        description: course.description,
        pointsValue: course.pointsValue,
      };
    }

    res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
});

// POST create new challenge
router.post("/", async (req, res) => {
  try {
    // Validate input
    const validationErrors = Challenge.validateChallenge(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    // Validate course exists
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID",
      });
    }

    // Calculate default points if not provided
    const points = req.body.points || course.pointsValue * 0.2;

    const newChallenge = {
      title: req.body.title,
      description: req.body.description,
      course: req.body.course,
      points: points,
      dueDate: req.body.dueDate,
      isActive: req.body.isActive !== false,
      completionCriteria: req.body.completionCriteria,
      createdAt: new Date(),
    };

    const result = await Challenge.create(newChallenge);

    // Add challenge to course's challenges array
    await Challenge.addToCourse(result.insertedId, req.body.course);

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newChallenge,
      },
      message: "Challenge created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Validation Error: " + error.message,
    });
  }
});

// PUT update challenge
router.put("/:id", validateChallengeId, async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      points: req.body.points,
      dueDate: req.body.dueDate,
      isActive: req.body.isActive,
      completionCriteria: req.body.completionCriteria,
    };

    const result = await Challenge.update(req.params.id, updates);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    const updatedChallenge = await Challenge.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: updatedChallenge,
      message: "Challenge updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Validation Error: " + error.message,
    });
  }
});

// DELETE challenge
router.delete("/:id", validateChallengeId, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    // Remove challenge from course first
    await Challenge.removeFromCourse(req.params.id, challenge.course);

    // Then delete the challenge
    await Challenge.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Challenge deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
});

// PATCH toggle challenge active status
router.patch("/:id/toggle", validateChallengeId, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Challenge not found",
      });
    }

    const result = await Challenge.toggleActive(req.params.id);

    const updatedChallenge = await Challenge.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: updatedChallenge,
      message: `Challenge marked as ${
        updatedChallenge.isActive ? "active" : "inactive"
      }`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
});

export default router;
