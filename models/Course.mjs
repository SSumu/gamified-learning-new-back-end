import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  duration: { type: Number, required: true }, // in weeks
  pointsValue: { type: Number, default: 100 },
  challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }],
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
