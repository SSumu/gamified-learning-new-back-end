import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Reward name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  icon: {
    type: String,
    required: [true, "Icon URL is required"],
    match: [/^https?:\/\/.+\..+/, "Please enter a valid URL"],
  },
  pointsRequired: {
    type: Number,
    required: [true, "Points required is mandatory"],
    min: [0, "Points cannot be negative"],
  },
  rarity: {
    type: String,
    enum: {
      values: ["common", "rare", "epic", "legendary"],
      message: "{VALUE} is not a valid rarity",
    },
    default: "common",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

// Add index for better query performance
rewardSchema.index({ pointsRequired: 1, rarity: 1 });

export default mongoose.model("Reward", rewardSchema);
