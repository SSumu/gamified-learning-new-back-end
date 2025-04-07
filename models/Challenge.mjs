import { getDb } from "../config/db.mjs";

const collectionName = "challenges";

const Challenge = {
  // Create a new challenge
  create: async (challengeData) => {
    const db = await getDb();
    const result = await db.collection(collectionName).insertOne(challengeData);
    return result;
  },

  // Find all challenges with optional filtering
  findAll: async (filter = {}) => {
    const db = await getDb();
    return await db.collection(collectionName).find(filter).toArray();
  },

  // Find challenge by ID
  findById: async (id) => {
    const db = await getDb();
    return await db.collection(collectionName).findOne({
      _id: db.ObjectId.createFromHexString(id),
    });
  },

  // Update challenge
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

  // Delete challenge
  delete: async (id) => {
    const db = await getDb();
    const result = await db.collection(collectionName).deleteOne({
      _id: db.ObjectId.createFromHexString(id),
    });
    return result;
  },

  // Toggle active status
  toggleActive: async (id) => {
    const db = await getDb();
    const challenge = await this.findById(id);
    if (!challenge) return null;

    const result = await db
      .collection(collectionName)
      .updateOne(
        { _id: db.ObjectId.createFromHexString(id) },
        { $set: { isActive: !challenge.isActive } }
      );
    return result;
  },

  // Add challenge to course
  addToCourse: async (challengeId, courseId) => {
    const db = await getDb();
    const result = await db
      .collection("courses")
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
  removeFromCourse: async (challengeId, courseId) => {
    const db = await getDb();
    const result = await db
      .collection("courses")
      .updateOne(
        { _id: db.ObjectId.createFromHexString(courseId) },
        { $pull: { challenges: db.ObjectId.createFromHexString(challengeId) } }
      );
    return result;
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

  // Validation functions
  validateChallenge: (challengeData) => {
    const errors = [];
    if (!challengeData.title || challengeData.title.length > 100) {
      errors.push("Title is required and must be <= 100 characters");
    }
    if (!challengeData.description) {
      errors.push("Description is required");
    }
    if (!challengeData.course) {
      errors.push("Course reference is required");
    }
    if (!challengeData.points || challengeData.points < 0) {
      errors.push("Points value is required and must be >= 0");
    }
    if (
      challengeData.dueDate &&
      new Date(challengeData.dueDate) <= new Date()
    ) {
      errors.push("Due date must be in the future");
    }
    if (
      !["quiz", "assignment", "participation", "other"].includes(
        challengeData.completionCriteria
      )
    ) {
      errors.push("Invalid completion criteria");
    }
    return errors.length ? errors : null;
  },
};

export default Challenge;
