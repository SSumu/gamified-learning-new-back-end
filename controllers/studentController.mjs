import Student from "../models/Student.mjs";

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate(
      "badges enrolledCourses completedChallenges"
    );
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single student
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "badges enrolledCourses completedChallenges"
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create student
export const createStudent = async (req, res) => {
  const student = new Student({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (req.body.name) student.name = req.body.name;
    if (req.body.email) student.email = req.body.email;
    if (req.body.password) student.password = req.body.password;
    if (req.body.points) student.points = req.body.points;
    if (req.body.level) student.level = req.body.level;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.remove();
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add badge to student
export const addBadge = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.badges.includes(req.body.badgeId)) {
      student.badges.push(req.body.badgeId);
      await student.save();
    }

    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
