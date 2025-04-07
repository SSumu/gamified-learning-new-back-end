import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    points: {
      type: Number,
      required: [true, "Points value is required"],
      min: [0, "Points cannot be negative"],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > Date.now();
        },
        message: "Due date must be in the future",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    completionCriteria: {
      type: String,
      required: [true, "Completion criteria is required"],
      enum: {
        values: ["quiz", "assignment", "participation", "other"],
        message: "{VALUE} is not a valid criteria",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
challengeSchema.index({ course: 1, isActive: 1 });
challengeSchema.index({ dueDate: 1 });

// Virtual property for days remaining
challengeSchema.virtual("daysRemaining").get(function () {
  if (!this.dueDate) return null;
  const diff = this.dueDate - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

export default mongoose.model("Challenge", challengeSchema);
