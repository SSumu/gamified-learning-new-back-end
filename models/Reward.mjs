import { getDb } from "../config/db.mjs";

const collectionName = "rewards";

const Reward = {
  // Create a new reward
  create: async (rewardData) => {
    const db = await getDb();
    const result = await db.collection(collectionName).insertOne({
      ...rewardData,
      createdAt: new Date(),
    });
    return result;
  },

  // Find all rewards
  findAll: async (filter = {}) => {
    const db = await getDb();
    return await db.collection(collectionName).find(filter).toArray();
  },

  // Find reward by ID
  findById: async (id) => {
    const db = await getDb();
    return await db.collection(collectionName).findOne({
      _id: db.ObjectId.createFromHexString(id),
    });
  },

  // Update reward
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

  // Delete reward
  delete: async (id) => {
    const db = await getDb();
    const result = await db.collection(collectionName).deleteOne({
      _id: db.ObjectId.createFromHexString(id),
    });
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

  // Validation function
  validateReward: (rewardData) => {
    const errors = [];

    // Name validation
    if (!rewardData.name || rewardData.name.trim().length === 0) {
      errors.push("Reward name is required");
    } else if (rewardData.name.length > 50) {
      errors.push("Name cannot exceed 50 characters");
    }

    // Description validation
    if (!rewardData.description || rewardData.description.trim().length === 0) {
      errors.push("Description is required");
    } else if (rewardData.description.length > 500) {
      errors.push("Description cannot exceed 500 characters");
    }

    // Icon URL validation
    if (!rewardData.icon) {
      errors.push("Icon URL is required");
    } else if (!/^https?:\/\/.+\..+/.test(rewardData.icon)) {
      errors.push("Please enter a valid URL");
    }

    // Points validation
    if (
      rewardData.pointsRequired === undefined ||
      rewardData.pointsRequired === null
    ) {
      errors.push("Points required is mandatory");
    } else if (rewardData.pointsRequired < 0) {
      errors.push("Points cannot be negative");
    }

    // Rarity validation
    if (
      rewardData.rarity &&
      !["common", "rare", "epic", "legendary"].includes(rewardData.rarity)
    ) {
      errors.push("Invalid rarity value");
    }

    return errors.length ? errors : null;
  },
};

export default Reward;
