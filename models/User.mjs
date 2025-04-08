import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  courses: [
    {
      type: String,
      enum: [
        "JavaScript",
        "React",
        "Node.js",
        "CSS",
        "Python",
        "HTML",
        "C#",
        ".NET",
      ],
      required: true,
    },
  ],
  skillProgress: {
    type: String,
    default: "Beginner",
  },
});

export default mongoose.model("User", userSchema);
