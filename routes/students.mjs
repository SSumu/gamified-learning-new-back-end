import express from "express";
import Student from "../models/Student.mjs";

const router = express.Router();

// Input validation middleware
const validateStudentInput = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, email, password",
    });
  }
  next();
};

// ID validation middleware
const validateObjectId = (req, res, next) => {
  if (!Student.isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }
  next();
};

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
});

// POST create new student
router.post("/", validateStudentInput, async (req, res) => {
  try {
    const { email } = req.body;

    const existingStudent = await Student.findByEmail(email);
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const newStudent = {
      ...req.body,
      points: 0,
      level: 1,
      badges: [],
      enrolledCourses: [],
      completedChallenges: [],
      lastActive: new Date(),
    };

    const result = await Student.create(newStudent);
    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newStudent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create student",
      error: error.message,
    });
  }
});

// GET single student
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve student",
      error: error.message,
    });
  }
});

// PUT update student
router.put("/:id", validateObjectId, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    delete updates.email;

    const result = await Student.update(req.params.id, updates);
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const updatedStudent = await Student.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message,
    });
  }
});

// DELETE student
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const result = await Student.delete(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  }
});

// POST add badge to student
router.post("/:id/badges", validateObjectId, async (req, res) => {
  try {
    const { badgeId } = req.body;
    if (!badgeId || !Student.isValidId(badgeId)) {
      return res.status(400).json({
        success: false,
        message: "Valid badge ID is required",
      });
    }

    const result = await Student.addBadge(req.params.id, badgeId);
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const updatedStudent = await Student.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add badge",
      error: error.message,
    });
  }
});

export default router;
