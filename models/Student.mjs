import { getDb } from "../config/db.mjs";

// No need to import ObjectId separately in the model
// We'll use the one from the MongoDB client instance

const collectionName = "students";

const Student = {
  // Create a new student
  create: async (studentData) => {
    const db = await getDb();
    const result = await db.collection(collectionName).insertOne(studentData);
    return result;
  },

  // Find all students
  findAll: async (query = {}) => {
    const db = await getDb();
    return await db.collection(collectionName).find(query).toArray();
  },

  // Find student by ID
  findById: async (id) => {
    const db = await getDb();
    return await db.collection(collectionName).findOne({
      _id: db.ObjectId.createFromHexString(id),
    });
  },

  // Update student
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

  // Delete student
  delete: async (id) => {
    const db = await getDb();
    const result = await db.collection(collectionName).deleteOne({
      _id: db.ObjectId.createFromHexString(id),
    });
    return result;
  },

  // Add badge to student
  addBadge: async (studentId, badgeId) => {
    const db = await getDb();
    const result = await db
      .collection(collectionName)
      .updateOne(
        { _id: db.ObjectId.createFromHexString(studentId) },
        { $addToSet: { badges: db.ObjectId.createFromHexString(badgeId) } }
      );
    return result;
  },

  // Find by email
  findByEmail: async (email) => {
    const db = await getDb();
    return await db.collection(collectionName).findOne({ email });
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
};

export default Student;
