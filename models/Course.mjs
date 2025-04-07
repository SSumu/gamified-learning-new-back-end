import { getDb } from "../config/db.mjs";

const collectionName = "courses";

const Course = {
  // Create a new course
  create: async (courseData) => {
    const db = await getDb();
    const result = await db.collection(collectionName).insertOne({
      ...courseData,
      challenges: [],
      createdAt: new Date(),
    });
    return result;
  },

  // Find all courses
  findAll: async () => {
    const db = await getDb();
    return await db.collection(collectionName).find().toArray();
  },

  // Find course by ID
  findById: async (id) => {
    const db = await getDb();
    return await db.collection(collectionName).findOne({
      _id: db.ObjectId.createFromHexString(id),
    });
  },

  // Update course
  update: async (id, updates) => {
    const db = await getDb();
    const result = await db
      .collection(collectionName)
      .updateOne(
        { _id: db.ObjectId.createFromHexString(id) },
        { $set: updates }
      );
    return result;
  },

  // Delete course
  delete: async (id) => {
    const db = await getDb();
    const result = await db.collection(collectionName).deleteOne({
      _id: db.ObjectId.createFromHexString(id),
    });
    return result;
  },

  // Add challenge to course
  addChallenge: async (courseId, challengeId) => {
    const db = await getDb();
    const result = await db
      .collection(collectionName)
      .updateOne(
        { _id: db.ObjectId.createFromHexString(courseId) },
        {
          $addToSet: {
            challenges: db.ObjectId.createFromHexString(challengeId),
          },
        }
      );
    return result;
  },

  // Remove challenge from course
  removeChallenge: async (courseId, challengeId) => {
    const db = await getDb();
    const result = await db
      .collection(collectionName)
      .updateOne(
        { _id: db.ObjectId.createFromHexString(courseId) },
        { $pull: { challenges: db.ObjectId.createFromHexString(challengeId) } }
      );
    return result;
  },

  // Get course with populated challenges
  findWithChallenges: async (id) => {
    const db = await getDb();
    const course = await this.findById(id);
    if (!course) return null;

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
  },

  // Check if ID is valid
  isValidId: (id) => {
    try {
      const db = getDb();
      db.ObjectId.createFromHexString(id);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Validation function
  validateCourse: (courseData) => {
    const errors = [];
    if (!courseData.title) errors.push("Title is required");
    if (!courseData.description) errors.push("Description is required");
    if (!courseData.instructor) errors.push("Instructor is required");
    if (!courseData.duration || courseData.duration <= 0) {
      errors.push("Duration must be a positive number");
    }
    if (courseData.pointsValue && courseData.pointsValue <= 0) {
      errors.push("Points value must be positive");
    }
    return errors.length ? errors : null;
  },
};

export default Course;
