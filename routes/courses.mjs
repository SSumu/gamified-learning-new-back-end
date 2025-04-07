import express from "express";
import Course from "../models/Course.mjs";
import { getDb } from "../config/db.mjs";

const router = express.Router();

// Middleware to validate course ID
const validateCourseId = (req, res, next) => {
  if (!Course.isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course ID format",
    });
  }
  next();
};

// Get all courses
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const courses = await db.collection("courses").find().toArray();

    // Manually populate challenges
    const populatedCourses = await Promise.all(
      courses.map(async (course) => {
        if (course.challenges && course.challenges.length > 0) {
          const challenges = await db
            .collection("challenges")
            .find({
              _id: { $in: course.challenges },
            })
            .toArray();

          return {
            ...course,
            challenges: challenges,
          };
        }
        return course;
      })
    );

    res.status(200).json({
      success: true,
      data: populatedCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
});

// Get single course with populated challenges
router.get("/:id", validateCourseId, async (req, res) => {
  try {
    const db = await getDb();
    const course = await db.collection("courses").findOne({
      _id: db.ObjectId.createFromHexString(req.params.id),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Populate challenges if they exist
    if (course.challenges && course.challenges.length > 0) {
      const challenges = await db
        .collection("challenges")
        .find({
          _id: { $in: course.challenges },
        })
        .toArray();

      course.challenges = challenges;
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
});

// Create course
router.post("/", async (req, res) => {
  try {
    const db = await getDb();
    // Validate input
    const validationErrors = Course.validateCourse(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const courseData = {
      title: req.body.title,
      description: req.body.description,
      instructor: req.body.instructor,
      duration: req.body.duration,
      pointsValue: req.body.pointsValue || 100,
      challenges: [],
      createdAt: new Date(),
    };

    const result = await db.collection("courses").insertOne(courseData);

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...courseData,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Validation Error: " + error.message,
    });
  }
});

// Update course
router.put("/:id", validateCourseId, async (req, res) => {
  try {
    const db = await getDb();
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.instructor) updates.instructor = req.body.instructor;
    if (req.body.duration) updates.duration = req.body.duration;
    if (req.body.pointsValue) updates.pointsValue = req.body.pointsValue;

    const result = await db
      .collection("courses")
      .updateOne(
        { _id: db.ObjectId.createFromHexString(req.params.id) },
        { $set: updates }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const updatedCourse = await db.collection("courses").findOne({
      _id: db.ObjectId.createFromHexString(req.params.id),
    });

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Validation Error: " + error.message,
    });
  }
});

// Delete course
router.delete("/:id", validateCourseId, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("courses").deleteOne({
      _id: db.ObjectId.createFromHexString(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
});

// Add challenge to course
router.post("/:id/challenges", validateCourseId, async (req, res) => {
  try {
    const db = await getDb();

    if (!req.body.challengeId || !db.ObjectId.isValid(req.body.challengeId)) {
      return res.status(400).json({
        success: false,
        message: "Valid challenge ID is required",
      });
    }

    const result = await db.collection("courses").updateOne(
      { _id: db.ObjectId.createFromHexString(req.params.id) },
      {
        $addToSet: {
          challenges: db.ObjectId.createFromHexString(req.body.challengeId),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const updatedCourse = await db.collection("courses").findOne({
      _id: db.ObjectId.createFromHexString(req.params.id),
    });

    // Populate challenges if needed
    if (updatedCourse.challenges && updatedCourse.challenges.length > 0) {
      const challenges = await db
        .collection("challenges")
        .find({
          _id: { $in: updatedCourse.challenges },
        })
        .toArray();

      updatedCourse.challenges = challenges;
    }

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Validation Error: " + error.message,
    });
  }
});

export default router;
